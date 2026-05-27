import { sendJson } from '../lib/http.js';
import {
  handleAuditLogs,
  handleCreateUser,
  handleCurrentUser,
  handleListUsers,
  handleResetUserPassword,
  handleUpdateUserRole,
} from '../modules/users/users.handler.js';

export function usersHandler(req, res) {
  if (req.query.action === 'me') {
    return handleCurrentUser(req, res);
  }

  if (req.query.action === 'list') {
    return handleListUsers(req, res);
  }

  if (req.query.action === 'role') {
    return handleUpdateUserRole(req, res);
  }

  if (req.query.action === 'create') {
    return handleCreateUser(req, res);
  }

  if (req.query.action === 'password') {
    return handleResetUserPassword(req, res);
  }

  if (req.query.action === 'audit') {
    return handleAuditLogs(req, res);
  }

  return sendJson(res, 404, {
    error: 'not_found',
    message: 'Rota de usuario nao encontrada.',
  });
}
