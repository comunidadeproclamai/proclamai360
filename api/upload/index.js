import { uploadHandler, config as uploadConfig } from '../../server/handlers/upload.js';

export const config = uploadConfig;

export default function handler(req, res) {
  return uploadHandler(req, res);
}
