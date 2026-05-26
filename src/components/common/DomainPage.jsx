import styled from 'styled-components';
import { PageHeader } from './PageHeader.jsx';
import { EmptyState } from '../feedback/EmptyState.jsx';

export function DomainPage({ eyebrow, title, description, icon: Icon, nextSteps }) {
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} description={description} />

      <DomainGrid>
        <HeroPanel>
          <IconWrap>
            <Icon size={24} />
          </IconWrap>
          <h2>Módulo Preparado</h2>
          <p>
            Esta área já está mapeada na navegação, rotas e estruturas do projeto para crescer com componentes, serviços e lógicas de negócio específicas.
          </p>
        </HeroPanel>

        <EmptyState
          title="Fila de Evolução"
          description="A implementação funcional deste módulo nascerá dentro de sua respectiva pasta de domínio."
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
  gap: 1.25rem;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

const HeroPanel = styled.section`
  padding: 1.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.surface === '#ffffff' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(28, 22, 23, 0.7)'};
  backdrop-filter: blur(10px);
  box-shadow: ${({ theme }) => theme.shadow};

  h2 {
    margin: 1.25rem 0 0;
    font-size: 1.15rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.ice};
  }

  p {
    margin: 0.55rem 0 0;
    color: ${({ theme }) => theme.colors.muted};
    line-height: 1.6;
    font-size: 0.95rem;
    font-weight: 400;
  }
`;

const IconWrap = styled.div`
  display: grid;
  place-items: center;
  width: 3.25rem;
  height: 3.25rem;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.wineGlow};
  border: 1px solid rgba(127, 18, 44, 0.2);
  color: ${({ theme }) => theme.colors.gold};
`;

const Steps = styled.ul`
  display: grid;
  gap: 0.75rem;
  margin: 1.5rem 0 0;
  padding: 1.5rem 1.5rem 1.5rem 2.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.surfaceSoft};
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.95rem;
  line-height: 1.6;

  li {
    list-style: square;
    color: ${({ theme }) => theme.colors.ice};
    
    &::marker {
      color: ${({ theme }) => theme.colors.gold};
    }
  }
`;
