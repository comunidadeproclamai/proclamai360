import bcrypt from 'bcryptjs';
import { auditAction } from '../lib/audit.js';
import { USER_SELECT, signAuthToken } from '../lib/auth.js';
import { createHttpError, methodNotAllowed, sendJson } from '../lib/http.js';
import { prisma, requireDatabase } from '../lib/prisma.js';
import {
  assertStrongEnoughPassword,
  assertValidEmail,
  normalizeEmail,
  requireFields,
} from '../lib/validation.js';

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

  await auditAction(user, 'auth.login', { email: user.email });

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

  await auditAction(user, 'auth.register', { email: user.email });

  return sendJson(res, 201, { user, token: signAuthToken(user) });
}

export function authHandler(req, res) {
  if (req.query.action === 'login') {
    return handleLogin(req, res);
  }

  if (req.query.action === 'register') {
    return handleRegister(req, res);
  }

  return sendJson(res, 404, {
    error: 'not_found',
    message: 'Rota de autenticacao nao encontrada.',
  });
}
