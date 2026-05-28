import { useState, useEffect, useCallback } from 'react';
import { financeiroService } from '../services/financeiroService.js';

function getCurrentMonthFilters() {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    search: '',
    type: '',
    accountId: '',
    categoryId: '',
    startDate: startDate.toISOString().slice(0, 10),
    endDate: endDate.toISOString().slice(0, 10),
  };
}

export function useFinanceiro({ enabled = true } = {}) {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ balance: 0, totalInflow: 0, totalOutflow: 0, periodResult: 0, accounts: [] });
  const [supportData, setSupportData] = useState({ accounts: [], categories: [] });
  const [filters, setFilters] = useState(getCurrentMonthFilters);
  const [isLoading, setIsLoading] = useState(enabled);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDashboard = useCallback(async () => {
    if (!enabled) {
      setTransactions([]);
      setSummary({ balance: 0, totalInflow: 0, totalOutflow: 0, periodResult: 0, accounts: [] });
      setSupportData({ accounts: [], categories: [] });
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const [summaryData, transactionsData, supportDataResponse] = await Promise.all([
        financeiroService.getSummary(filters),
        financeiroService.getTransactions(filters),
        financeiroService.getSupportData(),
      ]);

      setSummary(summaryData);
      setTransactions(transactionsData);
      setSupportData(supportDataResponse);
    } catch (error) {
      console.error('Erro ao carregar dados financeiros', error);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, filters]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const addTransaction = async (txData) => {
    if (!enabled) return false;

    try {
      setIsSubmitting(true);
      await financeiroService.createTransaction(txData);
      await fetchDashboard();
      return true;
    } catch (error) {
      console.error('Erro ao salvar transacao', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteTransaction = async (id) => {
    if (!enabled) return;

    try {
      setIsSubmitting(true);
      await financeiroService.deleteTransaction(id);
      await fetchDashboard();
    } catch (error) {
      console.error('Erro ao excluir transacao', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFilter = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }));
  };

  const resetFilters = () => {
    setFilters(getCurrentMonthFilters());
  };

  return {
    transactions,
    summary,
    supportData,
    filters,
    isLoading,
    isSubmitting,
    addTransaction,
    deleteTransaction,
    updateFilter,
    resetFilters,
  };
}
