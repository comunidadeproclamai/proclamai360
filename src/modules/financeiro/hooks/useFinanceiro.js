import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../../services/apiClient.js';

export function useFinanceiro() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ balance: 0, totalInflow: 0, totalOutflow: 0 });
  const [supportData, setSupportData] = useState({ accounts: [], categories: [] });
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      const [summaryRes, txRes, supportRes] = await Promise.all([
        apiClient.get('/financial/summary'),
        apiClient.get('/financial/transactions'),
        apiClient.get('/financial/support-data'),
      ]);

      setSummary(summaryRes.data);
      setTransactions(txRes.data);
      setSupportData(supportRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados financeiros', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const addTransaction = async (txData) => {
    try {
      await apiClient.post('/financial/transactions', txData);
      await fetchDashboard();
      return true;
    } catch (error) {
      console.error('Erro ao salvar transacao', error);
      throw error;
    }
  };

  const deleteTransaction = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta transacao? O saldo da conta sera recalculado.')) {
      return;
    }

    try {
      await apiClient.delete(`/financial/transactions/${id}`);
      await fetchDashboard();
    } catch (error) {
      console.error('Erro ao excluir transacao', error);
    }
  };

  return {
    transactions,
    summary,
    supportData,
    isLoading,
    addTransaction,
    deleteTransaction,
  };
}
