import bcrypt from 'bcryptjs';
import { auditAction } from '../lib/audit.js';
import { getAuthenticatedUser, requirePermission } from '../lib/auth.js';
import { createHttpError, methodNotAllowed, sendJson } from '../lib/http.js';
import { PERMISSIONS, ROLE_LABELS, ROLES, isValidRole, normalizeRole } from '../lib/permissions.js';
import { prisma, requireDatabase } from '../lib/prisma.js';
import {
  assertStrongEnoughPassword,
  assertValidEmail,
  normalizeEmail,
  requireFields,
} from '../lib/validation.js';

async function handleCurrentUser(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  return sendJson(res, 200, { user: await getAuthenticatedUser(req) });
}

async function handleListUsers(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  requireDatabase();

  const authenticatedUser = await getAuthenticatedUser(req);
  requirePermission(authenticatedUser, PERMISSIONS.USERS_MANAGE);

  const users = await prisma.user.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      member: {
        select: {
          id: true,
          name: true,
          status: true,
          congregation: true,
        },
      },
    },
  });

  return sendJson(res, 200, {
    data: users,
    roles: Object.values(ROLES).map((value) => ({
      value,
      label: ROLE_LABELS[value],
    })),
  });
}

async function handleUpdateUserRole(req, res) {
  if (req.method !== 'PATCH' && req.method !== 'PUT') {
    return methodNotAllowed(res, ['PATCH', 'PUT']);
  }
  requireDatabase();

  const authenticatedUser = await getAuthenticatedUser(req);
  requirePermission(authenticatedUser, PERMISSIONS.USERS_MANAGE);

  const { userId, role } = req.body || {};
  if (!userId || !role) {
    throw createHttpError(400, 'validation_error', 'userId e role sao obrigatorios.');
  }

  if (!isValidRole(role)) {
    throw createHttpError(400, 'invalid_role', 'Perfil de usuario invalido.');
  }

  const normalizedRole = normalizeRole(role);
  const adminCount = await prisma.user.count({ where: { role: ROLES.ADMIN } });
  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true },
  });

  if (!targetUser) {
    throw createHttpError(404, 'not_found', 'Usuario nao encontrado.');
  }

  if (targetUser.role === ROLES.ADMIN && normalizedRole !== ROLES.ADMIN && adminCount <= 1) {
    throw createHttpError(400, 'last_admin', 'Mantenha pelo menos um administrador ativo.');
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { role: normalizedRole },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  await auditAction(authenticatedUser, 'user.role.update', {
    userId: user.id,
    previousRole: targetUser.role,
    nextRole: user.role,
  });

  return sendJson(res, 200, { user });
}

async function handleCreateUser(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  requireDatabase();

  const authenticatedUser = await getAuthenticatedUser(req);
  requirePermission(authenticatedUser, PERMISSIONS.USERS_MANAGE);

  const body = req.body || {};
  requireFields(body, ['name', 'email', 'password', 'role']);

  const email = normalizeEmail(body.email);
  assertValidEmail(email);
  assertStrongEnoughPassword(body.password);

  if (!isValidRole(body.role)) {
    throw createHttpError(400, 'invalid_role', 'Perfil de usuario invalido.');
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    throw createHttpError(409, 'email_already_registered', 'Este e-mail ja esta cadastrado.');
  }

  const user = await prisma.user.create({
    data: {
      name: String(body.name).trim(),
      email,
      password: await bcrypt.hash(body.password, 10),
      role: normalizeRole(body.role),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  await auditAction(authenticatedUser, 'user.create', {
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return sendJson(res, 201, { user });
}

async function handleResetUserPassword(req, res) {
  if (req.method !== 'PATCH' && req.method !== 'PUT') {
    return methodNotAllowed(res, ['PATCH', 'PUT']);
  }
  requireDatabase();

  const authenticatedUser = await getAuthenticatedUser(req);
  requirePermission(authenticatedUser, PERMISSIONS.USERS_MANAGE);

  const { userId, password } = req.body || {};
  requireFields({ userId, password }, ['userId', 'password']);
  assertStrongEnoughPassword(password);

  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true },
  });

  if (!targetUser) {
    throw createHttpError(404, 'not_found', 'Usuario nao encontrado.');
  }

  await prisma.user.update({
    where: { id: userId },
    data: { password: await bcrypt.hash(password, 10) },
  });

  await auditAction(authenticatedUser, 'user.password.reset', {
    userId: targetUser.id,
    email: targetUser.email,
  });

  return sendJson(res, 200, { success: true });
}

async function handleAuditLogs(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  requireDatabase();

  const authenticatedUser = await getAuthenticatedUser(req);
  requirePermission(authenticatedUser, PERMISSIONS.USERS_MANAGE);

  const { event, userId } = req.query || {};
  const where = {
    ...(event ? { action: { contains: event, mode: 'insensitive' } } : {}),
    ...(userId ? { userId } : {}),
  };

  const logs = await prisma.auditLog.findMany({
    where,
    take: 100,
    orderBy: { timestamp: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return sendJson(res, 200, {
    data: logs.map((log) => {
      let details = {};
      try {
        details = JSON.parse(log.details || '{}');
      } catch {
        details = { raw: log.details };
      }

      return {
        id: log.id,
        action: log.action,
        details,
        timestamp: log.timestamp,
        user: log.user,
      };
    }),
  });
}

export function usersHandler(req, res) {
  if (req.query.action === 'me') {
    return handleCurrentUser(req, res);
  }

  if (req.query.action === 'list') {
    return handleListUsers(req, res);
  }

  if (req.query.action === 'role') {
    return handleUpdateUserRole(req, res);
  }

  if (req.query.action === 'create') {
    return handleCreateUser(req, res);
  }

  if (req.query.action === 'password') {
    return handleResetUserPassword(req, res);
  }

  if (req.query.action === 'audit') {
    return handleAuditLogs(req, res);
  }

  return sendJson(res, 404, {
    error: 'not_found',
    message: 'Rota de usuario nao encontrada.',
  });
}
