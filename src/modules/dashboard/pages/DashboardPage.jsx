import styled from 'styled-components';
import { UsersRound, Wallet, QrCode, Sparkles, User, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { PageHeader } from '../../../components/common/PageHeader.jsx';
import { StatCard } from '../../../components/common/StatCard.jsx';
import { useMembers } from '../../members/hooks/useMembers.js';
import { useFinanceiro } from '../../financeiro/hooks/useFinanceiro.js';
import { useInfantilLive } from '../../infantil/hooks/useInfantilLive.js';
import { formatCurrency } from '../../../utils/currency.js';

export function DashboardPage() {
  const { members, isLoading: loadingMembers } = useMembers();
  const { summary, transactions, isLoading: loadingFinance } = useFinanceiro();
  const { activeChildren } = useInfantilLive();

  // Get last 3 registered members
  const recentMembers = members.slice(0, 3);
  
  // Get last 3 financial transactions
  const recentTransactions = transactions.slice(0, 3);

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  return (
    <>
      <PageHeader
        eyebrow="Visão Geral"
        title="Dashboard"
        description="Acompanhamento operacional em tempo real da congregação. Dados integrados e atualizados instantaneamente."
      />

      <StatsGrid>
        <StatCard 
          label="Membros Ativos" 
          value={loadingMembers ? '...' : members.length.toString()} 
          detail="Total de cadastros ativos e visitantes" 
          tone="wine" 
        />
        <StatCard 
          label="Crianças em Sala" 
          value={activeChildren.length.toString()} 
          detail="Check-ins ativos no Ministério Infantil" 
        />
        <StatCard 
          label="Saldo em Caixa" 
          value={loadingFinance ? '...' : formatCurrency(summary.balance)} 
          detail="Soma de saldos em contas integradas" 
        />
        <StatCard 
          label="Lançamentos do Mês" 
          value={loadingFinance ? '...' : transactions.length.toString()} 
          detail="Entradas e saídas registradas" 
        />
      </StatsGrid>

      <Board>
        <Panel>
          <PanelTitle>
            <UsersRound size={18} />
            Últimos Membros Cadastrados
          </PanelTitle>
          {recentMembers.length > 0 ? (
            <RecentList>
              {recentMembers.map((member) => (
                <RecentItem key={member.id}>
                  <AvatarFallback><User size={16} /></AvatarFallback>
                  <RecentDetails>
                    <strong>{member.name}</strong>
                    <span>{member.congregation || 'Congregação Principal'} • {member.phone}</span>
                  </RecentDetails>
                </RecentItem>
              ))}
            </RecentList>
          ) : (
            <EmptyPanelText>Nenhum membro cadastrado recentemente.</EmptyPanelText>
          )}
        </Panel>

        <Panel>
          <PanelTitle>
            <Wallet size={18} />
            Últimas Movimentações Financeiras
          </PanelTitle>
          {recentTransactions.length > 0 ? (
            <RecentList>
              {recentTransactions.map((tx) => (
                <RecentItem key={tx.id}>
                  <IconCircle $type={tx.type}>
                    {tx.type === 'INFLOW' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                  </IconCircle>
                  <RecentDetails>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      <strong>{tx.description}</strong>
                      <AmountText $type={tx.type}>
                        {tx.type === 'INFLOW' ? '+' : '-'} {formatCurrency(tx.amount)}
                      </AmountText>
                    </div>
                    <span>{tx.category} • {formatDate(tx.date)}</span>
                  </RecentDetails>
                </RecentItem>
              ))}
            </RecentList>
          ) : (
            <EmptyPanelText>Nenhuma movimentação financeira registrada.</EmptyPanelText>
          )}
        </Panel>

        <Panel>
          <PanelTitle>
            <QrCode size={18} />
            Check-in Infantil Ativo
          </PanelTitle>
          {activeChildren.length > 0 ? (
            <RecentList>
              {activeChildren.slice(0, 3).map((child) => (
                <RecentItem key={child.id}>
                  <ClassBadge>{child.room[0]}</ClassBadge>
                  <RecentDetails>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      <strong>{child.name}</strong>
                      <CodeText>{child.securityCode}</CodeText>
                    </div>
                    <span>Classe: {child.room} • Idade: {child.age} anos</span>
                  </RecentDetails>
                </RecentItem>
              ))}
            </RecentList>
          ) : (
            <EmptyPanelText>Nenhuma criança em sala no momento.</EmptyPanelText>
          )}
        </Panel>

        <Panel>
          <PanelTitle>
            <Sparkles size={18} />
            Visão Geral de Configuração
          </PanelTitle>
          <InstructionBox>
            <h4>Identidade Visual Premium</h4>
            <p>
              Acesse as configurações no menu lateral para alternar as preferências estéticas entre o <strong>Tema Claro</strong> e <strong>Tema Escuro</strong> com base na nova logo.
            </p>
          </InstructionBox>
        </Panel>
      </Board>
    </>
  );
}

const StatsGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1.25rem;
  margin-bottom: 1.75rem;

  @media (max-width: 980px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const Board = styled.section`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.25rem;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

const Panel = styled.article`
  min-height: 12.5rem;
  padding: 1.5rem;
  border: 1px solid ${({ theme }) => theme.colors.surface === '#ffffff' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.04)'};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.surface === '#ffffff' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(28, 22, 23, 0.75)'};
  backdrop-filter: blur(10px);
  box-shadow: ${({ theme }) => theme.shadow};
  transition: all 250ms cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;

  &:hover {
    border-color: rgba(197, 165, 92, 0.25);
    box-shadow: ${({ theme }) => theme.shadow}, 0 0 15px rgba(197, 165, 92, 0.05);
    transform: translateY(-2px);
  }
`;

const PanelTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0 0 1rem 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.ice};
  letter-spacing: -0.01em;

  svg {
    color: ${({ theme }) => theme.colors.gold};
  }
`;

const RecentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  flex: 1;
`;

const RecentItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`;

const AvatarFallback = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.wineGlow};
  border: 1px solid rgba(127, 18, 44, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.gold};
`;

const IconCircle = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${({ $type }) => $type === 'INFLOW' ? 'rgba(60,168,118,0.08)' : 'rgba(223,83,83,0.08)'};
  color: ${({ $type }) => $type === 'INFLOW' ? '#2c8f61' : '#cd3d3d'};
  border: 1px solid ${({ $type }) => $type === 'INFLOW' ? 'rgba(60,168,118,0.2)' : 'rgba(223,83,83,0.2)'};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ClassBadge = styled.div`
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.surfaceSoft};
  color: ${({ theme }) => theme.colors.gold};
  border: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
`;

const RecentDetails = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;

  strong {
    font-size: 0.9rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.ice};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  span {
    font-size: 0.78rem;
    color: ${({ theme }) => theme.colors.muted};
    font-weight: 400;
    margin-top: 0.15rem;
  }
`;

const AmountText = styled.span`
  font-size: 0.9rem !important;
  font-weight: 700 !important;
  color: ${({ $type }) => $type === 'INFLOW' ? '#2c8f61' : '#cd3d3d'} !important;
  font-family: 'Outfit', sans-serif;
`;

const CodeText = styled.span`
  font-size: 0.85rem !important;
  font-weight: 700 !important;
  color: ${({ theme }) => theme.colors.gold} !important;
  font-family: monospace;
`;

const EmptyPanelText = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: ${({ theme }) => theme.colors.mutedDark};
  font-size: 0.875rem;
  font-weight: 400;
`;

const InstructionBox = styled.div`
  background: ${({ theme }) => theme.colors.surfaceSoft};
  padding: 1rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  h4 {
    margin: 0;
    font-size: 0.9rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.gold};
  }

  p {
    margin: 0 !important;
    font-size: 0.8rem !important;
    line-height: 1.5 !important;
    color: ${({ theme }) => theme.colors.muted} !important;
  }
`;
