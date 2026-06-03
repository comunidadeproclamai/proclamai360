import { getAuthenticatedUser, requirePermission } from '../../lib/auth.js';
import { methodNotAllowed, sendJson } from '../../lib/http.js';
import { PERMISSIONS } from '../../lib/permissions.js';
import { requireDatabase } from '../../lib/prisma.js';
import {
  createTransaction,
  deleteTransaction,
  getFinancialSummary,
  getSupportData,
  listTransactions,
  updateTransaction,
  bulkCreateTransactions,
  getFinancialChartData,
} from './financial.service.js';

async function ensureFinanceReader(req) {
  requireDatabase();
  const authenticatedUser = await getAuthenticatedUser(req);
  requirePermission(authenticatedUser, PERMISSIONS.FINANCIAL_READ);
  return authenticatedUser;
}

async function ensureFinanceManager(req) {
  requireDatabase();
  const authenticatedUser = await getAuthenticatedUser(req);
  requirePermission(authenticatedUser, PERMISSIONS.FINANCIAL_WRITE);
  return authenticatedUser;
}

export async function handleFinancialSummary(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  await ensureFinanceReader(req);
  res.setHeader('Cache-Control', 'private, no-store');
  return sendJson(res, 200, await getFinancialSummary(req.query));
}

export async function handleFinancialSupportData(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  await ensureFinanceReader(req);
  return sendJson(res, 200, await getSupportData());
}

export async function handleFinancialTransactions(req, res) {
  if (req.method === 'GET') {
    await ensureFinanceReader(req);
    return sendJson(res, 200, await listTransactions(req.query));
  }

  if (req.method === 'POST') {
    const authenticatedUser = await ensureFinanceManager(req);
    return sendJson(res, 201, await createTransaction(authenticatedUser, req.body));
  }

  return methodNotAllowed(res, ['GET', 'POST']);
}

export async function handleFinancialTransactionById(req, res) {
  const authenticatedUser = await ensureFinanceManager(req);
  
  if (req.method === 'DELETE') {
    return sendJson(res, 200, await deleteTransaction(authenticatedUser, req.query.id));
  }

  if (req.method === 'PUT') {
    return sendJson(res, 200, await updateTransaction(authenticatedUser, req.query.id, req.body));
  }

  return methodNotAllowed(res, ['PUT', 'DELETE']);
}

export async function handleFinancialBulk(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  const authenticatedUser = await ensureFinanceManager(req);
  return sendJson(res, 201, await bulkCreateTransactions(authenticatedUser, req.body.transactions || req.body));
}

export async function handleFinancialCharts(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  await ensureFinanceReader(req);
  return sendJson(res, 200, await getFinancialChartData(req.query));
}
