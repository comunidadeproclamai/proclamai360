import jwt from 'jsonwebtoken';
import { createHttpError } from './http.js';
import { requirePermission } from './permissions.js';
import { prisma } from './prisma.js';

const DEFAULT_EXPIRES_IN = '7d';

export const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
};

export function signAuthToken(user) {
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

export async function getAuthenticatedUser(req) {
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

export { requirePermission };

export async function ensureAuthenticatedInProduction(req) {
  try {
    return await getAuthenticatedUser(req);
  } catch (error) {
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
    return prisma.user.findFirst();
  }
}
