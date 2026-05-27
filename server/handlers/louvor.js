import { ensureAuthenticatedInProduction } from '../lib/auth.js';
import { createHttpError, methodNotAllowed, sendJson } from '../lib/http.js';
import { prisma, requireDatabase } from '../lib/prisma.js';

async function handleSongs(req, res) {
  requireDatabase();
  await ensureAuthenticatedInProduction(req);

  if (req.method === 'GET') {
    const { search } = req.query;
    const where = search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { artist: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    return sendJson(res, 200, await prisma.song.findMany({ where, orderBy: { title: 'asc' } }));
  }

  if (req.method === 'POST') {
    const { title, artist, defaultKey, bpm, chordsUrl, videoUrl, lyrics } = req.body || {};
    if (!title || !artist || !defaultKey) {
      throw createHttpError(400, 'validation_error', 'Titulo, artista e tom padrao sao obrigatorios.');
    }

    const song = await prisma.song.create({
      data: {
        title,
        artist,
        defaultKey,
        bpm: bpm ? Number(bpm) : null,
        chordsUrl: chordsUrl || null,
        videoUrl: videoUrl || null,
        lyrics: lyrics || null,
      },
    });

    return sendJson(res, 201, song);
  }

  if (req.method === 'PUT') {
    const { id, ...updateData } = req.body || {};
    const songId = id || req.query.id;
    if (!songId) throw createHttpError(400, 'validation_error', 'ID da musica e obrigatorio.');
    if (updateData.bpm) updateData.bpm = Number(updateData.bpm);
    return sendJson(res, 200, await prisma.song.update({ where: { id: songId }, data: updateData }));
  }

  if (req.method === 'DELETE') {
    const id = req.query.id || req.body?.id;
    if (!id) throw createHttpError(400, 'validation_error', 'ID da musica e obrigatorio.');
    await prisma.song.delete({ where: { id } });
    return sendJson(res, 200, { message: 'Musica excluida com sucesso.' });
  }

  return methodNotAllowed(res, ['GET', 'POST', 'PUT', 'DELETE']);
}

async function handleScales(req, res) {
  requireDatabase();
  const authenticatedUser = await ensureAuthenticatedInProduction(req);

  if (req.method === 'GET') {
    const scales = await prisma.worshipScale.findMany({
      include: {
        lineup: {
          include: { member: { select: { id: true, name: true, phone: true } } },
        },
        setlist: {
          include: { song: { select: { id: true, title: true, artist: true, defaultKey: true } } },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { date: 'desc' },
    });
    return sendJson(res, 200, scales);
  }

  if (req.method === 'POST') {
    const { date, eventName, notes, lineup, setlist } = req.body || {};
    if (!date || !eventName) {
      throw createHttpError(400, 'validation_error', 'Data e nome do evento sao obrigatorios.');
    }

    const scale = await prisma.worshipScale.create({
      data: {
        date: new Date(date),
        eventName,
        notes: notes || null,
        lineup: lineup?.length
          ? {
              create: lineup.map((item) => ({
                memberId: item.memberId,
                instrument: item.instrument,
                status: 'PENDING',
              })),
            }
          : undefined,
        setlist: setlist?.length
          ? {
              create: setlist.map((item, idx) => ({
                songId: item.songId,
                order: Number(item.order !== undefined ? item.order : idx + 1),
                customKey: item.customKey || null,
              })),
            }
          : undefined,
      },
      include: {
        lineup: { include: { member: { select: { id: true, name: true } } } },
        setlist: { include: { song: { select: { id: true, title: true } } } },
      },
    });

    return sendJson(res, 201, scale);
  }

  if (req.method === 'PUT') {
    const { scaleId, memberId, instrument, status } = req.body || {};
    if (!scaleId || !memberId || !instrument || !status) {
      throw createHttpError(400, 'validation_error', 'scaleId, memberId, instrument e status sao obrigatorios.');
    }

    if (!['PENDING', 'CONFIRMED', 'DECLINED'].includes(status)) {
      throw createHttpError(400, 'invalid_status', 'Status invalido.');
    }

    let isAuthorized = authenticatedUser?.role === 'admin';
    if (!isAuthorized) {
      const member = await prisma.member.findFirst({
        where: { id: memberId, userId: authenticatedUser.id },
      });
      isAuthorized = Boolean(member);
    }

    if (!isAuthorized) {
      throw createHttpError(403, 'forbidden', 'Voce nao tem permissao para alterar esta escala.');
    }

    const lineup = await prisma.worshipLineup.update({
      where: { scaleId_memberId_instrument: { scaleId, memberId, instrument } },
      data: { status },
    });

    return sendJson(res, 200, lineup);
  }

  if (req.method === 'DELETE') {
    const id = req.query.id || req.body?.id;
    if (!id) throw createHttpError(400, 'validation_error', 'ID da escala e obrigatorio.');
    await prisma.worshipScale.delete({ where: { id } });
    return sendJson(res, 200, { message: 'Escala excluida com sucesso.' });
  }

  return methodNotAllowed(res, ['GET', 'POST', 'PUT', 'DELETE']);
}

export function louvorHandler(req, res) {
  if (req.query.resource === 'songs') {
    return handleSongs(req, res);
  }

  if (req.query.resource === 'scales') {
    return handleScales(req, res);
  }

  return sendJson(res, 404, {
    error: 'not_found',
    message: 'Rota de louvor nao encontrada.',
  });
}
