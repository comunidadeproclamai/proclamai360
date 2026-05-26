import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

const DEFAULT_EXPIRES_IN = '7d';
const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
};

function sendJson(res, statusCode, payload) {
  return res.status(statusCode).json(payload);
}

function methodNotAllowed(res, allowedMethods = []) {
  res.setHeader('Allow', allowedMethods.join(', '));
  return sendJson(res, 405, {
    error: 'method_not_allowed',
    message: 'Metodo nao permitido.',
  });
}

function createHttpError(statusCode, code, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

function handleApiError(res, error) {
  if (!error.statusCode || error.statusCode >= 500) {
    console.error(error);
  }

  return sendJson(res, error.statusCode || 500, {
    error: error.code || 'internal_server_error',
    message: error.message || 'Nao foi possivel concluir a solicitacao.',
  });
}

function requireDatabase() {
  if (!process.env.DATABASE_URL) {
    throw createHttpError(503, 'database_not_configured', 'Banco de dados nao configurado.');
  }
}

function requireFields(payload, fields) {
  const missingFields = fields.filter((field) => !String(payload[field] || '').trim());

  if (missingFields.length > 0) {
    throw createHttpError(400, 'validation_error', `Campos obrigatorios: ${missingFields.join(', ')}.`);
  }
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function assertValidEmail(email) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createHttpError(400, 'invalid_email', 'Informe um e-mail valido.');
  }
}

function assertStrongEnoughPassword(password) {
  if (String(password || '').length < 8) {
    throw createHttpError(400, 'weak_password', 'A senha deve ter pelo menos 8 caracteres.');
  }
}

function signAuthToken(user) {
  if (!process.env.JWT_SECRET) {
    throw createHttpError(500, 'jwt_not_configured', 'JWT_SECRET nao configurado.');
  }

  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || DEFAULT_EXPIRES_IN,
    },
  );
}

async function getAuthenticatedUser(req) {
  if (!process.env.JWT_SECRET) {
    throw createHttpError(500, 'jwt_not_configured', 'JWT_SECRET nao configurado.');
  }

  const authHeader = req.headers.authorization || '';
  const [, token] = authHeader.split(' ');

  if (!token) {
    throw createHttpError(401, 'unauthenticated', 'Sessao nao encontrada.');
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: USER_SELECT,
    });

    if (!user) {
      throw createHttpError(401, 'invalid_session', 'Sessao invalida.');
    }

    return user;
  } catch (error) {
    if (error.statusCode) throw error;
    throw createHttpError(401, 'invalid_session', 'Sessao expirada ou invalida.');
  }
}

function getRoute(req) {
  const value = req.query.path;
  const segments = Array.isArray(value) ? value : [value].filter(Boolean);
  return `/${segments.join('/')}`;
}

function generateSecurityCode() {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

async function handleHealth(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  return sendJson(res, 200, {
    status: 'ok',
    service: 'proclamai-360',
    timestamp: new Date().toISOString(),
  });
}

async function handleLogin(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  requireDatabase();

  const body = req.body || {};
  requireFields(body, ['email', 'password']);

  const email = normalizeEmail(body.email);
  const userWithPassword = await prisma.user.findUnique({ where: { email } });

  if (!userWithPassword) {
    throw createHttpError(401, 'invalid_credentials', 'E-mail ou senha invalidos.');
  }

  const passwordMatches = await bcrypt.compare(body.password, userWithPassword.password);

  if (!passwordMatches) {
    throw createHttpError(401, 'invalid_credentials', 'E-mail ou senha invalidos.');
  }

  const user = await prisma.user.findUnique({
    where: { id: userWithPassword.id },
    select: USER_SELECT,
  });

  return sendJson(res, 200, { user, token: signAuthToken(user) });
}

async function handleRegister(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  requireDatabase();

  const body = req.body || {};
  requireFields(body, ['name', 'email', 'password']);

  const email = normalizeEmail(body.email);
  assertValidEmail(email);
  assertStrongEnoughPassword(body.password);

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
      role: 'member',
    },
    select: USER_SELECT,
  });

  return sendJson(res, 201, { user, token: signAuthToken(user) });
}

async function handleCurrentUser(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  return sendJson(res, 200, { user: await getAuthenticatedUser(req) });
}

async function handleMembers(req, res) {
  requireDatabase();

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

    return sendJson(res, 201, member);
  }

  return methodNotAllowed(res, ['GET', 'POST']);
}

async function handleMemberById(req, res, id) {
  requireDatabase();

  if (req.method === 'PUT') {
    return sendJson(res, 200, await prisma.member.update({ where: { id }, data: req.body }));
  }

  if (req.method === 'DELETE') {
    const member = await prisma.member.update({
      where: { id },
      data: { status: 'DISMISSED' },
    });
    return sendJson(res, 200, { message: 'Membro inativado com sucesso.', data: member });
  }

  return methodNotAllowed(res, ['PUT', 'DELETE']);
}

async function handleSettings(req, res) {
  requireDatabase();

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
    const { churchName, street } = req.body || {};
    if (!churchName) {
      throw createHttpError(400, 'validation_error', 'O nome da congregacao e obrigatorio.');
    }

    const existing = await prisma.systemConfig.findFirst();
    const data = { churchName, street: street || null };
    const config = existing
      ? await prisma.systemConfig.update({ where: { id: existing.id }, data })
      : await prisma.systemConfig.create({ data });

    return sendJson(res, 200, config);
  }

  return methodNotAllowed(res, ['GET', 'POST', 'PUT']);
}

async function handleInfantilLive(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  requireDatabase();

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

async function resolveOperator(req) {
  try {
    return await getAuthenticatedUser(req);
  } catch {
    const user = await prisma.user.findFirst();
    if (!user) {
      throw createHttpError(401, 'operator_not_found', 'Nenhum usuario operador cadastrado.');
    }
    return user;
  }
}

async function handleInfantilCheckin(req, res) {
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

async function handleFinancialSummary(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  requireDatabase();

  res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=59');

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const [inflowAgg, outflowAgg, accounts] = await Promise.all([
    prisma.financialTransaction.aggregate({
      where: { type: 'INFLOW', date: { gte: startOfMonth } },
      _sum: { amount: true },
    }),
    prisma.financialTransaction.aggregate({
      where: { type: 'OUTFLOW', date: { gte: startOfMonth } },
      _sum: { amount: true },
    }),
    prisma.financialAccount.findMany({ select: { balance: true } }),
  ]);

  return sendJson(res, 200, {
    totalInflow: Number(inflowAgg._sum.amount || 0),
    totalOutflow: Number(outflowAgg._sum.amount || 0),
    balance: accounts.reduce((acc, curr) => acc + Number(curr.balance), 0),
  });
}

async function handleFinancialSupportData(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  requireDatabase();

  const [accounts, categories] = await Promise.all([
    prisma.financialAccount.findMany({
      select: { id: true, name: true, type: true },
      orderBy: { name: 'asc' },
    }),
    prisma.financialCategory.findMany({
      select: { id: true, name: true, type: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  return sendJson(res, 200, { accounts, categories });
}

async function handleFinancialTransactions(req, res) {
  requireDatabase();

  if (req.method === 'GET') {
    const transactions = await prisma.financialTransaction.findMany({
      orderBy: { date: 'desc' },
      take: 100,
      include: {
        category: { select: { name: true } },
        account: { select: { name: true } },
        createdBy: { select: { name: true } },
      },
    });

    return sendJson(
      res,
      200,
      transactions.map((transaction) => ({
        ...transaction,
        category: transaction.category.name,
        account: transaction.account.name,
        createdBy: transaction.createdBy.name,
      })),
    );
  }

  if (req.method === 'POST') {
    const { description, amount, type, categoryId, accountId, createdById } = req.body || {};
    if (!description || !amount || !accountId || !categoryId || !createdById) {
      throw createHttpError(400, 'validation_error', 'Campos obrigatorios faltando.');
    }

    const amountModifier = type === 'OUTFLOW' ? { decrement: amount } : { increment: amount };
    const [transaction, updatedAccount] = await prisma.$transaction([
      prisma.financialTransaction.create({
        data: {
          description,
          amount,
          type,
          date: new Date(),
          categoryId,
          accountId,
          createdById,
        },
      }),
      prisma.financialAccount.update({
        where: { id: accountId },
        data: { balance: amountModifier },
      }),
    ]);

    return sendJson(res, 201, { transaction, accountBalance: updatedAccount.balance });
  }

  return methodNotAllowed(res, ['GET', 'POST']);
}

async function handleFinancialTransactionById(req, res, id) {
  if (req.method !== 'DELETE') return methodNotAllowed(res, ['DELETE']);
  requireDatabase();

  const transaction = await prisma.financialTransaction.findUnique({ where: { id } });
  if (!transaction) {
    throw createHttpError(404, 'not_found', 'Transacao nao encontrada.');
  }

  const amountModifier =
    transaction.type === 'OUTFLOW'
      ? { increment: transaction.amount }
      : { decrement: transaction.amount };

  await prisma.$transaction([
    prisma.financialTransaction.delete({ where: { id } }),
    prisma.financialAccount.update({
      where: { id: transaction.accountId },
      data: { balance: amountModifier },
    }),
  ]);

  return sendJson(res, 200, { success: true });
}

async function ensureAuthenticatedInProduction(req) {
  try {
    return await getAuthenticatedUser(req);
  } catch (error) {
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
    return prisma.user.findFirst();
  }
}

async function handleSongs(req, res) {
  requireDatabase();
  await ensureAuthenticatedInProduction(req);

  if (req.method === 'GET') {
    const { search } = req.query;
    const where = search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { artist: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    return sendJson(res, 200, await prisma.song.findMany({ where, orderBy: { title: 'asc' } }));
  }

  if (req.method === 'POST') {
    const { title, artist, defaultKey, bpm, chordsUrl, videoUrl, lyrics } = req.body || {};
    if (!title || !artist || !defaultKey) {
      throw createHttpError(400, 'validation_error', 'Titulo, artista e tom padrao sao obrigatorios.');
    }

    const song = await prisma.song.create({
      data: {
        title,
        artist,
        defaultKey,
        bpm: bpm ? Number(bpm) : null,
        chordsUrl: chordsUrl || null,
        videoUrl: videoUrl || null,
        lyrics: lyrics || null,
      },
    });

    return sendJson(res, 201, song);
  }

  if (req.method === 'PUT') {
    const { id, ...updateData } = req.body || {};
    const songId = id || req.query.id;
    if (!songId) throw createHttpError(400, 'validation_error', 'ID da musica e obrigatorio.');
    if (updateData.bpm) updateData.bpm = Number(updateData.bpm);
    return sendJson(res, 200, await prisma.song.update({ where: { id: songId }, data: updateData }));
  }

  if (req.method === 'DELETE') {
    const id = req.query.id || req.body?.id;
    if (!id) throw createHttpError(400, 'validation_error', 'ID da musica e obrigatorio.');
    await prisma.song.delete({ where: { id } });
    return sendJson(res, 200, { message: 'Musica excluida com sucesso.' });
  }

  return methodNotAllowed(res, ['GET', 'POST', 'PUT', 'DELETE']);
}

async function handleScales(req, res) {
  requireDatabase();
  const authenticatedUser = await ensureAuthenticatedInProduction(req);

  if (req.method === 'GET') {
    const scales = await prisma.worshipScale.findMany({
      include: {
        lineup: {
          include: { member: { select: { id: true, name: true, phone: true } } },
        },
        setlist: {
          include: { song: { select: { id: true, title: true, artist: true, defaultKey: true } } },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { date: 'desc' },
    });
    return sendJson(res, 200, scales);
  }

  if (req.method === 'POST') {
    const { date, eventName, notes, lineup, setlist } = req.body || {};
    if (!date || !eventName) {
      throw createHttpError(400, 'validation_error', 'Data e nome do evento sao obrigatorios.');
    }

    const scale = await prisma.worshipScale.create({
      data: {
        date: new Date(date),
        eventName,
        notes: notes || null,
        lineup: lineup?.length
          ? {
              create: lineup.map((item) => ({
                memberId: item.memberId,
                instrument: item.instrument,
                status: 'PENDING',
              })),
            }
          : undefined,
        setlist: setlist?.length
          ? {
              create: setlist.map((item, idx) => ({
                songId: item.songId,
                order: Number(item.order !== undefined ? item.order : idx + 1),
                customKey: item.customKey || null,
              })),
            }
          : undefined,
      },
      include: {
        lineup: { include: { member: { select: { id: true, name: true } } } },
        setlist: { include: { song: { select: { id: true, title: true } } } },
      },
    });

    return sendJson(res, 201, scale);
  }

  if (req.method === 'PUT') {
    const { scaleId, memberId, instrument, status } = req.body || {};
    if (!scaleId || !memberId || !instrument || !status) {
      throw createHttpError(400, 'validation_error', 'scaleId, memberId, instrument e status sao obrigatorios.');
    }

    if (!['PENDING', 'CONFIRMED', 'DECLINED'].includes(status)) {
      throw createHttpError(400, 'invalid_status', 'Status invalido.');
    }

    let isAuthorized = authenticatedUser?.role === 'admin';
    if (!isAuthorized) {
      const member = await prisma.member.findFirst({
        where: { id: memberId, userId: authenticatedUser.id },
      });
      isAuthorized = Boolean(member);
    }

    if (!isAuthorized) {
      throw createHttpError(403, 'forbidden', 'Voce nao tem permissao para alterar esta escala.');
    }

    const lineup = await prisma.worshipLineup.update({
      where: { scaleId_memberId_instrument: { scaleId, memberId, instrument } },
      data: { status },
    });

    return sendJson(res, 200, lineup);
  }

  if (req.method === 'DELETE') {
    const id = req.query.id || req.body?.id;
    if (!id) throw createHttpError(400, 'validation_error', 'ID da escala e obrigatorio.');
    await prisma.worshipScale.delete({ where: { id } });
    return sendJson(res, 200, { message: 'Escala excluida com sucesso.' });
  }

  return methodNotAllowed(res, ['GET', 'POST', 'PUT', 'DELETE']);
}

async function dispatch(req, res) {
  const route = getRoute(req);
  const memberMatch = route.match(/^\/members\/([^/]+)$/);
  const transactionMatch = route.match(/^\/financial\/transactions\/([^/]+)$/);

  if (route === '/health') return handleHealth(req, res);
  if (route === '/auth/login') return handleLogin(req, res);
  if (route === '/auth/register') return handleRegister(req, res);
  if (route === '/users/me') return handleCurrentUser(req, res);
  if (route === '/members') return handleMembers(req, res);
  if (memberMatch) return handleMemberById(req, res, memberMatch[1]);
  if (route === '/settings') return handleSettings(req, res);
  if (route === '/infantil/live') return handleInfantilLive(req, res);
  if (route === '/infantil/checkin') return handleInfantilCheckin(req, res);
  if (route === '/financial/summary') return handleFinancialSummary(req, res);
  if (route === '/financial/support-data') return handleFinancialSupportData(req, res);
  if (route === '/financial/transactions') return handleFinancialTransactions(req, res);
  if (transactionMatch) return handleFinancialTransactionById(req, res, transactionMatch[1]);
  if (route === '/louvor/songs') return handleSongs(req, res);
  if (route === '/louvor/scales') return handleScales(req, res);

  return sendJson(res, 404, {
    error: 'not_found',
    message: 'Rota de API nao encontrada.',
  });
}

async function runApiHandler(res, callback) {
  try {
    return await callback();
  } catch (error) {
    if (error.code === 'P2025') {
      return sendJson(res, 404, {
        error: 'not_found',
        message: 'Registro nao encontrado.',
      });
    }

    return handleApiError(res, error);
  }
}

export function healthHandler(req, res) {
  return runApiHandler(res, () => handleHealth(req, res));
}

export function authHandler(req, res) {
  if (req.query.action === 'login') {
    return runApiHandler(res, () => handleLogin(req, res));
  }

  if (req.query.action === 'register') {
    return runApiHandler(res, () => handleRegister(req, res));
  }

  return sendJson(res, 404, {
    error: 'not_found',
    message: 'Rota de autenticacao nao encontrada.',
  });
}

export function usersHandler(req, res) {
  if (req.query.action === 'me') {
    return runApiHandler(res, () => handleCurrentUser(req, res));
  }

  return sendJson(res, 404, {
    error: 'not_found',
    message: 'Rota de usuario nao encontrada.',
  });
}

export function membersHandler(req, res) {
  return runApiHandler(res, () => handleMembers(req, res));
}

export function memberByIdHandler(req, res) {
  return runApiHandler(res, () => handleMemberById(req, res, req.query.id));
}

export function settingsHandler(req, res) {
  return runApiHandler(res, () => handleSettings(req, res));
}

export function infantilHandler(req, res) {
  if (req.query.action === 'live') {
    return runApiHandler(res, () => handleInfantilLive(req, res));
  }

  if (req.query.action === 'checkin') {
    return runApiHandler(res, () => handleInfantilCheckin(req, res));
  }

  return sendJson(res, 404, {
    error: 'not_found',
    message: 'Rota infantil nao encontrada.',
  });
}

export function financialHandler(req, res) {
  if (req.query.route === 'summary') {
    return runApiHandler(res, () => handleFinancialSummary(req, res));
  }

  if (req.query.route === 'support-data') {
    return runApiHandler(res, () => handleFinancialSupportData(req, res));
  }

  if (req.query.route === 'transactions') {
    return runApiHandler(res, () => handleFinancialTransactions(req, res));
  }

  return sendJson(res, 404, {
    error: 'not_found',
    message: 'Rota financeira nao encontrada.',
  });
}

export function financialTransactionByIdHandler(req, res) {
  return runApiHandler(res, () => handleFinancialTransactionById(req, res, req.query.id));
}

export function louvorHandler(req, res) {
  if (req.query.resource === 'songs') {
    return runApiHandler(res, () => handleSongs(req, res));
  }

  if (req.query.resource === 'scales') {
    return runApiHandler(res, () => handleScales(req, res));
  }

  return sendJson(res, 404, {
    error: 'not_found',
    message: 'Rota de louvor nao encontrada.',
  });
}

export default async function handler(req, res) {
  return runApiHandler(res, () => dispatch(req, res));
}
