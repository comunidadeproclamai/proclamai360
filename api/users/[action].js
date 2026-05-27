import { usersHandler } from '../../server/handlers/users.js';
import { runApiHandler } from '../../server/lib/http.js';

export default function handler(req, res) {
  return runApiHandler(res, () => usersHandler(req, res));
}
