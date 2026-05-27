import { getAuthenticatedUser, requirePermission } from '../../lib/auth.js';
import { methodNotAllowed, sendJson } from '../../lib/http.js';
import { PERMISSIONS } from '../../lib/permissions.js';
import { requireDatabase } from '../../lib/prisma.js';
import {
  createUser,
  listAuditLogs,
  listUsers,
  resetUserPassword,
  updateUserRole,
} from './users.service.js';

async function ensureUserManager(req) {
  requireDatabase();
  const authenticatedUser = await getAuthenticatedUser(req);
  requirePermission(authenticatedUser, PERMISSIONS.USERS_MANAGE);
  return authenticatedUser;
}

export async function handleCurrentUser(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  return sendJson(res, 200, { user: await getAuthenticatedUser(req) });
}

export async function handleListUsers(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  await ensureUserManager(req);
  return sendJson(res, 200, await listUsers());
}

export async function handleUpdateUserRole(req, res) {
  if (req.method !== 'PATCH' && req.method !== 'PUT') {
    return methodNotAllowed(res, ['PATCH', 'PUT']);
  }

  const authenticatedUser = await ensureUserManager(req);
  return sendJson(res, 200, await updateUserRole(authenticatedUser, req.body));
}

export async function handleCreateUser(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  const authenticatedUser = await ensureUserManager(req);
  return sendJson(res, 201, await createUser(authenticatedUser, req.body));
}

export async function handleResetUserPassword(req, res) {
  if (req.method !== 'PATCH' && req.method !== 'PUT') {
    return methodNotAllowed(res, ['PATCH', 'PUT']);
  }

  const authenticatedUser = await ensureUserManager(req);
  return sendJson(res, 200, await resetUserPassword(authenticatedUser, req.body));
}

export async function handleAuditLogs(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  await ensureUserManager(req);
  return sendJson(res, 200, await listAuditLogs(req.query));
}
