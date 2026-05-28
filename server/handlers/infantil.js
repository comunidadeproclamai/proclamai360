import { sendJson } from '../lib/http.js';
import {
  handleCheckin,
  handleChildren,
  handleGuardians,
  handleHistory,
  handleLive,
} from '../modules/infantil/infantil.handler.js';

export function infantilHandler(req, res) {
  if (req.query.action === 'live') {
    return handleLive(req, res);
  }

  if (req.query.action === 'checkin') {
    return handleCheckin(req, res);
  }

  if (req.query.action === 'children') {
    return handleChildren(req, res);
  }

  if (req.query.action === 'history') {
    return handleHistory(req, res);
  }

  if (req.query.action === 'guardians') {
    return handleGuardians(req, res);
  }

  return sendJson(res, 404, {
    error: 'not_found',
    message: 'Rota infantil nao encontrada.',
  });
}
