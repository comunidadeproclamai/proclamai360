import bcrypt from 'bcryptjs';
import { auditAction } from '../../lib/audit.js';
import { createHttpError } from '../../lib/http.js';
import { ROLE_LABELS, ROLES, isValidRole, normalizeRole } from '../../lib/permissions.js';
import { prisma } from '../../lib/prisma.js';
import {
  assertStrongEnoughPassword,
  assertValidEmail,
  normalizeEmail,
  requireFields,
} from '../../lib/validation.js';

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
};

function getRoleOptions() {
  return Object.values(ROLES).map((value) => ({
    value,
    label: ROLE_LABELS[value],
  }));
}

export async function listUsers() {
  const users = await prisma.user.findMany({
    orderBy: { name: 'asc' },
    select: {
      ...USER_SELECT,
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

  return {
    data: users,
    roles: getRoleOptions(),
  };
}

export async function updateUserRole(actor, payload) {
  const { userId, role } = payload || {};
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
    select: USER_SELECT,
  });

  await auditAction(actor, 'user.role.update', {
    userId: user.id,
    previousRole: targetUser.role,
    nextRole: user.role,
  });

  return { user };
}

export async function createUser(actor, payload) {
  const body = payload || {};
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
    select: USER_SELECT,
  });

  await auditAction(actor, 'user.create', {
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return { user };
}

export async function resetUserPassword(actor, payload) {
  const { userId, password } = payload || {};
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

  await auditAction(actor, 'user.password.reset', {
    userId: targetUser.id,
    email: targetUser.email,
  });

  return { success: true };
}

export async function listAuditLogs(query = {}) {
  const { event, userId } = query;
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

  return {
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
  };
}
