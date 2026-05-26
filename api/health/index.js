import { sendJson, methodNotAllowed } from '../shared/http.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return methodNotAllowed(res, ['GET']);
  }

  return sendJson(res, 200, {
    status: 'ok',
    service: 'proclamai-360',
    timestamp: new Date().toISOString(),
  });
}
