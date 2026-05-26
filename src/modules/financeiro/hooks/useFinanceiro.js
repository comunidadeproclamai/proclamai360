import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../../services/apiClient.js';
import { useAuth } from '../../auth/hooks/useAuth.js';

export function useFinanceiro() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ balance: 0, totalInflow: 0, totalOutflow: 0 });
  const [supportData, setSupportData] = useState({ accounts: [], categories: [] });
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    try {
      const [summaryRes, txRes, supportRes] = await Promise.all([
        apiClient.get('/financial/summary'),
        apiClient.get('/financial/transactions'),
        apiClient.get('/financial/support-data')
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

  const addTransaction = async (data) => {
    try {
      await apiClient.post('/financial/transactions', {
        ...data,
        createdById: user?.id
      });
      await fetchDashboard();
      return true;
    } catch (error) {
      console.error('Erro ao salvar transação', error);
      throw error;
    }
  };

  const deleteTransaction = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta transação? O saldo da conta será recalculado.')) return;
    try {
      await apiClient.delete(`/financial/transactions/${id}`);
      await fetchDashboard();
    } catch (error) {
      console.error('Erro ao excluir transação', error);
    }
  };

  return {
    transactions,
    summary,
    supportData,
    isLoading,
    addTransaction,
    deleteTransaction
  };
}
