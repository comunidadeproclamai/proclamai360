import { financialTransactionByIdHandler } from '../../../server/handlers/financial.js';
import { runApiHandler } from '../../../server/lib/http.js';

export default function handler(req, res) {
  return runApiHandler(res, () => financialTransactionByIdHandler(req, res));
}
