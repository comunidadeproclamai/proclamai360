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
  gap: 0.9rem;
  margin-bottom: 1rem;

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
  gap: 0.9rem;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

const Panel = styled.article`
  min-height: 11rem;
  padding: 1.05rem;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  background: ${theme.colors.surface};

  p {
    margin: 0.7rem 0 0;
    color: ${theme.colors.muted};
    line-height: 1.6;
  }
`;

const PanelTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  font-size: 1rem;

  svg {
    color: ${theme.colors.wineLight};
  }
`;

const List = styled.ul`
  display: grid;
  gap: 0.6rem;
  margin: 0.8rem 0 0;
  padding-left: 1.1rem;
  color: ${theme.colors.muted};
  line-height: 1.5;
`;
