import { auditAction } from '../../lib/audit.js';
import { createHttpError } from '../../lib/http.js';
import { prisma } from '../../lib/prisma.js';

const TRANSACTION_TYPES = ['INFLOW', 'OUTFLOW'];
const MAX_TRANSACTION_LIMIT = 200;

function trimValue(value) {
  return typeof value === 'string' ? value.trim() : value;
}

function parseDate(value, fallback, { endOfDay = false } = {}) {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw createHttpError(400, 'invalid_date', 'Data invalida.');
  }
  if (endOfDay) {
    date.setHours(23, 59, 59, 999);
  }
  return date;
}

function getDefaultPeriod(query = {}) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  return {
    startDate: parseDate(query.startDate, startOfMonth),
    endDate: parseDate(query.endDate, endOfMonth, { endOfDay: true }),
  };
}

function buildTransactionWhere(query = {}) {
  const search = trimValue(query.search);
  const { startDate, endDate } = getDefaultPeriod(query);
  const where = {
    AND: [
      { date: { gte: startDate, lte: endDate } },
      query.type && TRANSACTION_TYPES.includes(query.type) ? { type: query.type } : {},
      query.accountId ? { accountId: query.accountId } : {},
      query.categoryId ? { categoryId: query.categoryId } : {},
      search
        ? {
            OR: [
              { description: { contains: search, mode: 'insensitive' } },
              { category: { is: { name: { contains: search, mode: 'insensitive' } } } },
              { account: { is: { name: { contains: search, mode: 'insensitive' } } } },
            ],
          }
        : {},
    ],
  };

  return where;
}

function normalizeTransactionPayload(payload = {}) {
  const description = trimValue(payload.description);
  const type = trimValue(payload.type);
  const amount = Number(payload.amount);
  const date = payload.date ? new Date(payload.date) : new Date();
  const categoryId = trimValue(payload.categoryId);
  const accountId = trimValue(payload.accountId);

  if (!description || !categoryId || !accountId) {
    throw createHttpError(400, 'validation_error', 'Descricao, categoria e conta sao obrigatorias.');
  }

  if (!TRANSACTION_TYPES.includes(type)) {
    throw createHttpError(400, 'invalid_transaction_type', 'Tipo de transacao invalido.');
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    throw createHttpError(400, 'invalid_amount', 'Informe um valor maior que zero.');
  }

  if (Number.isNaN(date.getTime())) {
    throw createHttpError(400, 'invalid_date', 'Data da transacao invalida.');
  }

  return {
    description,
    type,
    amount,
    date,
    categoryId,
    accountId,
  };
}

function mapTransaction(transaction) {
  return {
    ...transaction,
    amount: Number(transaction.amount),
    category: transaction.category.name,
    categoryId: transaction.categoryId,
    account: transaction.account.name,
    accountId: transaction.accountId,
    createdBy: transaction.createdBy.name,
  };
}

export async function getFinancialSummary(query = {}) {
  const where = buildTransactionWhere(query);
  const [inflowAgg, outflowAgg, accounts] = await Promise.all([
    prisma.financialTransaction.aggregate({
      where: { ...where, AND: [...where.AND, { type: 'INFLOW' }] },
      _sum: { amount: true },
    }),
    prisma.financialTransaction.aggregate({
      where: { ...where, AND: [...where.AND, { type: 'OUTFLOW' }] },
      _sum: { amount: true },
    }),
    prisma.financialAccount.findMany({ select: { id: true, name: true, type: true, balance: true } }),
  ]);

  const totalInflow = Number(inflowAgg._sum.amount || 0);
  const totalOutflow = Number(outflowAgg._sum.amount || 0);

  return {
    totalInflow,
    totalOutflow,
    periodResult: totalInflow - totalOutflow,
    balance: accounts.reduce((acc, curr) => acc + Number(curr.balance), 0),
    accounts: accounts.map((account) => ({ ...account, balance: Number(account.balance) })),
  };
}

export async function getSupportData() {
  const [accounts, categories] = await Promise.all([
    prisma.financialAccount.findMany({
      select: { id: true, name: true, type: true, balance: true },
      orderBy: { name: 'asc' },
    }),
    prisma.financialCategory.findMany({
      select: { id: true, name: true, type: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  return {
    accounts: accounts.map((account) => ({ ...account, balance: Number(account.balance) })),
    categories,
  };
}

export async function listTransactions(query = {}) {
  const requestedLimit = Number(query.limit || 10);
  const limit = Number.isFinite(requestedLimit)
    ? Math.min(Math.max(Math.trunc(requestedLimit), 1), MAX_TRANSACTION_LIMIT)
    : 10;
    
  const page = Number(query.page || 1);
  const skip = (page - 1) * limit;
  const whereClause = buildTransactionWhere(query);

  const [transactions, total] = await Promise.all([
    prisma.financialTransaction.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
      skip,
      take: limit,
      include: {
        category: { select: { name: true } },
        account: { select: { name: true } },
        createdBy: { select: { name: true } },
      },
    }),
    prisma.financialTransaction.count({ where: whereClause })
  ]);

  return {
    data: transactions.map(mapTransaction),
    meta: {
      total,
      page,
      totalPages: Math.ceil(total / limit),
    }
  };
}

export async function createTransaction(authenticatedUser, payload = {}) {
  const data = normalizeTransactionPayload(payload);

  const [account, category] = await Promise.all([
    prisma.financialAccount.findUnique({ where: { id: data.accountId }, select: { id: true } }),
    prisma.financialCategory.findUnique({ where: { id: data.categoryId }, select: { id: true, type: true } }),
  ]);

  if (!account) throw createHttpError(404, 'account_not_found', 'Conta financeira nao encontrada.');
  if (!category) throw createHttpError(404, 'category_not_found', 'Categoria financeira nao encontrada.');
  if (category.type !== data.type) {
    throw createHttpError(400, 'category_type_mismatch', 'Categoria incompativel com o tipo de lancamento.');
  }

  const amountModifier =
    data.type === 'OUTFLOW' ? { decrement: data.amount } : { increment: data.amount };

  const [transaction, updatedAccount] = await prisma.$transaction([
    prisma.financialTransaction.create({
      data: {
        ...data,
        createdById: authenticatedUser.id,
      },
      include: {
        category: { select: { name: true } },
        account: { select: { name: true } },
        createdBy: { select: { name: true } },
      },
    }),
    prisma.financialAccount.update({
      where: { id: data.accountId },
      data: { balance: amountModifier },
    }),
  ]);

  await auditAction(authenticatedUser, 'financial.transaction.create', {
    transactionId: transaction.id,
    accountId: data.accountId,
    categoryId: data.categoryId,
    amount: data.amount,
    type: data.type,
  });

  return {
    transaction: mapTransaction(transaction),
    accountBalance: Number(updatedAccount.balance),
  };
}

export async function deleteTransaction(authenticatedUser, id) {
  if (!id) throw createHttpError(400, 'validation_error', 'ID da transacao e obrigatorio.');

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

  return { success: true };
}

export async function updateTransaction(authenticatedUser, id, payload = {}) {
  if (!id) throw createHttpError(400, 'validation_error', 'ID da transacao e obrigatorio.');
  const data = normalizeTransactionPayload(payload);

  const existingTransaction = await prisma.financialTransaction.findUnique({ where: { id } });
  if (!existingTransaction) throw createHttpError(404, 'not_found', 'Transacao nao encontrada.');

  const [account, category] = await Promise.all([
    prisma.financialAccount.findUnique({ where: { id: data.accountId }, select: { id: true } }),
    prisma.financialCategory.findUnique({ where: { id: data.categoryId }, select: { id: true, type: true } }),
  ]);

  if (!account) throw createHttpError(404, 'account_not_found', 'Conta financeira nao encontrada.');
  if (!category) throw createHttpError(404, 'category_not_found', 'Categoria financeira nao encontrada.');
  if (category.type !== data.type) {
    throw createHttpError(400, 'category_type_mismatch', 'Categoria incompativel com o tipo de lancamento.');
  }

  // Calculate balance adjustments if amount or account changed
  const reverseModifier = existingTransaction.type === 'OUTFLOW' 
    ? { increment: existingTransaction.amount } 
    : { decrement: existingTransaction.amount };
    
  const newModifier = data.type === 'OUTFLOW' 
    ? { decrement: data.amount } 
    : { increment: data.amount };

  const transactions = [];

  // Revert old transaction effect on old account
  transactions.push(prisma.financialAccount.update({
    where: { id: existingTransaction.accountId },
    data: { balance: reverseModifier },
  }));

  // Apply new transaction effect on new account
  transactions.push(prisma.financialAccount.update({
    where: { id: data.accountId },
    data: { balance: newModifier },
  }));

  // Update the transaction itself
  transactions.push(prisma.financialTransaction.update({
    where: { id },
    data: {
      ...data,
      updatedAt: new Date(),
    },
    include: {
      category: { select: { name: true } },
      account: { select: { name: true } },
      createdBy: { select: { name: true } },
    },
  }));

  const results = await prisma.$transaction(transactions);
  const updatedTransaction = results[2];

  await auditAction(authenticatedUser, 'financial.transaction.update', {
    transactionId: updatedTransaction.id,
    accountId: data.accountId,
    categoryId: data.categoryId,
    amount: data.amount,
    type: data.type,
  });

  return mapTransaction(updatedTransaction);
}

export async function bulkCreateTransactions(authenticatedUser, transactionsPayload = []) {
  if (!Array.isArray(transactionsPayload) || transactionsPayload.length === 0) {
    throw createHttpError(400, 'validation_error', 'Nenhuma transação para importar.');
  }

  const normalized = transactionsPayload.map(normalizeTransactionPayload);

  // Group balances by account
  const accountAdjustments = {};
  for (const data of normalized) {
    if (!accountAdjustments[data.accountId]) accountAdjustments[data.accountId] = 0;
    accountAdjustments[data.accountId] += (data.type === 'OUTFLOW' ? -data.amount : data.amount);
  }

  const operations = [];

  // 1. Create all transactions
  operations.push(prisma.financialTransaction.createMany({
    data: normalized.map(t => ({ ...t, createdById: authenticatedUser.id }))
  }));

  // 2. Update all accounts
  for (const [accountId, adjustment] of Object.entries(accountAdjustments)) {
    if (adjustment !== 0) {
      operations.push(prisma.financialAccount.update({
        where: { id: accountId },
        data: {
          balance: adjustment > 0 ? { increment: adjustment } : { decrement: Math.abs(adjustment) }
        }
      }));
    }
  }

  await prisma.$transaction(operations);

  await auditAction(authenticatedUser, 'financial.transaction.bulk_create', {
    count: normalized.length,
    accountsAffected: Object.keys(accountAdjustments).length
  });

  return { success: true, count: normalized.length };
}

export async function getFinancialChartData(query = {}) {
  const where = buildTransactionWhere(query);

  const transactions = await prisma.financialTransaction.findMany({
    where,
    select: {
      date: true,
      amount: true,
      type: true,
      category: { select: { name: true } }
    },
    orderBy: { date: 'asc' }
  });

  const daily = {};
  const categories = {};

  transactions.forEach(tx => {
    const dateStr = tx.date.toISOString().split('T')[0];
    
    // Daily
    if (!daily[dateStr]) daily[dateStr] = { date: dateStr, INFLOW: 0, OUTFLOW: 0 };
    daily[dateStr][tx.type] += Number(tx.amount);

    // Categories
    const catName = tx.category.name;
    if (!categories[catName]) categories[catName] = { name: catName, INFLOW: 0, OUTFLOW: 0 };
    categories[catName][tx.type] += Number(tx.amount);
  });

  return {
    daily: Object.values(daily),
    categories: Object.values(categories)
  };
}
