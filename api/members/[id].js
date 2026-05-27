import { memberByIdHandler } from '../../server/handlers/members.js';
import { runApiHandler } from '../../server/lib/http.js';

export default function handler(req, res) {
  return runApiHandler(res, () => memberByIdHandler(req, res));
}
