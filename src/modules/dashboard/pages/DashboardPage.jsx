import styled from 'styled-components';
import { CalendarDays, MessageSquareText, UsersRound, WalletCards } from 'lucide-react';
import { PageHeader } from '../../../components/common/PageHeader.jsx';
import { StatCard } from '../../../components/common/StatCard.jsx';
import { theme } from '../../../styles/theme.js';

const activityItems = [
  'Organizar o fluxo inicial de cadastro de membros.',
  'Conectar os indicadores aos dados reais do Supabase.',
  'Definir as primeiras permissoes simples por perfil.',
];

export function DashboardPage() {
  return (
    <>
      <PageHeader
        eyebrow="Visao geral"
        title="Dashboard"
        description="Um ponto de partida enxuto para acompanhar a rotina da igreja sem transformar o sistema em um ERP pesado."
      />

      <StatsGrid>
        <StatCard label="Membros" value="0" detail="Modulo pronto para receber CRUD." tone="wine" />
        <StatCard label="Infantil" value="0" detail="Base preparada para check-in futuro." />
        <StatCard label="Financeiro" value="0" detail="Estrutura reservada para entradas e saidas." />
        <StatCard label="Louvor" value="0" detail="Espaco inicial para escalas futuras." />
      </StatsGrid>

      <Board>
        <Panel>
          <PanelTitle>
            <CalendarDays size={18} />
            Proximas etapas
          </PanelTitle>
          <List>
            {activityItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </List>
        </Panel>

        <Panel>
          <PanelTitle>
            <MessageSquareText size={18} />
            Comunicacao
          </PanelTitle>
          <p>
            A fundacao ja isola dominio, API e autenticação para permitir chat, notificacoes e
            rotinas internas em etapas futuras.
          </p>
        </Panel>

        <Panel>
          <PanelTitle>
            <UsersRound size={18} />
            Pessoas
          </PanelTitle>
          <p>O primeiro dominio operacional deve nascer em `src/modules/members`.</p>
        </Panel>

        <Panel>
          <PanelTitle>
            <WalletCards size={18} />
            Gestao
          </PanelTitle>
          <p>Indicadores financeiros e ministeriais ficam desacoplados dos componentes globais.</p>
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
  min-height: 11rem;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: ${theme.radii.md};
  background: rgba(28, 22, 23, 0.75);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  transition: all 250ms cubic-bezier(0.16, 1, 0.3, 1);

  p {
    margin: 0.85rem 0 0;
    color: ${theme.colors.muted};
    font-size: 0.95rem;
    line-height: 1.65;
  }

  &:hover {
    border-color: rgba(197, 165, 92, 0.25);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25), 0 0 15px rgba(197, 165, 92, 0.05);
    transform: translateY(-2px);
  }
`;

const PanelTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: ${theme.colors.ice};
  letter-spacing: -0.01em;

  svg {
    color: ${theme.colors.gold};
  }
`;

const List = styled.ul`
  display: grid;
  gap: 0.75rem;
  margin: 1rem 0 0;
  padding-left: 1.25rem;
  color: ${theme.colors.muted};
  font-size: 0.95rem;
  line-height: 1.6;

  li {
    position: relative;
    list-style: none;
    padding-left: 0.25rem;

    &::before {
      content: '•';
      position: absolute;
      left: -0.85rem;
      color: ${theme.colors.gold};
      font-weight: bold;
    }
  }
`;
