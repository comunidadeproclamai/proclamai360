import { useState } from 'react';
import styled from 'styled-components';
import { ArrowDownLeft, ArrowUpRight, Plus, Search, Trash2, X } from 'lucide-react';
import { BalanceCards } from '../components/BalanceCards.jsx';
import { TransactionModal } from '../components/TransactionModal.jsx';
import { useFinanceiro } from '../hooks/useFinanceiro.js';
import { formatCurrency } from '../../../utils/currency.js';
import { PERMISSIONS, hasPermission } from '../../../lib/permissions.js';
import { useAuth } from '../../auth/hooks/useAuth.js';

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
    addTransaction,
    deleteTransaction,
    updateFilter,
    resetFilters,
  } = useFinanceiro();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [notice, setNotice] = useState(null);

  const categoryOptions = filters.type
    ? supportData.categories.filter((category) => category.type === filters.type)
    : supportData.categories;

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const handleAddTransaction = async (payload) => {
    await addTransaction(payload);
    setNotice({ type: 'success', message: 'Lancamento salvo com sucesso.' });
  };

  const handleDeleteTransaction = async () => {
    if (!pendingDelete) return;

    try {
      await deleteTransaction(pendingDelete.id);
      setPendingDelete(null);
      setNotice({ type: 'success', message: 'Lancamento removido e saldo recalculado.' });
    } catch (error) {
      setNotice({ type: 'error', message: error.response?.data?.message || 'Nao foi possivel excluir o lancamento.' });
    }
  };

  return (
    <PageContainer>
      <Header>
        <TitleBlock>
          <Title>Financeiro</Title>
          <Subtitle>Acompanhe saldos, dízimos, ofertas e despesas.</Subtitle>
        </TitleBlock>
        {canManageFinance && (
          <PrimaryButton type="button" onClick={() => setIsModalOpen(true)}>
            <Plus size={20} />
            Lançar Valor
          </PrimaryButton>
        )}
      </Header>

      <BalanceCards summary={summary} isLoading={isLoading} />

      {notice && (
        <Notice $type={notice.type} onClick={() => setNotice(null)}>
          {notice.message}
        </Notice>
      )}

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

      <Statement>
        <StatementHeader>
          <h2>Extrato</h2>
          <span>{transactions.length} lançamentos</span>
        </StatementHeader>

        {isLoading ? (
          <EmptyText>Carregando...</EmptyText>
        ) : (
          <List>
            {transactions.map((transaction) => (
              <ListItem key={transaction.id}>
                <InfoBlock>
                  <IconCircle $type={transaction.type}>
                    {transaction.type === 'INFLOW' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                  </IconCircle>
                  <Details>
                    <Description>{transaction.description}</Description>
                    <Meta>{transaction.category} • {transaction.account} • {formatDate(transaction.date)}</Meta>
                  </Details>
                </InfoBlock>
                <ValueBlock>
                  <Amount $type={transaction.type}>
                    {transaction.type === 'INFLOW' ? '+' : '-'} {formatCurrency(transaction.amount)}
                  </Amount>
                  {canManageFinance && (
                    <DeleteButton type="button" onClick={() => setPendingDelete(transaction)}>
                      <Trash2 size={16} />
                    </DeleteButton>
                  )}
                </ValueBlock>
              </ListItem>
            ))}
            {transactions.length === 0 && <EmptyText>Nenhuma movimentação encontrada.</EmptyText>}
          </List>
        )}
      </Statement>

      {isModalOpen && canManageFinance && (
        <TransactionModal
          isSubmitting={isSubmitting}
          onClose={() => setIsModalOpen(false)}
          onSave={handleAddTransaction}
          supportData={supportData}
        />
      )}

      {pendingDelete && (
        <ConfirmOverlay>
          <ConfirmBox>
            <h2>Excluir lançamento?</h2>
            <p>O saldo da conta será recalculado após excluir {formatCurrency(pendingDelete.amount)}.</p>
            <ConfirmActions>
              <SecondaryButton type="button" onClick={() => setPendingDelete(null)} disabled={isSubmitting}>
                Cancelar
              </SecondaryButton>
              <DangerButton type="button" onClick={handleDeleteTransaction} disabled={isSubmitting}>
                {isSubmitting ? 'Excluindo...' : 'Excluir'}
              </DangerButton>
            </ConfirmActions>
          </ConfirmBox>
        </ConfirmOverlay>
      )}
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

const Notice = styled.div`
  padding: 0.85rem 1rem;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ $type, theme }) => ($type === 'success' ? 'rgba(60,168,118,0.36)' : 'rgba(223,83,83,0.36)')};
  background: ${({ $type }) => ($type === 'success' ? 'rgba(60,168,118,0.1)' : 'rgba(223,83,83,0.1)')};
  color: ${({ $type, theme }) => ($type === 'success' ? theme.colors.success : theme.colors.danger)};
  font-weight: 800;
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

const List = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`;

const ListItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.1rem 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: 0;
  }
`;

const InfoBlock = styled.div`
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 1rem;
`;

const IconCircle = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border-radius: 50%;
  background: ${({ $type }) => ($type === 'INFLOW' ? 'rgba(60,168,118,0.08)' : 'rgba(223,83,83,0.08)')};
  color: ${({ $type, theme }) => ($type === 'INFLOW' ? theme.colors.success : theme.colors.danger)};
`;

const Details = styled.div`
  min-width: 0;
`;

const Description = styled.strong`
  display: block;
  color: ${({ theme }) => theme.colors.ice};
`;

const Meta = styled.span`
  display: block;
  margin-top: 0.2rem;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.82rem;
`;

const ValueBlock = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 0 0 auto;
`;

const Amount = styled.span`
  color: ${({ $type, theme }) => ($type === 'INFLOW' ? theme.colors.success : theme.colors.ice)};
  font-size: 1.05rem;
  font-weight: 800;
`;

const DeleteButton = styled.button`
  display: grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  border: 1px solid transparent;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: transparent;
  color: ${({ theme }) => theme.colors.muted};

  &:hover {
    color: ${({ theme }) => theme.colors.danger};
    border-color: rgba(223, 83, 83, 0.2);
    background: rgba(223, 83, 83, 0.08);
  }
`;

const EmptyText = styled.div`
  padding: 2.5rem;
  text-align: center;
  color: ${({ theme }) => theme.colors.muted};
`;

const ConfirmOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.68);
`;

const ConfirmBox = styled.div`
  width: min(440px, 100%);
  padding: 1.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: ${({ theme }) => theme.shadow};

  h2 {
    margin: 0;
    color: ${({ theme }) => theme.colors.ice};
    font-size: 1.15rem;
  }

  p {
    color: ${({ theme }) => theme.colors.muted};
    line-height: 1.55;
  }
`;

const ConfirmActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
`;

const SecondaryButton = styled.button`
  min-height: 2.65rem;
  padding: 0 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: transparent;
  color: ${({ theme }) => theme.colors.ice};
  font-weight: 800;
`;

const DangerButton = styled.button`
  min-height: 2.65rem;
  padding: 0 1rem;
  border: 1px solid rgba(223, 83, 83, 0.35);
  border-radius: ${({ theme }) => theme.radii.md};
  background: rgba(223, 83, 83, 0.12);
  color: ${({ theme }) => theme.colors.danger};
  font-weight: 800;
`;
