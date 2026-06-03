import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useFinanceiro } from '../useFinanceiro.js';
import { financeiroService } from '../../services/financeiroService.js';
import { useToast } from '../../../../contexts/ToastContext.jsx';
import { realtimeService } from '../../../../services/realtimeService.js';

// Mocks
vi.mock('../../services/financeiroService.js', () => ({
  financeiroService: {
    getSummary: vi.fn(),
    getTransactions: vi.fn(),
    getSupportData: vi.fn(),
    createTransaction: vi.fn(),
    deleteTransaction: vi.fn(),
  }
}));

vi.mock('../../../../contexts/ToastContext.jsx', () => ({
  useToast: vi.fn(() => ({
    success: vi.fn(),
    error: vi.fn(),
  }))
}));

vi.mock('../../../../services/realtimeService.js', () => ({
  realtimeService: {
    subscribeToInserts: vi.fn(() => 'channel-id'),
    unsubscribe: vi.fn(),
  }
}));

describe('useFinanceiro Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    financeiroService.getSummary.mockResolvedValue({
      balance: 1000,
      totalInflow: 1500,
      totalOutflow: 500,
      periodResult: 1000,
    });
    
    financeiroService.getTransactions.mockResolvedValue({
      data: [{ id: 'tx-1', description: 'Test', amount: 100 }],
      meta: { totalPages: 1 }
    });
    
    financeiroService.getSupportData.mockResolvedValue({
      categories: [{ id: 'cat-1', name: 'Dízimos', type: 'INFLOW' }],
      accounts: [{ id: 'acc-1', name: 'Caixa Principal' }],
    });
  });

  it.skip('should fetch dashboard data on mount', async () => {
    let hookResult;
    await act(async () => {
      hookResult = renderHook(() => useFinanceiro());
    });

    await waitFor(() => {
      expect(hookResult.result.current.isLoading).toBe(false);
    });

    expect(hookResult.result.current.summary.balance).toBe(1000);
    expect(hookResult.result.current.transactions).toHaveLength(1);
    expect(hookResult.result.current.supportData.categories).toHaveLength(1);
  });

  it('should handle addTransaction', async () => {
    financeiroService.createTransaction.mockResolvedValue({ id: 'tx-new' });
    
    let hookResult;
    await act(async () => {
      hookResult = renderHook(() => useFinanceiro());
    });
    
    await act(async () => {
      await hookResult.result.current.addTransaction({ description: 'New', amount: 50, type: 'INFLOW' });
    });

    expect(financeiroService.createTransaction).toHaveBeenCalledWith({
      description: 'New', amount: 50, type: 'INFLOW'
    });
    // fetchDashboard should be called again after adding
    expect(financeiroService.getTransactions).toHaveBeenCalledTimes(2);
  });

  it('should subscribe to realtime inserts', async () => {
    renderHook(() => useFinanceiro());
    expect(realtimeService.subscribeToInserts).toHaveBeenCalledWith('financial_transactions', expect.any(Function));
  });
});
