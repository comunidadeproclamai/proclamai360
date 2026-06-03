import { useState, useEffect, useCallback } from 'react';
import { financeiroService } from '../services/financeiroService.js';
import { useToast } from '../../../contexts/ToastContext.jsx';
import { realtimeService } from '../../../services/realtimeService.js';

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
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const toast = useToast();

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
        financeiroService.getTransactions({ ...filters, page, limit }),
        financeiroService.getSupportData(),
      ]);

      setSummary(summaryData);
      setTransactions(transactionsData.data || []);
      setTotalPages(transactionsData.meta?.totalPages || 1);
      setSupportData(supportDataResponse);
    } catch (error) {
      toast.error('Erro ao carregar dados financeiros.');
      console.error('Erro ao carregar dados financeiros', error);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, filters, page, toast]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Realtime updates
  useEffect(() => {
    if (!enabled) return;
    const channel = realtimeService.subscribeToInserts('financial_transactions', () => {
      fetchDashboard();
    });
    return () => realtimeService.unsubscribe(channel);
  }, [enabled, fetchDashboard]);

  const addTransaction = async (txData) => {
    if (!enabled) return false;
    try {
      setIsSubmitting(true);
      await financeiroService.createTransaction(txData);
      toast.success('Lançamento salvo com sucesso!');
      await fetchDashboard();
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao salvar transação.');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateTransaction = async (id, txData) => {
    if (!enabled) return false;
    try {
      setIsSubmitting(true);
      await financeiroService.updateTransaction(id, txData);
      toast.success('Lançamento atualizado com sucesso!');
      await fetchDashboard();
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao atualizar transação.');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const importTransactions = async (transactions) => {
    if (!enabled) return false;
    try {
      setIsSubmitting(true);
      const res = await financeiroService.importTransactions(transactions);
      toast.success(`${res.count} lançamentos importados com sucesso!`);
      await fetchDashboard();
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao importar transações.');
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
      toast.success('Lançamento removido e saldo recalculado.');
      await fetchDashboard();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao excluir transação.');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFilter = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }));
    setPage(1); // Reset page on filter change
  };

  const resetFilters = () => {
    setFilters(getCurrentMonthFilters());
    setPage(1);
  };

  return {
    transactions,
    summary,
    supportData,
    filters,
    isLoading,
    isSubmitting,
    page,
    setPage,
    totalPages,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    importTransactions,
    updateFilter,
    resetFilters,
  };
}
