import { sendJson } from '../lib/http.js';
import {
  handleFinancialSummary,
  handleFinancialSupportData,
  handleFinancialTransactionById,
  handleFinancialTransactions,
  handleFinancialBulk,
  handleFinancialCharts,
} from '../modules/financial/financial.handler.js';

export function financialHandler(req, res) {
  if (req.query.route === 'summary') {
    return handleFinancialSummary(req, res);
  }

  if (req.query.route === 'support-data') {
    return handleFinancialSupportData(req, res);
  }

  if (req.query.route === 'transactions') {
    return handleFinancialTransactions(req, res);
  }

  if (req.query.route === 'bulk') {
    return handleFinancialBulk(req, res);
  }

  if (req.query.route === 'charts') {
    return handleFinancialCharts(req, res);
  }

  return sendJson(res, 404, {
    error: 'not_found',
    message: 'Rota financeira nao encontrada.',
  });
}

export function financialTransactionByIdHandler(req, res) {
  return handleFinancialTransactionById(req, res);
}
