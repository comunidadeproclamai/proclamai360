import { settingsHandler } from '../../server/handlers/settings.js';
import { runApiHandler } from '../../server/lib/http.js';

export default function handler(req, res) {
  return runApiHandler(res, () => settingsHandler(req, res));
}
