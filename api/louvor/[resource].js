import { louvorHandler } from '../../server/handlers/louvor.js';
import { runApiHandler } from '../../server/lib/http.js';

export default function handler(req, res) {
  return runApiHandler(res, () => louvorHandler(req, res));
}
