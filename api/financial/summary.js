import { prisma } from '../shared/prisma.js';

export default async function handler(req, res) {
  const { method } = req;

  if (!process.env.DATABASE_URL) {
    return res.status(503).json({ error: 'API Offline' });
  }

  try {
    switch (method) {
      case 'GET':
        // Edge Caching Configuration for performance
        res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=59');

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const [inflowAgg, outflowAgg, accounts] = await Promise.all([
          prisma.financialTransaction.aggregate({
            where: { type: 'INFLOW', date: { gte: startOfMonth } },
            _sum: { amount: true }
          }),
          prisma.financialTransaction.aggregate({
            where: { type: 'OUTFLOW', date: { gte: startOfMonth } },
            _sum: { amount: true }
          }),
          prisma.financialAccount.findMany({ select: { balance: true } })
        ]);

        const totalBalance = accounts.reduce((acc, curr) => acc + Number(curr.balance), 0);

        return res.status(200).json({
          totalInflow: Number(inflowAgg._sum.amount || 0),
          totalOutflow: Number(outflowAgg._sum.amount || 0),
          balance: totalBalance
        });

      default:
        res.setHeader('Allow', ['GET']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('[API Financial Summary Error]', error);
    return res.status(500).json({ error: 'Erro interno ao agregar finanças.' });
  }
}
