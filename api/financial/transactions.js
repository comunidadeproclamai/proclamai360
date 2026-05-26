import { prisma } from '../shared/prisma.js';

export default async function handler(req, res) {
  const { method } = req;

  if (process.env.VITE_AUTH_MODE === 'mock' || !process.env.DATABASE_URL) {
    return res.status(503).json({ error: 'API Offline. Use mock data.' });
  }

  try {
    switch (method) {
      case 'POST':
        const { description, amount, type, categoryId, accountId, createdById } = req.body;
        
        if (!description || !amount || !accountId || !categoryId || !createdById) {
          return res.status(400).json({ error: 'Campos obrigatórios faltando.' });
        }

        const isOutflow = type === 'OUTFLOW';
        const amountModifier = isOutflow ? { decrement: amount } : { increment: amount };

        // Prisma Transaction para garantir integridade do saldo
        const [transaction, updatedAccount] = await prisma.$transaction([
          prisma.financialTransaction.create({
            data: {
              description,
              amount,
              type,
              date: new Date(),
              categoryId,
              accountId,
              createdById
            }
          }),
          prisma.financialAccount.update({
            where: { id: accountId },
            data: { balance: amountModifier }
          })
        ]);

        return res.status(201).json({ transaction, accountBalance: updatedAccount.balance });

      case 'GET':
        const transactionsList = await prisma.financialTransaction.findMany({
          orderBy: { date: 'desc' },
          take: 100,
          include: {
            category: { select: { name: true } },
            account: { select: { name: true } },
            createdBy: { select: { name: true } }
          }
        });
        
        const formatted = transactionsList.map(t => ({
          ...t,
          category: t.category.name,
          account: t.account.name,
          createdBy: t.createdBy.name
        }));

        return res.status(200).json(formatted);

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('[API Financial Tx Error]', error);
    return res.status(500).json({ error: 'Erro interno no servidor financeiro.' });
  }
}
