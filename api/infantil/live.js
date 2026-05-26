import { PrismaClient } from '@prisma/client';

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  if (process.env.VITE_AUTH_MODE === 'mock' || !process.env.DATABASE_URL) {
    return res.status(503).json({ error: 'API Offline' });
  }

  try {
    // SWR Cache - Revalidates in background after 5s
    res.setHeader('Cache-Control', 'public, s-maxage=5, stale-while-revalidate=59');

    // Only get active checkins from today (last 16 hours to be safe)
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - 16);

    const activeCheckins = await prisma.childCheckin.findMany({
      where: {
        checkoutTime: null,
        checkinTime: { gte: cutoff }
      },
      include: {
        child: { select: { id: true, name: true, allergies: true, birthDate: true } },
        guardian: { select: { name: true } }
      },
      orderBy: { checkinTime: 'desc' }
    });

    return res.status(200).json(activeCheckins);

  } catch (error) {
    console.error('[API Infantil Live Error]', error);
    return res.status(500).json({ error: 'Erro interno na live feed.' });
  }
}
