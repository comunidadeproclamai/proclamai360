import { prisma } from '../shared/prisma.js';
import { getAuthenticatedUser } from '../shared/auth.js';

export default async function handler(req, res) {
  const { method } = req;

  if (!process.env.DATABASE_URL) {
    return res.status(503).json({ error: 'API Offline' });
  }

  try {
    // Authenticate user
    let authenticatedUser;
    try {
      authenticatedUser = await getAuthenticatedUser(req);
    } catch (e) {
      if (process.env.NODE_ENV === 'production') {
        return res.status(401).json({ error: 'Não autorizado.' });
      }
      // Dev mode fallback
      authenticatedUser = await prisma.user.findFirst();
    }

    switch (method) {
      case 'GET':
        // Fetch all scales including relationships
        const scales = await prisma.worshipScale.findMany({
          include: {
            lineup: {
              include: {
                member: { select: { id: true, name: true, phone: true } }
              }
            },
            setlist: {
              include: {
                song: { select: { id: true, title: true, artist: true, defaultKey: true } }
              },
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { date: 'desc' }
        });
        return res.status(200).json(scales);

      case 'POST':
        const { date, eventName, notes, lineup, setlist } = req.body;
        if (!date || !eventName) {
          return res.status(400).json({ error: 'Data e nome do evento são obrigatórios.' });
        }

        const newScale = await prisma.worshipScale.create({
          data: {
            date: new Date(date),
            eventName,
            notes: notes || null,
            lineup: lineup && lineup.length > 0 ? {
              create: lineup.map(item => ({
                memberId: item.memberId,
                instrument: item.instrument,
                status: 'PENDING'
              }))
            } : undefined,
            setlist: setlist && setlist.length > 0 ? {
              create: setlist.map((item, idx) => ({
                songId: item.songId,
                order: Number(item.order !== undefined ? item.order : idx + 1),
                customKey: item.customKey || null
              }))
            } : undefined
          },
          include: {
            lineup: {
              include: {
                member: { select: { id: true, name: true } }
              }
            },
            setlist: {
              include: {
                song: { select: { id: true, title: true } }
              }
            }
          }
        });

        return res.status(201).json(newScale);

      case 'PUT':
        const { scaleId, memberId, instrument, status: newStatus } = req.body;
        if (!scaleId || !memberId || !instrument || !newStatus) {
          return res.status(400).json({ error: 'scaleId, memberId, instrument e status são obrigatórios.' });
        }

        if (!['PENDING', 'CONFIRMED', 'DECLINED'].includes(newStatus)) {
          return res.status(400).json({ error: 'Status inválido. Use PENDING, CONFIRMED ou DECLINED.' });
        }

        // Security check
        let isAuthorized = false;
        if (authenticatedUser.role === 'admin') {
          isAuthorized = true;
        } else {
          // Find if this user is linked to the requested memberId
          const member = await prisma.member.findFirst({
            where: { id: memberId, userId: authenticatedUser.id }
          });
          if (member) {
            isAuthorized = true;
          }
        }

        if (!isAuthorized) {
          return res.status(403).json({ error: 'Você não tem permissão para alterar a escala deste músico.' });
        }

        const updatedLineup = await prisma.worshipLineup.update({
          where: {
            scaleId_memberId_instrument: {
              scaleId,
              memberId,
              instrument
            }
          },
          data: {
            status: newStatus
          }
        });

        return res.status(200).json(updatedLineup);

      case 'DELETE':
        const deleteId = req.query.id || req.body.id;
        if (!deleteId) {
          return res.status(400).json({ error: 'ID da escala é obrigatório.' });
        }

        await prisma.worshipScale.delete({
          where: { id: deleteId }
        });
        return res.status(200).json({ message: 'Escala excluída com sucesso.' });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('[API Scales Error]', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Escala ou músico não encontrado.' });
    }
    return res.status(500).json({ error: 'Erro interno ao processar escalas.' });
  }
}
