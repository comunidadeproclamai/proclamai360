import styled from 'styled-components';
import { PageHeader } from './PageHeader.jsx';
import { EmptyState } from '../feedback/EmptyState.jsx';
import { theme } from '../../styles/theme.js';

export function DomainPage({ eyebrow, title, description, icon: Icon, nextSteps }) {
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} description={description} />

      <DomainGrid>
        <HeroPanel>
          <IconWrap>
            <Icon size={24} />
          </IconWrap>
          <h2>Modulo preparado</h2>
          <p>
            Esta area ja existe na navegacao, no roteamento e na estrutura do projeto para crescer
            com componentes, services e hooks proprios.
          </p>
        </HeroPanel>

        <EmptyState
          title="Fila de evolucao"
          description="A implementacao funcional deste modulo deve nascer dentro da propria pasta de dominio."
        />
      </DomainGrid>

      <Steps>
        {nextSteps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </Steps>
    </>
  );
}

const DomainGrid = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(18rem, 0.8fr);
  gap: 0.9rem;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

const HeroPanel = styled.section`
  padding: 1.25rem;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  background: ${theme.colors.surface};

  h2 {
    margin: 1rem 0 0;
    font-size: 1.15rem;
  }

  p {
    margin: 0.55rem 0 0;
    color: ${theme.colors.muted};
    line-height: 1.6;
  }
`;

const IconWrap = styled.div`
  display: grid;
  place-items: center;
  width: 3rem;
  height: 3rem;
  border-radius: ${theme.radii.md};
  background: rgba(138, 31, 61, 0.18);
  color: ${theme.colors.wineLight};
`;

const Steps = styled.ul`
  display: grid;
  gap: 0.7rem;
  margin: 1rem 0 0;
  padding: 1.15rem 1.15rem 1.15rem 2.25rem;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  background: rgba(30, 27, 27, 0.62);
  color: ${theme.colors.muted};
  line-height: 1.5;
`;
