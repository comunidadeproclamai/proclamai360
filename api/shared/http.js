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

  const payload = {
    error: error.code || 'internal_server_error',
    message: error.message || 'Nao foi possivel concluir a solicitacao.',
  };

  // Only expose stack trace in development
  if (process.env.NODE_ENV !== 'production') {
    payload.stack = error.stack;
  }

  sendJson(res, error.statusCode || 500, payload);
}

export function createHttpError(statusCode, code, publicMessage) {
  const error = new Error(publicMessage);
  error.statusCode = statusCode;
  error.code = code;
  error.publicMessage = publicMessage;
  return error;
}
