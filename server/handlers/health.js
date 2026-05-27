import { methodNotAllowed, sendJson } from '../lib/http.js';

export async function handleHealth(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  return sendJson(res, 200, {
    status: 'ok',
    service: 'proclamai-360',
    timestamp: new Date().toISOString(),
  });
}
