import { infantilHandler } from '../../server/handlers/infantil.js';
import { runApiHandler } from '../../server/lib/http.js';

export default function handler(req, res) {
  return runApiHandler(res, () => infantilHandler(req, res));
}
