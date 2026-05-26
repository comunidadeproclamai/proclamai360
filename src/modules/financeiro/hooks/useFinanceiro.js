import { useState, useEffect, useMemo } from 'react';

const MOCK_TRANSACTIONS = [
  { id: '1', description: 'Dízimo - João Silva', amount: 500.00, date: '2026-05-24T10:00:00Z', type: 'INFLOW', category: 'Dízimo' },
  { id: '2', description: 'Conta de Luz', amount: 250.50, date: '2026-05-25T14:30:00Z', type: 'OUTFLOW', category: 'Despesa Fixa' },
  { id: '3', description: 'Oferta Culto Domingo', amount: 1240.00, date: '2026-05-26T20:00:00Z', type: 'INFLOW', category: 'Oferta' },
  { id: '4', description: 'Compra de Material Infantil', amount: 180.00, date: '2026-05-26T09:00:00Z', type: 'OUTFLOW', category: 'Ministério' },
];

export function useFinanceiro() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTransactions(MOCK_TRANSACTIONS);
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const summary = useMemo(() => {
    return transactions.reduce((acc, curr) => {
      if (curr.type === 'INFLOW') {
        acc.totalInflow += curr.amount;
        acc.balance += curr.amount;
      } else {
        acc.totalOutflow += curr.amount;
        acc.balance -= curr.amount;
      }
      return acc;
    }, { balance: 0, totalInflow: 0, totalOutflow: 0 });
  }, [transactions]);

  const addTransaction = (data) => {
    const newTx = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString()
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const deleteTransaction = (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  return {
    transactions,
    summary,
    isLoading,
    addTransaction,
    deleteTransaction
  };
}
