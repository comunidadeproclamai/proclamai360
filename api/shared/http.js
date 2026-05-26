export function sendJson(res, statusCode, payload) {
  res.status(statusCode).json(payload);
}

export function methodNotAllowed(res, allowedMethods = []) {
  res.setHeader('Allow', allowedMethods.join(', '));
  sendJson(res, 405, {
    error: 'method_not_allowed',
    message: 'Metodo nao permitido.',
  });
}

export function handleApiError(res, error) {
  if (!error.statusCode || error.statusCode >= 500) {
    console.error(error);
  }

  sendJson(res, error.statusCode || 500, {
    error: error.code || 'internal_server_error',
    message: error.message || 'Nao foi possivel concluir a solicitacao.',
    stack: error.stack
  });
}

export function createHttpError(statusCode, code, publicMessage) {
  const error = new Error(publicMessage);
  error.statusCode = statusCode;
  error.code = code;
  error.publicMessage = publicMessage;
  return error;
}
