import bcrypt from 'bcryptjs';
import { prisma } from '../shared/prisma.js';
import { createHttpError, handleApiError, methodNotAllowed, sendJson } from '../shared/http.js';
import {
  assertStrongEnoughPassword,
  assertValidEmail,
  normalizeEmail,
  requireFields,
} from '../shared/validation.js';
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

    const hashedPassword = await bcrypt.hash(body.password, 10);

    const user = await prisma.user.create({
      data: {
        name: String(body.name).trim(),
        email,
        password: hashedPassword,
        role: 'member',
      },
      select: USER_SELECT,
    });

    const token = signAuthToken(user);

    return sendJson(res, 201, { user, token });
  } catch (error) {
    return handleApiError(res, error);
  }
}
