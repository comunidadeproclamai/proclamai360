import { PrismaClient } from '@prisma/client';

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const [accounts, categories] = await Promise.all([
      prisma.financialAccount.findMany({
        select: { id: true, name: true, type: true },
        orderBy: { name: 'asc' }
      }),
      prisma.financialCategory.findMany({
        select: { id: true, name: true, type: true },
        orderBy: { name: 'asc' }
      })
    ]);

    return res.status(200).json({ accounts, categories });
  } catch (error) {
    console.error('[API Financial Support Data Error]', error);
    return res.status(500).json({ error: 'Erro ao buscar dados de suporte financeiro.' });
  }
}
