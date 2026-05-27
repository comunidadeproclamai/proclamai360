import { auditAction } from '../lib/audit.js';
import { getAuthenticatedUser, requireRole } from '../lib/auth.js';
import { createHttpError, methodNotAllowed, sendJson } from '../lib/http.js';
import { prisma, requireDatabase } from '../lib/prisma.js';

export async function membersHandler(req, res) {
  requireDatabase();
  const authenticatedUser = await getAuthenticatedUser(req);

  if (req.method === 'GET') {
    const { page = 1, limit = 10, search, status } = req.query;
    const whereClause = {
      AND: [
        status && status !== 'ALL' ? { status } : {},
        search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {},
      ],
    };

    const [members, total] = await Promise.all([
      prisma.member.findMany({
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        where: whereClause,
        orderBy: { name: 'asc' },
      }),
      prisma.member.count({ where: whereClause }),
    ]);

    return sendJson(res, 200, {
      data: members,
      meta: {
        total,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  }

  if (req.method === 'POST') {
    requireRole(authenticatedUser, 'admin');

    const body = req.body || {};
    if (!body.name) {
      throw createHttpError(400, 'validation_error', 'O nome e obrigatorio.');
    }

    const member = await prisma.member.create({
      data: {
        name: body.name,
        email: body.email || null,
        phone: body.phone || null,
        status: body.status || 'ACTIVE',
        congregation: body.congregation || null,
      },
    });

    await auditAction(authenticatedUser, 'member.create', {
      memberId: member.id,
      name: member.name,
    });

    return sendJson(res, 201, member);
  }

  return methodNotAllowed(res, ['GET', 'POST']);
}

export async function memberByIdHandler(req, res) {
  requireDatabase();
  const authenticatedUser = await getAuthenticatedUser(req);
  const { id } = req.query;

  if (req.method === 'PUT') {
    requireRole(authenticatedUser, 'admin');

    const member = await prisma.member.update({ where: { id }, data: req.body });
    await auditAction(authenticatedUser, 'member.update', {
      memberId: member.id,
      name: member.name,
    });
    return sendJson(res, 200, member);
  }

  if (req.method === 'DELETE') {
    requireRole(authenticatedUser, 'admin');

    const member = await prisma.member.update({
      where: { id },
      data: { status: 'DISMISSED' },
    });
    await auditAction(authenticatedUser, 'member.dismiss', {
      memberId: member.id,
      name: member.name,
    });
    return sendJson(res, 200, { message: 'Membro inativado com sucesso.', data: member });
  }

  return methodNotAllowed(res, ['PUT', 'DELETE']);
}
