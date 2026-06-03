import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TransactionModal } from '../TransactionModal.jsx';
import { ThemeProvider } from 'styled-components';
import { theme } from '../../../../styles/theme.js';

const mockSupportData = {
  accounts: [{ id: 'acc-1', name: 'Caixa Principal' }],
  categories: [
    { id: 'cat-in', name: 'Dízimo', type: 'INFLOW' },
    { id: 'cat-out', name: 'Conta de Luz', type: 'OUTFLOW' },
  ]
};

const renderWithTheme = (ui) => {
  return render(
    <ThemeProvider theme={theme}>
      {ui}
    </ThemeProvider>
  );
};

describe('TransactionModal Component', () => {
  it('renders correctly for a new transaction', () => {
    renderWithTheme(
      <TransactionModal 
        onClose={vi.fn()} 
        onSave={vi.fn()} 
        supportData={mockSupportData} 
      />
    );

    expect(screen.getByText('Novo Lançamento')).toBeInTheDocument();
    expect(screen.getByText('Receita')).toBeInTheDocument();
    expect(screen.getByText('Despesa')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /salvar lançamento/i })).toBeInTheDocument();
  });

  it('renders correctly for editing an existing transaction', () => {
    const editData = {
      description: 'Luz Editada',
      amount: 150.50,
      type: 'OUTFLOW',
      categoryId: 'cat-out',
      accountId: 'acc-1',
      date: '2023-10-05',
    };

    renderWithTheme(
      <TransactionModal 
        onClose={vi.fn()} 
        onSave={vi.fn()} 
        supportData={mockSupportData} 
        transactionToEdit={editData}
      />
    );

    expect(screen.getByText('Editar Lançamento')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Luz Editada')).toBeInTheDocument();
    expect(screen.getByDisplayValue('150,5')).toBeInTheDocument();
  });

  it('validates required fields before saving', async () => {
    const onSaveMock = vi.fn();
    renderWithTheme(
      <TransactionModal 
        onClose={vi.fn()} 
        onSave={onSaveMock} 
        supportData={mockSupportData} 
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /salvar lançamento/i }));

    await waitFor(() => {
      expect(screen.getByText('Descrição e valor são obrigatórios.')).toBeInTheDocument();
    });
    
    expect(onSaveMock).not.toHaveBeenCalled();
  });
});
