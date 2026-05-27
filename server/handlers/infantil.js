import { getAuthenticatedUser } from '../lib/auth.js';
import { createHttpError, methodNotAllowed, sendJson } from '../lib/http.js';
import { prisma, requireDatabase } from '../lib/prisma.js';

function generateSecurityCode() {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

async function resolveOperator(req) {
  return getAuthenticatedUser(req);
}

async function handleLive(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  requireDatabase();
  await getAuthenticatedUser(req);

  res.setHeader('Cache-Control', 'public, s-maxage=5, stale-while-revalidate=59');

  const cutoff = new Date();
  cutoff.setHours(cutoff.getHours() - 16);

  const activeCheckins = await prisma.childCheckin.findMany({
    where: {
      checkoutTime: null,
      checkinTime: { gte: cutoff },
    },
    include: {
      child: { select: { id: true, name: true, allergies: true, birthDate: true } },
      guardian: { select: { name: true } },
    },
    orderBy: { checkinTime: 'desc' },
  });

  return sendJson(res, 200, activeCheckins);
}

async function handleCheckin(req, res) {
  requireDatabase();
  const authenticatedUser = await resolveOperator(req);

  if (req.method === 'POST') {
    const { childId, guardianId, checkedInById, name, age, allergies } = req.body || {};
    let finalChildId = childId;
    let finalGuardianId = guardianId;
    let finalCheckedInById = checkedInById || authenticatedUser.id;

    if (!finalChildId || !finalGuardianId) {
      if (!name || !age) {
        throw createHttpError(400, 'validation_error', 'Informe childId/guardianId ou name/age.');
      }

      const calculatedAge = Number(age);
      const birthDate = new Date();
      birthDate.setFullYear(birthDate.getFullYear() - calculatedAge);

      let child = await prisma.child.findFirst({ where: { name } });
      if (!child) {
        child = await prisma.child.create({
          data: { name, birthDate, allergies: allergies || null },
        });
      } else if (allergies !== undefined && child.allergies !== allergies) {
        child = await prisma.child.update({
          where: { id: child.id },
          data: { allergies: allergies || null },
        });
      }

      let guardian = await prisma.member.findFirst({
        where: { name: 'Responsavel Geral/Visitante' },
      });
      if (!guardian) {
        guardian = await prisma.member.create({
          data: {
            name: 'Responsavel Geral/Visitante',
            status: 'ACTIVE',
            congregation: 'Sede',
          },
        });
      }

      finalChildId = child.id;
      finalGuardianId = guardian.id;
    }

    let code = generateSecurityCode();
    for (let attempts = 0; attempts < 3; attempts++) {
      const existing = await prisma.childCheckin.findFirst({
        where: { securityCode: code, checkoutTime: null },
      });
      if (!existing) break;
      code = generateSecurityCode();
    }

    const checkin = await prisma.childCheckin.create({
      data: {
        securityCode: code,
        childId: finalChildId,
        guardianId: finalGuardianId,
        checkedInById: finalCheckedInById,
      },
    });

    return sendJson(res, 201, checkin);
  }

  if (req.method === 'DELETE' || req.method === 'PATCH') {
    const id = req.query.id || req.body?.id;
    if (!id) {
      throw createHttpError(400, 'validation_error', 'ID do check-in e obrigatorio.');
    }

    const checkin = await prisma.childCheckin.update({
      where: { id },
      data: {
        checkoutTime: new Date(),
        checkedOutById: authenticatedUser.id,
      },
    });

    return sendJson(res, 200, checkin);
  }

  return methodNotAllowed(res, ['POST', 'DELETE', 'PATCH']);
}

export function infantilHandler(req, res) {
  if (req.query.action === 'live') {
    return handleLive(req, res);
  }

  if (req.query.action === 'checkin') {
    return handleCheckin(req, res);
  }

  return sendJson(res, 404, {
    error: 'not_found',
    message: 'Rota infantil nao encontrada.',
  });
}
