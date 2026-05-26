import { prisma } from '../shared/prisma.js';
import { getAuthenticatedUser } from '../shared/auth.js';

export default async function handler(req, res) {
  const { method } = req;

  if (!process.env.DATABASE_URL) {
    return res.status(503).json({ error: 'API Offline' });
  }

  try {
    // Authenticate user
    try {
      await getAuthenticatedUser(req);
    } catch (e) {
      if (process.env.NODE_ENV === 'production') {
        return res.status(401).json({ error: 'Não autorizado.' });
      }
    }

    switch (method) {
      case 'GET':
        const { search } = req.query;
        const whereClause = search
          ? {
              OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { artist: { contains: search, mode: 'insensitive' } }
              ]
            }
          : {};

        const songs = await prisma.song.findMany({
          where: whereClause,
          orderBy: { title: 'asc' }
        });
        return res.status(200).json(songs);

      case 'POST':
        const { title, artist, defaultKey, bpm, chordsUrl, videoUrl, lyrics } = req.body;
        if (!title || !artist || !defaultKey) {
          return res.status(400).json({ error: 'Título, artista e tom padrão são obrigatórios.' });
        }

        const newSong = await prisma.song.create({
          data: {
            title,
            artist,
            defaultKey,
            bpm: bpm ? Number(bpm) : null,
            chordsUrl: chordsUrl || null,
            videoUrl: videoUrl || null,
            lyrics: lyrics || null
          }
        });
        return res.status(201).json(newSong);

      case 'PUT':
        const { id, ...updateData } = req.body;
        const songId = id || req.query.id;
        if (!songId) {
          return res.status(400).json({ error: 'ID da música é obrigatório.' });
        }

        if (updateData.bpm) {
          updateData.bpm = Number(updateData.bpm);
        }

        const updatedSong = await prisma.song.update({
          where: { id: songId },
          data: updateData
        });
        return res.status(200).json(updatedSong);

      case 'DELETE':
        const deleteId = req.query.id || req.body.id;
        if (!deleteId) {
          return res.status(400).json({ error: 'ID da música é obrigatório.' });
        }

        await prisma.song.delete({
          where: { id: deleteId }
        });
        return res.status(200).json({ message: 'Música excluída com sucesso.' });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('[API Songs Error]', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Música não encontrada.' });
    }
    return res.status(500).json({ error: 'Erro interno ao processar canções.' });
  }
}
