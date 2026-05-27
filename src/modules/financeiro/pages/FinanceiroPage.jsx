import { useState } from 'react';
import styled from 'styled-components';
import { useFinanceiro } from '../hooks/useFinanceiro.js';
import { BalanceCards } from '../components/BalanceCards.jsx';
import { TransactionModal } from '../components/TransactionModal.jsx';
import { formatCurrency } from '../../../utils/currency.js';
import { Plus, ArrowDownLeft, ArrowUpRight, Trash2 } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth.js';
import { PERMISSIONS, hasPermission } from '../../../lib/permissions.js';

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
    flex-direction: column;
    align-items: flex-start;
  }
`;

const TitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Title = styled.h1`
  font-size: clamp(1.8rem, 3vw, 2.5rem);
  font-weight: 800;
  margin: 0;
  color: ${({ theme }) => theme.colors.ice};
  letter-spacing: -0.01em;
  text-transform: uppercase;
`;

const Subtitle = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 1rem;
  font-weight: 400;
`;

const PrimaryButton = styled.button`
  background: ${({ theme }) => theme.colors.wine};
  color: white;
  border: 1px solid rgba(197, 165, 92, 0.15);
  padding: 0.75rem 1.5rem;
  border-radius: ${({ theme }) => theme.radii.md};
  font-weight: 600;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 15px rgba(92, 6, 30, 0.25);
  transition: all 250ms cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    background: ${({ theme }) => theme.colors.wineLight};
    box-shadow: 0 6px 20px rgba(127, 18, 44, 0.4);
    border-color: rgba(197, 165, 92, 0.3);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ExtratoContainer = styled.div`
  background: ${({ theme }) => theme.colors.surface === '#ffffff' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(28, 22, 23, 0.7)'};
  backdrop-filter: blur(10px);
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadow};
`;

const ExtratoHeader = styled.div`
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceSoft};
  
  h2 {
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: ${({ theme }) => theme.colors.gold};
  }
`;

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const ListItem = styled.li`
  padding: 1.15rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  transition: background-color 0.2s ease;
  
  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: rgba(255, 255, 255, 0.03);
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
  background: ${({ $type }) => $type === 'INFLOW' ? 'rgba(60,168,118,0.08)' : 'rgba(223,83,83,0.08)'};
  color: ${({ $type, theme }) => $type === 'INFLOW' ? theme.colors.success : theme.colors.danger};
  border: 1px solid ${({ $type, theme }) => $type === 'INFLOW' ? 'rgba(60,168,118,0.2)' : 'rgba(223,83,83,0.2)'};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0,0,0,0.06);
`;

const Details = styled.div`
  display: flex;
  flex-direction: column;
`;

const Desc = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.ice};
  font-size: 0.95rem;
`;

const CategoryDate = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.muted};
  font-weight: 400;
  margin-top: 0.15rem;
`;

const ValueBlock = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const Amount = styled.span`
  font-weight: 700;
  font-size: 1.1rem;
  color: ${({ $type, theme }) => $type === 'INFLOW' ? theme.colors.success : theme.colors.ice};
`;

const DeleteBtn = styled.button`
  background: transparent;
  border: 1px solid transparent;
  color: ${({ theme }) => theme.colors.muted};
  cursor: pointer;
  padding: 0.5rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: ${({ theme }) => theme.colors.danger};
    background: rgba(223, 83, 83, 0.08);
    border-color: rgba(223, 83, 83, 0.2);
    transform: scale(1.05);
  }
`;

export function FinanceiroPage() {
  const { user } = useAuth();
  const canManageFinance = hasPermission(user, PERMISSIONS.FINANCIAL_WRITE);
  const { transactions, summary, supportData, isLoading, addTransaction, deleteTransaction } = useFinanceiro();
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
        {canManageFinance && (
        <PrimaryButton onClick={() => setIsModalOpen(true)}>
          <Plus size={20} />
          Lançar Valor
        </PrimaryButton>
        )}
      </Header>

      <BalanceCards summary={summary} isLoading={isLoading} />

      <ExtratoContainer>
        <ExtratoHeader>
          <h2>Extrato Recente</h2>
        </ExtratoHeader>
        {isLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#bdaeae' }}>Carregando...</div>
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
                  {canManageFinance && (
                  <DeleteBtn onClick={() => deleteTransaction(t.id)}>
                    <Trash2 size={16} />
                  </DeleteBtn>
                  )}
                </ValueBlock>
              </ListItem>
            ))}
            {transactions.length === 0 && (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#bdaeae' }}>
                Nenhuma movimentação registrada.
              </div>
            )}
          </List>
        )}
      </ExtratoContainer>

      {isModalOpen && canManageFinance && (
        <TransactionModal 
          onClose={() => setIsModalOpen(false)}
          onSave={addTransaction}
          supportData={supportData}
        />
      )}
    </PageContainer>
  );
}
