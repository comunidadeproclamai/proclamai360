import { auditAction } from '../lib/audit.js';
import { getAuthenticatedUser, requireRole } from '../lib/auth.js';
import { createHttpError, methodNotAllowed, sendJson } from '../lib/http.js';
import { prisma, requireDatabase } from '../lib/prisma.js';

export async function settingsHandler(req, res) {
  requireDatabase();
  const authenticatedUser = await getAuthenticatedUser(req);

  if (req.method === 'GET') {
    let config = await prisma.systemConfig.findFirst();
    if (!config) {
      config = await prisma.systemConfig.create({
        data: {
          churchName: 'Comunidade Proclamai',
          street: 'Avenida Principal, 360 - Centro',
        },
      });
    }
    return sendJson(res, 200, config);
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    requireRole(authenticatedUser, 'admin');

    const { churchName, street } = req.body || {};
    if (!churchName) {
      throw createHttpError(400, 'validation_error', 'O nome da congregacao e obrigatorio.');
    }

    const existing = await prisma.systemConfig.findFirst();
    const data = { churchName, street: street || null };
    const config = existing
      ? await prisma.systemConfig.update({ where: { id: existing.id }, data })
      : await prisma.systemConfig.create({ data });

    await auditAction(authenticatedUser, 'settings.update', {
      configId: config.id,
      churchName: config.churchName,
    });

    return sendJson(res, 200, config);
  }

  return methodNotAllowed(res, ['GET', 'POST', 'PUT']);
}
