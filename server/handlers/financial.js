import { auditAction } from '../lib/audit.js';
import { getAuthenticatedUser, requirePermission } from '../lib/auth.js';
import { createHttpError, methodNotAllowed, sendJson } from '../lib/http.js';
import { PERMISSIONS } from '../lib/permissions.js';
import { prisma, requireDatabase } from '../lib/prisma.js';

async function handleSummary(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  requireDatabase();
  const authenticatedUser = await getAuthenticatedUser(req);
  requirePermission(authenticatedUser, PERMISSIONS.FINANCIAL_READ);

  res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=59');

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const [inflowAgg, outflowAgg, accounts] = await Promise.all([
    prisma.financialTransaction.aggregate({
      where: { type: 'INFLOW', date: { gte: startOfMonth } },
      _sum: { amount: true },
    }),
    prisma.financialTransaction.aggregate({
      where: { type: 'OUTFLOW', date: { gte: startOfMonth } },
      _sum: { amount: true },
    }),
    prisma.financialAccount.findMany({ select: { balance: true } }),
  ]);

  return sendJson(res, 200, {
    totalInflow: Number(inflowAgg._sum.amount || 0),
    totalOutflow: Number(outflowAgg._sum.amount || 0),
    balance: accounts.reduce((acc, curr) => acc + Number(curr.balance), 0),
  });
}

async function handleSupportData(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  requireDatabase();
  const authenticatedUser = await getAuthenticatedUser(req);
  requirePermission(authenticatedUser, PERMISSIONS.FINANCIAL_READ);

  const [accounts, categories] = await Promise.all([
    prisma.financialAccount.findMany({
      select: { id: true, name: true, type: true },
      orderBy: { name: 'asc' },
    }),
    prisma.financialCategory.findMany({
      select: { id: true, name: true, type: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  return sendJson(res, 200, { accounts, categories });
}

async function handleTransactions(req, res) {
  requireDatabase();
  const authenticatedUser = await getAuthenticatedUser(req);

  if (req.method === 'GET') {
    requirePermission(authenticatedUser, PERMISSIONS.FINANCIAL_READ);

    const transactions = await prisma.financialTransaction.findMany({
      orderBy: { date: 'desc' },
      take: 100,
      include: {
        category: { select: { name: true } },
        account: { select: { name: true } },
        createdBy: { select: { name: true } },
      },
    });

    return sendJson(
      res,
      200,
      transactions.map((transaction) => ({
        ...transaction,
        category: transaction.category.name,
        account: transaction.account.name,
        createdBy: transaction.createdBy.name,
      })),
    );
  }

  if (req.method === 'POST') {
    requirePermission(authenticatedUser, PERMISSIONS.FINANCIAL_WRITE);

    const { description, amount, type, categoryId, accountId } = req.body || {};
    if (!description || !amount || !accountId || !categoryId) {
      throw createHttpError(400, 'validation_error', 'Campos obrigatorios faltando.');
    }

    if (!['INFLOW', 'OUTFLOW'].includes(type)) {
      throw createHttpError(400, 'invalid_transaction_type', 'Tipo de transacao invalido.');
    }

    const normalizedAmount = Number(amount);
    if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
      throw createHttpError(400, 'invalid_amount', 'Informe um valor maior que zero.');
    }

    const amountModifier =
      type === 'OUTFLOW' ? { decrement: normalizedAmount } : { increment: normalizedAmount };
    const [transaction, updatedAccount] = await prisma.$transaction([
      prisma.financialTransaction.create({
        data: {
          description,
          amount: normalizedAmount,
          type,
          date: new Date(),
          categoryId,
          accountId,
          createdById: authenticatedUser.id,
        },
      }),
      prisma.financialAccount.update({
        where: { id: accountId },
        data: { balance: amountModifier },
      }),
    ]);

    await auditAction(authenticatedUser, 'financial.transaction.create', {
      transactionId: transaction.id,
      accountId,
      amount: normalizedAmount,
      type,
    });

    return sendJson(res, 201, { transaction, accountBalance: updatedAccount.balance });
  }

  return methodNotAllowed(res, ['GET', 'POST']);
}

export async function financialTransactionByIdHandler(req, res) {
  if (req.method !== 'DELETE') return methodNotAllowed(res, ['DELETE']);
  requireDatabase();
  const authenticatedUser = await getAuthenticatedUser(req);
  requirePermission(authenticatedUser, PERMISSIONS.FINANCIAL_WRITE);

  const { id } = req.query;
  const transaction = await prisma.financialTransaction.findUnique({ where: { id } });
  if (!transaction) {
    throw createHttpError(404, 'not_found', 'Transacao nao encontrada.');
  }

  const amountModifier =
    transaction.type === 'OUTFLOW'
      ? { increment: transaction.amount }
      : { decrement: transaction.amount };

  await prisma.$transaction([
    prisma.financialTransaction.delete({ where: { id } }),
    prisma.financialAccount.update({
      where: { id: transaction.accountId },
      data: { balance: amountModifier },
    }),
  ]);

  await auditAction(authenticatedUser, 'financial.transaction.delete', {
    transactionId: transaction.id,
    accountId: transaction.accountId,
    amount: Number(transaction.amount),
    type: transaction.type,
  });

  return sendJson(res, 200, { success: true });
}

export function financialHandler(req, res) {
  if (req.query.route === 'summary') {
    return handleSummary(req, res);
  }

  if (req.query.route === 'support-data') {
    return handleSupportData(req, res);
  }

  if (req.query.route === 'transactions') {
    return handleTransactions(req, res);
  }

  return sendJson(res, 404, {
    error: 'not_found',
    message: 'Rota financeira nao encontrada.',
  });
}
