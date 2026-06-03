import { useState } from 'react';
import styled from 'styled-components';
import { Plus, Search, X } from 'lucide-react';
import { BalanceCards } from '../components/BalanceCards.jsx';
import { TransactionModal } from '../components/TransactionModal.jsx';
import { TransactionsTable } from '../components/TransactionsTable.jsx';
import { ImportTransactionsModal } from '../components/ImportTransactionsModal.jsx';
import { FinancialReportCharts } from '../components/FinancialReportCharts.jsx';
import { useFinanceiro } from '../hooks/useFinanceiro.js';
import { PERMISSIONS, hasPermission } from '../../../lib/permissions.js';
import { useAuth } from '../../auth/hooks/useAuth.js';
import { Pagination } from '../../../components/common/Pagination.jsx';
import { ExportButton } from '../../../components/common/ExportButton.jsx';
import { ConfirmDialog } from '../../../components/feedback/ConfirmDialog.jsx';
import { exportToExcel, exportToPDF } from '../../../services/exportService.js';
import { formatCurrency } from '../../../utils/currency.js';

export function FinanceiroPage() {
  const { user } = useAuth();
  const canManageFinance = hasPermission(user, PERMISSIONS.FINANCIAL_WRITE);
  
  const {
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
  } = useFinanceiro();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'charts'
  const [transactionToEdit, setTransactionToEdit] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const categoryOptions = filters.type
    ? supportData.categories.filter((category) => category.type === filters.type)
    : supportData.categories;

  const handleAddNew = () => {
    setTransactionToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (transaction) => {
    setTransactionToEdit(transaction);
    setIsModalOpen(true);
  };

  const handleSave = async (payload) => {
    if (transactionToEdit) {
      await updateTransaction(transactionToEdit.id, payload);
    } else {
      await addTransaction(payload);
    }
  };

  const handleDeleteTransaction = async () => {
    if (!pendingDelete) return;
    await deleteTransaction(pendingDelete.id);
    setPendingDelete(null);
  };

  const exportColumns = [
    { key: 'description', label: 'Descrição' },
    { key: 'category', label: 'Categoria' },
    { key: 'account', label: 'Conta' },
    { key: 'type', label: 'Tipo', render: (val) => val === 'INFLOW' ? 'RECEITA' : 'DESPESA' },
    { key: 'amount', label: 'Valor', render: (val) => formatCurrency(val) },
    { key: 'date', label: 'Data', render: (val) => new Date(val).toLocaleDateString('pt-BR') },
  ];

  const handleExportExcel = async () => {
    exportToExcel(transactions, exportColumns, 'Transacoes_Financeiras.xlsx');
  };

  const handleExportPDF = async () => {
    exportToPDF(transactions, exportColumns, 'Relatório Financeiro', 'Transacoes_Financeiras.pdf');
  };

  return (
    <PageContainer>
      <Header>
        <TitleBlock>
          <Title>Financeiro</Title>
          <Subtitle>Acompanhe saldos, dízimos, ofertas e despesas.</Subtitle>
        </TitleBlock>
        <HeaderActions>
          <ExportButton 
            onExportExcel={handleExportExcel} 
            onExportPDF={handleExportPDF} 
            disabled={transactions.length === 0} 
          />
          {canManageFinance && (
            <>
              <SecondaryButton type="button" onClick={() => setIsImportModalOpen(true)}>
                Importar Extrato
              </SecondaryButton>
              <PrimaryButton type="button" onClick={handleAddNew}>
                <Plus size={20} />
                Lançar Valor
              </PrimaryButton>
            </>
          )}
        </HeaderActions>
      </Header>

      <BalanceCards summary={summary} isLoading={isLoading} />

      <FiltersBar>
        <FilterField>
          <span>Busca</span>
          <FilterInputWrap>
            <Search size={16} />
            <SearchInput
              placeholder="Descricao, conta ou categoria"
              value={filters.search}
              onChange={(event) => updateFilter('search', event.target.value)}
            />
          </FilterInputWrap>
        </FilterField>

        <FilterField>
          <span>Tipo</span>
          <FilterSelect
            value={filters.type}
            onChange={(event) => {
              updateFilter('type', event.target.value);
              updateFilter('categoryId', '');
            }}
          >
            <option value="">Todos</option>
            <option value="INFLOW">Receitas</option>
            <option value="OUTFLOW">Despesas</option>
          </FilterSelect>
        </FilterField>

        <FilterField>
          <span>Conta</span>
          <FilterSelect value={filters.accountId} onChange={(event) => updateFilter('accountId', event.target.value)}>
            <option value="">Todas</option>
            {supportData.accounts.map((account) => (
              <option key={account.id} value={account.id}>{account.name}</option>
            ))}
          </FilterSelect>
        </FilterField>

        <FilterField>
          <span>Categoria</span>
          <FilterSelect value={filters.categoryId} onChange={(event) => updateFilter('categoryId', event.target.value)}>
            <option value="">Todas</option>
            {categoryOptions.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </FilterSelect>
        </FilterField>

        <FilterField>
          <span>Início</span>
          <FilterInput type="date" value={filters.startDate} onChange={(event) => updateFilter('startDate', event.target.value)} />
        </FilterField>

        <FilterField>
          <span>Fim</span>
          <FilterInput type="date" value={filters.endDate} onChange={(event) => updateFilter('endDate', event.target.value)} />
        </FilterField>

        <ResetButton type="button" onClick={resetFilters}>
          <X size={16} /> Limpar
        </ResetButton>
      </FiltersBar>

      <ViewToggle>
        <ToggleButton $active={viewMode === 'table'} onClick={() => setViewMode('table')}>
          Extrato Detalhado
        </ToggleButton>
        <ToggleButton $active={viewMode === 'charts'} onClick={() => setViewMode('charts')}>
          Relatório em Gráficos
        </ToggleButton>
      </ViewToggle>

      {viewMode === 'charts' ? (
        <FinancialReportCharts filters={filters} />
      ) : (
        <>
          <Statement>
            <StatementHeader>
              <h2>Extrato</h2>
              <span>{transactions.length} lançamentos na página</span>
            </StatementHeader>
            
            <TransactionsTable 
              transactions={transactions}
              isLoading={isLoading}
              onDelete={(id) => setPendingDelete(transactions.find(t => t.id === id))}
              onEdit={handleEdit}
              canManage={canManageFinance}
            />
          </Statement>

          {!isLoading && transactions.length > 0 && (
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          )}
        </>
      )}

      {isImportModalOpen && canManageFinance && (
        <ImportTransactionsModal
          isOpen={isImportModalOpen}
          isSubmitting={isSubmitting}
          onClose={() => setIsImportModalOpen(false)}
          supportData={supportData}
          onImport={async (payload) => {
            const success = await importTransactions(payload);
            if (success) setIsImportModalOpen(false);
          }}
        />
      )}

      {isModalOpen && canManageFinance && (
        <TransactionModal
          isSubmitting={isSubmitting}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          supportData={supportData}
          transactionToEdit={transactionToEdit}
        />
      )}

      <ConfirmDialog
        isOpen={!!pendingDelete}
        title="Excluir lançamento?"
        message={`O saldo da conta será recalculado após excluir ${pendingDelete ? formatCurrency(pendingDelete.amount) : ''}.`}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        onConfirm={handleDeleteTransaction}
        onCancel={() => setPendingDelete(null)}
      />
    </PageContainer>
  );
}

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1.5rem;

  @media (max-width: 640px) {
    align-items: flex-start;
    flex-direction: column;
  }
`;

const TitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Title = styled.h1`
  margin: 0;
  color: ${({ theme }) => theme.colors.ice};
  font-size: clamp(1.8rem, 3vw, 2.5rem);
  font-weight: 800;
  text-transform: uppercase;
`;

const Subtitle = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.muted};
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 1rem;
`;

const PrimaryButton = styled.button`
  min-height: 2.85rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0 1.25rem;
  border: 1px solid rgba(197, 165, 92, 0.15);
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.wine};
  color: white;
  font-weight: 800;
  box-shadow: 0 4px 15px rgba(92, 6, 30, 0.25);

  &:hover {
    background: ${({ theme }) => theme.colors.wineLight};
  }
`;

const SecondaryButton = styled.button`
  min-height: 2.85rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0 1.25rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.ice};
  font-weight: 600;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceSoft};
  }
`;

const ViewToggle = styled.div`
  display: flex;
  gap: 0.5rem;
  background: rgba(0, 0, 0, 0.2);
  padding: 0.4rem;
  border-radius: ${({ theme }) => theme.radii.md};
  width: fit-content;
`;

const ToggleButton = styled.button`
  padding: 0.6rem 1.25rem;
  background: ${({ $active, theme }) => $active ? theme.colors.wine : 'transparent'};
  color: ${({ $active, theme }) => $active ? 'white' : theme.colors.muted};
  border: 1px solid ${({ $active }) => $active ? 'rgba(197, 165, 92, 0.15)' : 'transparent'};
  border-radius: ${({ theme }) => theme.radii.sm};
  font-weight: 800;
  transition: all 0.2s ease;

  &:hover {
    color: ${({ $active, theme }) => !$active && theme.colors.ice};
  }
`;

const FiltersBar = styled.div`
  display: grid;
  grid-template-columns: minmax(180px, 1.2fr) repeat(5, minmax(130px, 1fr)) auto;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.surface === '#ffffff' ? 'rgba(255, 255, 255, 0.82)' : 'rgba(28, 22, 23, 0.72)'};
  box-shadow: ${({ theme }) => theme.shadow};

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 620px) {
    grid-template-columns: 1fr;
  }
`;

const FilterField = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;

  span {
    color: ${({ theme }) => theme.colors.muted};
    font-size: 0.75rem;
    font-weight: 800;
    text-transform: uppercase;
  }
`;

const FilterInputWrap = styled.div`
  position: relative;

  svg {
    position: absolute;
    left: 0.8rem;
    top: 50%;
    transform: translateY(-50%);
    color: ${({ theme }) => theme.colors.muted};
  }
`;

const FilterInput = styled.input`
  width: 100%;
  min-height: 2.65rem;
  padding: 0 0.85rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.surfaceSoft};
  color: ${({ theme }) => theme.colors.ice};
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.gold};
    box-shadow: 0 0 0 3px rgba(197, 165, 92, 0.12);
  }
`;

const SearchInput = styled(FilterInput)`
  padding-left: 2.35rem;
`;

const FilterSelect = styled.select`
  width: 100%;
  min-height: 2.65rem;
  padding: 0 0.85rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.surfaceSoft};
  color: ${({ theme }) => theme.colors.ice};
  outline: none;

  option {
    background: ${({ theme }) => theme.colors.charcoal};
    color: ${({ theme }) => theme.colors.ice};
  }
`;

const ResetButton = styled.button`
  align-self: end;
  min-height: 2.65rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0 0.85rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: transparent;
  color: ${({ theme }) => theme.colors.muted};
  font-weight: 800;
`;

const Statement = styled.section`
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.surface === '#ffffff' ? 'rgba(255, 255, 255, 0.82)' : 'rgba(28, 22, 23, 0.72)'};
  box-shadow: ${({ theme }) => theme.shadow};
`;

const StatementHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceSoft};

  h2 {
    margin: 0;
    color: ${({ theme }) => theme.colors.gold};
    font-size: 1rem;
    font-weight: 800;
    text-transform: uppercase;
  }

  span {
    color: ${({ theme }) => theme.colors.muted};
    font-size: 0.85rem;
    font-weight: 800;
  }
`;
