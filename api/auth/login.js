import bcrypt from 'bcryptjs';
import { prisma } from '../shared/prisma.js';
import { createHttpError, handleApiError, methodNotAllowed, sendJson } from '../shared/http.js';
import { normalizeEmail, requireFields } from '../shared/validation.js';
import { signAuthToken } from '../shared/auth.js';

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return methodNotAllowed(res, ['POST']);
  }

  try {
    const body = req.body || {};
    requireFields(body, ['email', 'password']);

    const email = normalizeEmail(body.email);
    const userWithPassword = await prisma.user.findUnique({
      where: { email },
    });

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
    const token = signAuthToken(user);

    return sendJson(res, 200, { user, token });
  } catch (error) {
    return handleApiError(res, error);
  }
}
