export function sendJson(res, statusCode, payload) {
  return res.status(statusCode).json(payload);
}

export function methodNotAllowed(res, allowedMethods = []) {
  res.setHeader('Allow', allowedMethods.join(', '));
  return sendJson(res, 405, {
    error: 'method_not_allowed',
    message: 'Metodo nao permitido.',
  });
}

export function createHttpError(statusCode, code, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

export function handleApiError(res, error) {
  if (!error.statusCode || error.statusCode >= 500) {
    console.error(error);
  }

  return sendJson(res, error.statusCode || 500, {
    error: error.code || 'internal_server_error',
    message: error.message || 'Nao foi possivel concluir a solicitacao.',
  });
}

export async function runApiHandler(res, callback) {
  try {
    return await callback();
  } catch (error) {
    if (error.code === 'P2025') {
      return sendJson(res, 404, {
        error: 'not_found',
        message: 'Registro nao encontrado.',
      });
    }

    return handleApiError(res, error);
  }
}
