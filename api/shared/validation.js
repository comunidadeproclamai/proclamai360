import { createHttpError } from './http.js';

export function requireFields(payload, fields) {
  const missingFields = fields.filter((field) => !String(payload[field] || '').trim());

  if (missingFields.length > 0) {
    throw createHttpError(
      400,
      'validation_error',
      `Campos obrigatorios: ${missingFields.join(', ')}.`,
    );
  }
}

export function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

export function assertValidEmail(email) {
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!isValid) {
    throw createHttpError(400, 'invalid_email', 'Informe um e-mail valido.');
  }
}

export function assertStrongEnoughPassword(password) {
  if (String(password || '').length < 8) {
    throw createHttpError(400, 'weak_password', 'A senha deve ter pelo menos 8 caracteres.');
  }
}
