import { useState } from 'react';
import styled from 'styled-components';
import { useFinanceiro } from '../hooks/useFinanceiro.js';
import { BalanceCards } from '../components/BalanceCards.jsx';
import { TransactionModal } from '../components/TransactionModal.jsx';
import { formatCurrency } from '../../../utils/currency.js';
import { theme } from '../../../styles/theme.js';
import { Plus, ArrowDownLeft, ArrowUpRight, Trash2 } from 'lucide-react';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
`;

const TitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  color: ${theme.colors.ice};
  letter-spacing: -0.02em;
`;

const Subtitle = styled.p`
  margin: 0;
  color: ${theme.colors.mutedDark};
  font-size: 1rem;
`;

const PrimaryButton = styled.button`
  background: ${theme.colors.wine};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: ${theme.radii.md};
  font-weight: 600;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(138, 31, 61, 0.3);
  transition: all 0.2s;

  &:hover {
    background: ${theme.colors.wineLight};
    transform: translateY(-2px);
  }
`;

const ExtratoContainer = styled.div`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  overflow: hidden;
`;

const ExtratoHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid ${theme.colors.border};
  h2 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: ${theme.colors.ice};
  }
`;

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const ListItem = styled.li`
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid ${theme.colors.border};
  
  &:last-child {
    border-bottom: none;
  }
`;

const InfoBlock = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const IconCircle = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ $type }) => $type === 'INFLOW' ? 'rgba(70,178,128,0.1)' : 'rgba(225,93,93,0.1)'};
  color: ${({ $type }) => $type === 'INFLOW' ? theme.colors.success : theme.colors.danger};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Details = styled.div`
  display: flex;
  flex-direction: column;
`;

const Desc = styled.span`
  font-weight: 500;
  color: ${theme.colors.ice};
`;

const CategoryDate = styled.span`
  font-size: 0.8rem;
  color: ${theme.colors.mutedDark};
`;

const ValueBlock = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const Amount = styled.span`
  font-weight: 600;
  font-size: 1.1rem;
  color: ${({ $type }) => $type === 'INFLOW' ? theme.colors.success : theme.colors.ice};
`;

const DeleteBtn = styled.button`
  background: transparent;
  border: none;
  color: ${theme.colors.mutedDark};
  cursor: pointer;
  padding: 0.5rem;
  border-radius: ${theme.radii.sm};
  
  &:hover {
    color: ${theme.colors.danger};
    background: rgba(225,93,93,0.1);
  }
`;

export function FinanceiroPage() {
  const { transactions, summary, isLoading, addTransaction, deleteTransaction } = useFinanceiro();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  return (
    <PageContainer>
      <Header>
        <TitleBlock>
          <Title>Financeiro</Title>
          <Subtitle>Acompanhe saldos, dízimos, ofertas e despesas.</Subtitle>
        </TitleBlock>
        <PrimaryButton onClick={() => setIsModalOpen(true)}>
          <Plus size={20} />
          Lançar Valor
        </PrimaryButton>
      </Header>

      <BalanceCards summary={summary} isLoading={isLoading} />

      <ExtratoContainer>
        <ExtratoHeader>
          <h2>Extrato Recente</h2>
        </ExtratoHeader>
        {isLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: theme.colors.muted }}>Carregando...</div>
        ) : (
          <List>
            {transactions.map(t => (
              <ListItem key={t.id}>
                <InfoBlock>
                  <IconCircle $type={t.type}>
                    {t.type === 'INFLOW' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                  </IconCircle>
                  <Details>
                    <Desc>{t.description}</Desc>
                    <CategoryDate>{t.category} • {formatDate(t.date)}</CategoryDate>
                  </Details>
                </InfoBlock>
                <ValueBlock>
                  <Amount $type={t.type}>
                    {t.type === 'INFLOW' ? '+' : '-'} {formatCurrency(t.amount)}
                  </Amount>
                  <DeleteBtn onClick={() => deleteTransaction(t.id)}>
                    <Trash2 size={16} />
                  </DeleteBtn>
                </ValueBlock>
              </ListItem>
            ))}
            {transactions.length === 0 && (
              <div style={{ padding: '3rem', textAlign: 'center', color: theme.colors.muted }}>
                Nenhuma movimentação registrada.
              </div>
            )}
          </List>
        )}
      </ExtratoContainer>

      {isModalOpen && (
        <TransactionModal 
          onClose={() => setIsModalOpen(false)}
          onSave={addTransaction}
        />
      )}
    </PageContainer>
  );
}
