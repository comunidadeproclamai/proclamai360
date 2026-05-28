import { getAuthenticatedUser, requirePermission } from '../../lib/auth.js';
import { createHttpError, methodNotAllowed, sendJson } from '../../lib/http.js';
import { PERMISSIONS } from '../../lib/permissions.js';
import { requireDatabase } from '../../lib/prisma.js';
import {
  checkinChild,
  checkoutChild,
  createChild,
  createGuardianOption,
  listActiveCheckins,
  listChildren,
  listCheckinHistory,
  listGuardianOptions,
} from './infantil.service.js';

async function ensureChildrenReader(req) {
  requireDatabase();
  const authenticatedUser = await getAuthenticatedUser(req);
  requirePermission(authenticatedUser, PERMISSIONS.CHILDREN_READ);
  return authenticatedUser;
}

async function ensureChildrenManager(req) {
  requireDatabase();
  const authenticatedUser = await getAuthenticatedUser(req);
  requirePermission(authenticatedUser, PERMISSIONS.CHILDREN_WRITE);
  return authenticatedUser;
}

export async function handleLive(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  await ensureChildrenReader(req);

  res.setHeader('Cache-Control', 'private, no-store');
  return sendJson(res, 200, await listActiveCheckins());
}

export async function handleChildren(req, res) {
  if (req.method === 'GET') {
    await ensureChildrenReader(req);
    return sendJson(res, 200, await listChildren(req.query));
  }

  if (req.method === 'POST') {
    const authenticatedUser = await ensureChildrenManager(req);
    return sendJson(res, 201, await createChild(authenticatedUser, req.body));
  }

  return methodNotAllowed(res, ['GET', 'POST']);
}

export async function handleHistory(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  await ensureChildrenReader(req);
  return sendJson(res, 200, await listCheckinHistory(req.query));
}

export async function handleGuardians(req, res) {
  if (req.method === 'GET') {
    await ensureChildrenReader(req);
    return sendJson(res, 200, await listGuardianOptions(req.query));
  }

  if (req.method === 'POST') {
    const authenticatedUser = await ensureChildrenManager(req);
    return sendJson(res, 201, await createGuardianOption(authenticatedUser, req.body));
  }

  return methodNotAllowed(res, ['GET', 'POST']);
}

export async function handleCheckin(req, res) {
  const authenticatedUser = await ensureChildrenManager(req);

  if (req.method === 'POST') {
    return sendJson(res, 201, await checkinChild(authenticatedUser, req.body));
  }

  if (req.method === 'DELETE' || req.method === 'PATCH') {
    const id = req.query.id || req.body?.id;
    if (!id) {
      throw createHttpError(400, 'validation_error', 'ID do check-in e obrigatorio.');
    }

    return sendJson(res, 200, await checkoutChild(authenticatedUser, id, {
      securityCode: req.body?.securityCode || req.query.securityCode,
    }));
  }

  return methodNotAllowed(res, ['POST', 'DELETE', 'PATCH']);
}
