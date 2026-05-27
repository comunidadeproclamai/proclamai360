import { getAuthenticatedUser } from '../lib/auth.js';
import { methodNotAllowed, sendJson } from '../lib/http.js';

async function handleCurrentUser(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  return sendJson(res, 200, { user: await getAuthenticatedUser(req) });
}

export function usersHandler(req, res) {
  if (req.query.action === 'me') {
    return handleCurrentUser(req, res);
  }

  return sendJson(res, 404, {
    error: 'not_found',
    message: 'Rota de usuario nao encontrada.',
  });
}
