import { prisma } from '../../shared/prisma.js';

export default async function handler(req, res) {
  const { method, query: { id } } = req;

  if (!process.env.DATABASE_URL) {
    return res.status(503).json({ error: 'API Offline' });
  }

  try {
    switch (method) {
      case 'DELETE':
        const transaction = await prisma.financialTransaction.findUnique({
          where: { id }
        });

        if (!transaction) {
          return res.status(404).json({ error: 'Transação não encontrada.' });
        }

        const isOutflow = transaction.type === 'OUTFLOW';
        // Rollback: se era despesa, devolve o dinheiro (+). Se era receita, tira o dinheiro (-).
        const amountModifier = isOutflow ? { increment: transaction.amount } : { decrement: transaction.amount };

        await prisma.$transaction([
          prisma.financialTransaction.delete({ where: { id } }),
          prisma.financialAccount.update({
            where: { id: transaction.accountId },
            data: { balance: amountModifier }
          })
        ]);

        return res.status(200).json({ success: true });

      default:
        res.setHeader('Allow', ['DELETE']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('[API Financial Tx DELETE Error]', error);
    return res.status(500).json({ error: 'Erro interno ao excluir transação.' });
  }
}
