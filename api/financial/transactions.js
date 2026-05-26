import { PrismaClient } from '@prisma/client';

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

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

      default:
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('[API Financial Tx Error]', error);
    return res.status(500).json({ error: 'Erro interno no servidor financeiro.' });
  }
}
