import { getAuthenticatedUser } from '../shared/auth.js';
import { handleApiError, methodNotAllowed, sendJson } from '../shared/http.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return methodNotAllowed(res, ['GET']);
  }

  try {
    const user = await getAuthenticatedUser(req);

    return sendJson(res, 200, { user });
  } catch (error) {
    return handleApiError(res, error);
  }
}
