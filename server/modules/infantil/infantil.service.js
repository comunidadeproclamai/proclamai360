import { auditAction } from '../../lib/audit.js';
import { createHttpError } from '../../lib/http.js';
import { prisma } from '../../lib/prisma.js';

const DEFAULT_GUARDIAN_NAME = 'Responsavel Geral/Visitante';
const MAX_HISTORY_LIMIT = 50;

const liveInclude = {
  child: { select: { id: true, name: true, allergies: true, specialNeeds: true, birthDate: true } },
  guardian: { select: { id: true, name: true } },
};

function trimValue(value) {
  return typeof value === 'string' ? value.trim() : value;
}

function parsePositiveInteger(value, fieldName) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw createHttpError(400, 'validation_error', `${fieldName} invalida.`);
  }
  return parsed;
}

function birthDateFromAge(age) {
  const birthDate = new Date();
  birthDate.setFullYear(birthDate.getFullYear() - age);
  birthDate.setHours(12, 0, 0, 0);
  return birthDate;
}

function normalizeChildPayload(payload = {}) {
  const name = trimValue(payload.name);
  const allergies = trimValue(payload.allergies) || null;
  const specialNeeds = trimValue(payload.specialNeeds) || null;
  const age = payload.age === undefined || payload.age === '' ? null : parsePositiveInteger(payload.age, 'Idade');

  if (!name) {
    throw createHttpError(400, 'validation_error', 'Nome da crianca e obrigatorio.');
  }

  if (age === null && !payload.birthDate) {
    throw createHttpError(400, 'validation_error', 'Informe a idade ou data de nascimento.');
  }

  const birthDate = payload.birthDate ? new Date(payload.birthDate) : birthDateFromAge(age);
  if (Number.isNaN(birthDate.getTime())) {
    throw createHttpError(400, 'validation_error', 'Data de nascimento invalida.');
  }

  return { name, birthDate, allergies, specialNeeds };
}

function normalizeGuardianPayload(payload = {}) {
  return {
    guardianId: trimValue(payload.guardianId) || null,
    relation: trimValue(payload.relation) || 'Responsavel',
  };
}

function normalizeGuardianOptionPayload(payload = {}) {
  const name = trimValue(payload.name);
  const email = trimValue(payload.email) || null;
  const phone = trimValue(payload.phone) || null;

  if (!name) {
    throw createHttpError(400, 'validation_error', 'Nome do responsavel e obrigatorio.');
  }

  return { name, email, phone };
}

async function getOrCreateDefaultGuardian() {
  const existing = await prisma.member.findFirst({
    where: { name: DEFAULT_GUARDIAN_NAME },
  });

  if (existing) return existing;

  return prisma.member.create({
    data: {
      name: DEFAULT_GUARDIAN_NAME,
      status: 'ACTIVE',
      congregation: 'Sede',
    },
  });
}

async function assertGuardianExists(guardianId) {
  if (!guardianId) return null;

  const guardian = await prisma.member.findUnique({
    where: { id: guardianId },
    select: { id: true, name: true },
  });

  if (!guardian) {
    throw createHttpError(404, 'guardian_not_found', 'Responsavel nao encontrado.');
  }

  return guardian;
}

async function ensureGuardianLink(childId, guardianId, relation = 'Responsavel') {
  if (!guardianId) return null;

  await assertGuardianExists(guardianId);

  const [, link] = await prisma.$transaction([
    prisma.childGuardian.updateMany({
      where: {
        childId,
        memberId: { not: guardianId },
      },
      data: { isPrimary: false },
    }),
    prisma.childGuardian.upsert({
      where: {
        childId_memberId: {
          childId,
          memberId: guardianId,
        },
      },
      update: {
        relation,
        isPrimary: true,
      },
      create: {
        childId,
        memberId: guardianId,
        relation,
        isPrimary: true,
      },
    }),
  ]);

  return link;
}

async function findChildByName(name) {
  return prisma.child.findFirst({
    where: {
      name: { equals: name, mode: 'insensitive' },
    },
  });
}

function mapHistoryRecord(checkin) {
  return {
    id: checkin.id,
    securityCode: checkin.securityCode,
    checkinTime: checkin.checkinTime,
    checkoutTime: checkin.checkoutTime,
    child: checkin.child,
    guardian: checkin.guardian,
    checkedInBy: checkin.checkedInBy,
    checkedOutBy: checkin.checkedOutBy,
  };
}

function generateSecurityCode() {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

async function generateUniqueSecurityCode() {
  for (let attempts = 0; attempts < 8; attempts += 1) {
    const code = generateSecurityCode();
    const existing = await prisma.childCheckin.findFirst({
      where: { securityCode: code, checkoutTime: null },
      select: { id: true },
    });

    if (!existing) return code;
  }

  throw createHttpError(409, 'code_generation_failed', 'Nao foi possivel gerar um codigo unico.');
}

export async function listActiveCheckins() {
  const cutoff = new Date();
  cutoff.setHours(cutoff.getHours() - 16);

  return prisma.childCheckin.findMany({
    where: {
      checkoutTime: null,
      checkinTime: { gte: cutoff },
    },
    include: liveInclude,
    orderBy: { checkinTime: 'desc' },
  });
}

export async function listChildren(query = {}) {
  const search = trimValue(query.search);

  return prisma.child.findMany({
    where: search
      ? {
          name: { contains: search, mode: 'insensitive' },
        }
      : undefined,
    include: {
      guardians: {
        include: {
          member: { select: { id: true, name: true, phone: true } },
        },
      },
      _count: { select: { checkins: true } },
    },
    orderBy: { name: 'asc' },
    take: 100,
  });
}

export async function listGuardianOptions(query = {}) {
  const search = trimValue(query.search);

  return prisma.member.findMany({
    where: {
      AND: [
        { status: { in: ['ACTIVE', 'VISITOR'] } },
        search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {},
      ],
    },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      status: true,
    },
    orderBy: { name: 'asc' },
    take: 100,
  });
}

export async function createGuardianOption(authenticatedUser, payload = {}) {
  const data = normalizeGuardianOptionPayload(payload);
  const existingFilters = [
    { name: { equals: data.name, mode: 'insensitive' } },
  ];

  if (data.email) existingFilters.push({ email: data.email });
  if (data.phone) existingFilters.push({ phone: data.phone });

  const existing = await prisma.member.findFirst({
    where: {
      OR: existingFilters,
    },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      status: true,
    },
  });

  if (existing) return existing;

  const guardian = await prisma.member.create({
    data: {
      ...data,
      status: 'VISITOR',
      congregation: 'Visitante',
    },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      status: true,
    },
  });

  await auditAction(authenticatedUser, 'child.guardian.create', {
    guardianId: guardian.id,
    name: guardian.name,
  });

  return guardian;
}

export async function listCheckinHistory(query = {}) {
  const requestedLimit = Number(query.limit || 20);
  const limit = Number.isFinite(requestedLimit)
    ? Math.min(Math.max(Math.trunc(requestedLimit), 1), MAX_HISTORY_LIMIT)
    : 20;

  const records = await prisma.childCheckin.findMany({
    include: {
      child: { select: { id: true, name: true, allergies: true } },
      guardian: { select: { id: true, name: true } },
      checkedInBy: { select: { id: true, name: true } },
      checkedOutBy: { select: { id: true, name: true } },
    },
    orderBy: { checkinTime: 'desc' },
    take: limit,
  });

  return records.map(mapHistoryRecord);
}

export async function createChild(authenticatedUser, payload = {}) {
  const data = normalizeChildPayload(payload);
  const guardian = normalizeGuardianPayload(payload);
  const existing = await findChildByName(data.name);

  if (existing) {
    throw createHttpError(409, 'child_already_exists', 'Crianca ja cadastrada.');
  }

  const child = await prisma.child.create({ data });
  if (guardian.guardianId) {
    await ensureGuardianLink(child.id, guardian.guardianId, guardian.relation);
  }

  await auditAction(authenticatedUser, 'child.create', {
    childId: child.id,
    childName: child.name,
    guardianId: guardian.guardianId,
  });

  return child;
}

async function resolveCheckinChild(payload = {}) {
  if (payload.childId) {
    const child = await prisma.child.findUnique({ where: { id: payload.childId } });
    if (!child) throw createHttpError(404, 'child_not_found', 'Crianca nao encontrada.');
    return child;
  }

  const data = normalizeChildPayload(payload);
  const existing = await findChildByName(data.name);

  if (existing) {
    return prisma.child.update({
      where: { id: existing.id },
      data: {
        allergies: data.allergies,
        specialNeeds: data.specialNeeds,
        birthDate: data.birthDate,
      },
    });
  }

  return prisma.child.create({ data });
}

export async function checkinChild(authenticatedUser, payload = {}) {
  const child = await resolveCheckinChild(payload);
  const guardian = normalizeGuardianPayload(payload);
  const guardianId = guardian.guardianId || (await getOrCreateDefaultGuardian()).id;

  const activeCheckin = await prisma.childCheckin.findFirst({
    where: {
      childId: child.id,
      checkoutTime: null,
    },
    select: { id: true },
  });

  if (activeCheckin) {
    throw createHttpError(409, 'child_already_checked_in', 'Esta crianca ja esta em sala.');
  }

  await ensureGuardianLink(child.id, guardianId, guardian.relation);

  const checkin = await prisma.childCheckin.create({
    data: {
      securityCode: await generateUniqueSecurityCode(),
      childId: child.id,
      guardianId,
      checkedInById: authenticatedUser.id,
    },
    include: liveInclude,
  });

  await auditAction(authenticatedUser, 'child.checkin', {
    checkinId: checkin.id,
    childId: child.id,
    guardianId,
  });

  return checkin;
}

export async function checkoutChild(authenticatedUser, id) {
  const activeCheckin = await prisma.childCheckin.findFirst({
    where: { id, checkoutTime: null },
    select: { id: true, childId: true, guardianId: true },
  });

  if (!activeCheckin) {
    throw createHttpError(404, 'active_checkin_not_found', 'Check-in ativo nao encontrado.');
  }

  const checkin = await prisma.childCheckin.update({
    where: { id },
    data: {
      checkoutTime: new Date(),
      checkedOutById: authenticatedUser.id,
    },
  });

  await auditAction(authenticatedUser, 'child.checkout', {
    checkinId: checkin.id,
    childId: checkin.childId,
    guardianId: checkin.guardianId,
  });

  return checkin;
}
