import { authHandler } from '../../server/handlers/auth.js';
import { runApiHandler } from '../../server/lib/http.js';

export default function handler(req, res) {
  return runApiHandler(res, () => authHandler(req, res));
}
