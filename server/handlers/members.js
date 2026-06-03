import { auditAction } from '../lib/audit.js';
import { getAuthenticatedUser, requirePermission } from '../lib/auth.js';
import { createHttpError, methodNotAllowed, sendJson } from '../lib/http.js';
import { PERMISSIONS } from '../lib/permissions.js';
import { prisma, requireDatabase } from '../lib/prisma.js';

function extractMemberData(body) {
  return {
    name: body.name,
    email: body.email || null,
    phone: body.phone || null,
    cpf: body.cpf || null,
    birthDate: body.birthDate ? new Date(body.birthDate) : null,
    gender: body.gender || null,
    photoUrl: body.photoUrl || null,
    street: body.street || null,
    number: body.number || null,
    complement: body.complement || null,
    neighborhood: body.neighborhood || null,
    city: body.city || null,
    state: body.state || null,
    zipCode: body.zipCode || null,
    status: body.status || 'ACTIVE',
    baptismDate: body.baptismDate ? new Date(body.baptismDate) : null,
    membershipDate: body.membershipDate ? new Date(body.membershipDate) : null,
    congregation: body.congregation || null,
    notes: body.notes || null,
  };
}

export async function membersHandler(req, res) {
  requireDatabase();
  const authenticatedUser = await getAuthenticatedUser(req);

  if (req.method === 'GET') {
    requirePermission(authenticatedUser, PERMISSIONS.MEMBERS_READ);

    const { page = 1, limit = 10, search, status } = req.query;
    const whereClause = {
      AND: [
        status && status !== 'ALL' ? { status } : {},
        search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { cpf: { contains: search } },
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
    requirePermission(authenticatedUser, PERMISSIONS.MEMBERS_WRITE);

    const body = req.body || {};
    if (!body.name) {
      throw createHttpError(400, 'validation_error', 'O nome é obrigatório.');
    }

    if (body.cpf) {
      const existingCpf = await prisma.member.findUnique({ where: { cpf: body.cpf } });
      if (existingCpf) throw createHttpError(400, 'validation_error', 'CPF já cadastrado.');
    }

    if (body.email) {
      const existingEmail = await prisma.member.findFirst({ where: { email: body.email } });
      if (existingEmail) throw createHttpError(400, 'validation_error', 'E-mail já cadastrado.');
    }

    const member = await prisma.member.create({
      data: extractMemberData(body),
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

  if (req.method === 'GET') {
    requirePermission(authenticatedUser, PERMISSIONS.MEMBERS_READ);
    const member = await prisma.member.findUnique({ where: { id } });
    if (!member) throw createHttpError(404, 'not_found', 'Membro não encontrado.');
    return sendJson(res, 200, member);
  }

  if (req.method === 'PUT') {
    requirePermission(authenticatedUser, PERMISSIONS.MEMBERS_WRITE);
    
    const body = req.body || {};
    if (!body.name) {
      throw createHttpError(400, 'validation_error', 'O nome é obrigatório.');
    }

    if (body.cpf) {
      const existingCpf = await prisma.member.findFirst({ where: { cpf: body.cpf, id: { not: id } } });
      if (existingCpf) throw createHttpError(400, 'validation_error', 'CPF já cadastrado por outro membro.');
    }

    if (body.email) {
      const existingEmail = await prisma.member.findFirst({ where: { email: body.email, id: { not: id } } });
      if (existingEmail) throw createHttpError(400, 'validation_error', 'E-mail já cadastrado por outro membro.');
    }

    const member = await prisma.member.update({
      where: { id },
      data: extractMemberData(body),
    });

    await auditAction(authenticatedUser, 'member.update', {
      memberId: member.id,
      name: member.name,
    });
    
    return sendJson(res, 200, member);
  }

  if (req.method === 'DELETE') {
    requirePermission(authenticatedUser, PERMISSIONS.MEMBERS_WRITE);

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

  return methodNotAllowed(res, ['GET', 'PUT', 'DELETE']);
}
