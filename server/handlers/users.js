import { auditAction } from '../lib/audit.js';
import { getAuthenticatedUser, requirePermission } from '../lib/auth.js';
import { createHttpError, methodNotAllowed, sendJson } from '../lib/http.js';
import { PERMISSIONS, ROLE_LABELS, ROLES, isValidRole, normalizeRole } from '../lib/permissions.js';
import { prisma, requireDatabase } from '../lib/prisma.js';

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

  return sendJson(res, 404, {
    error: 'not_found',
    message: 'Rota de usuario nao encontrada.',
  });
}
