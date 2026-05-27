import { handleHealth } from '../../server/handlers/health.js';
import { runApiHandler } from '../../server/lib/http.js';

export default function handler(req, res) {
  return runApiHandler(res, () => handleHealth(req, res));
}
