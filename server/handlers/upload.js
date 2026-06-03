import { IncomingForm } from 'formidable';
import fs from 'fs';
import { supabaseServer } from '../lib/supabase.js';
import { ensureAuthenticated } from '../lib/auth.js';
import { sendJson } from '../lib/http.js';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function uploadHandler(req, res) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { message: 'Method Not Allowed' });
  }

  try {
    await ensureAuthenticated(req);

    const form = new IncomingForm({
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Formidable error:', err);
        return sendJson(res, 400, { message: 'Erro ao processar o upload.' });
      }

      const file = files.file?.[0] || files.file;
      const bucket = fields.bucket?.[0] || fields.bucket;
      const path = fields.path?.[0] || fields.path;

      if (!file || !bucket || !path) {
        return sendJson(res, 400, { message: 'Arquivo, bucket ou caminho não fornecidos.' });
      }

      try {
        const fileContent = fs.readFileSync(file.filepath);
        
        const { data, error } = await supabaseServer.storage
          .from(bucket)
          .upload(path, fileContent, {
            contentType: file.mimetype,
            upsert: true,
          });

        if (error) {
          throw error;
        }

        // Clean up temp file
        fs.unlinkSync(file.filepath);

        return sendJson(res, 200, { path: data.path });
      } catch (uploadError) {
        console.error('Supabase upload error:', uploadError);
        return sendJson(res, 500, { message: 'Erro ao enviar para o storage.' });
      }
    });
  } catch (authError) {
    return sendJson(res, 401, { message: 'Não autorizado.' });
  }
}
