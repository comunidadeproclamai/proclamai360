import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../../services/apiClient.js';
import { useAuth } from '../../auth/hooks/useAuth.js';
import { appConfig } from '../../../config/appConfig.js';

function isMockEnabled() {
  return import.meta.env.DEV && appConfig.authMode === 'mock';
}

const MOCK_SUPPORT_DATA = {
  accounts: ['Caixa Geral', 'Banco Itaú', 'Fundo de Missões', 'Fundo de Construção'],
  categories: ['Dízimo', 'Oferta Voluntária', 'Oferta de Missões', 'Aluguel Sede', 'Água/Luz/Internet', 'Equipamentos', 'Ação Social', 'Eventos']
};

export function useFinanceiro() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ balance: 0, totalInflow: 0, totalOutflow: 0 });
  const [supportData, setSupportData] = useState({ accounts: [], categories: [] });
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    if (isMockEnabled()) {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 300));
      const storedTx = localStorage.getItem('proclamai_mock_transactions');
      const txList = storedTx ? JSON.parse(storedTx) : [];
      
      // Calculate summary dynamically
      let totalInflow = 0;
      let totalOutflow = 0;
      txList.forEach(t => {
        const val = Number(t.amount || 0);
        if (t.type === 'INFLOW') {
          totalInflow += val;
        } else if (t.type === 'OUTFLOW') {
          totalOutflow += val;
        }
      });
      const balance = totalInflow - totalOutflow;

      setTransactions(txList);
      setSummary({ balance, totalInflow, totalOutflow });
      setSupportData(MOCK_SUPPORT_DATA);
      setIsLoading(false);
      return;
    }

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

  const addTransaction = async (txData) => {
    if (isMockEnabled()) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const newTx = {
        ...txData,
        id: 'tx-' + Math.random().toString(36).substring(2, 11),
        amount: Number(txData.amount || 0),
        date: txData.date || new Date().toISOString(),
        createdById: user?.id || 'mock-user'
      };

      const storedTx = localStorage.getItem('proclamai_mock_transactions');
      const txList = storedTx ? JSON.parse(storedTx) : [];
      const updatedList = [newTx, ...txList];
      localStorage.setItem('proclamai_mock_transactions', JSON.stringify(updatedList));
      
      // Refresh local states
      await fetchDashboard();
      return true;
    }

    try {
      await apiClient.post('/financial/transactions', {
        ...txData,
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
    
    if (isMockEnabled()) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const storedTx = localStorage.getItem('proclamai_mock_transactions');
      const txList = storedTx ? JSON.parse(storedTx) : [];
      const updatedList = txList.filter(t => t.id !== id);
      localStorage.setItem('proclamai_mock_transactions', JSON.stringify(updatedList));
      
      await fetchDashboard();
      return;
    }

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
