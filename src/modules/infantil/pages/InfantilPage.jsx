import { useState } from 'react';
import styled from 'styled-components';
import { AlertCircle } from 'lucide-react';
import { PERMISSIONS, hasPermission } from '../../../lib/permissions.js';
import { useAuth } from '../../auth/hooks/useAuth.js';
import { CheckinHistoryCard } from '../components/CheckinHistoryCard.jsx';
import { ChildrenRegistryCard } from '../components/ChildrenRegistryCard.jsx';
import {
  ContentGrid,
  Header,
  PageContainer,
  PanelTitle,
  Subtitle,
  Title,
  TitleBlock,
} from '../components/InfantilLayout.js';
import { LiveClassroomGrid } from '../components/LiveClassroomGrid.jsx';
import { QuickCheckinCard } from '../components/QuickCheckinCard.jsx';
import { useInfantilAdmin } from '../hooks/useInfantilAdmin.js';

export function InfantilPage() {
  const { user } = useAuth();
  const canManageChildren = hasPermission(user, PERMISSIONS.CHILDREN_WRITE);
  const {
    activeChildren,
    children,
    history,
    isLoading,
    isSubmitting,
    createQuickCheckin,
    createChild,
    checkoutChild,
  } = useInfantilAdmin();
  const [generatedCode, setGeneratedCode] = useState(null);

  const handleQuickCheckin = async (payload) => {
    try {
      const code = await createQuickCheckin(payload);
      setGeneratedCode(code);
    } catch (error) {
      alert(error.response?.data?.message || 'Nao foi possivel realizar o check-in.');
    }
  };

  const handleCreateChild = async (payload) => {
    try {
      await createChild(payload);
    } catch (error) {
      alert(error.response?.data?.message || 'Nao foi possivel cadastrar a crianca.');
    }
  };

  const handleCheckout = async (id) => {
    try {
      await checkoutChild(id);
    } catch (error) {
      alert(error.response?.data?.message || 'Nao foi possivel realizar o check-out.');
    }
  };

  return (
    <PageContainer>
      <Header>
        <TitleBlock>
          <Title>Ministério Infantil</Title>
          <Subtitle>Gestão, segurança e histórico real das salas.</Subtitle>
        </TitleBlock>
      </Header>

      {canManageChildren && (
        <QuickCheckinCard
          isSubmitting={isSubmitting}
          onSubmit={handleQuickCheckin}
        />
      )}

      <section>
        <PanelTitle><AlertCircle size={18} /> Crianças em sala ao vivo</PanelTitle>
        <LiveClassroomGrid
          children={activeChildren}
          isLoading={isLoading}
          onCheckout={handleCheckout}
          canManage={canManageChildren}
        />
      </section>

      {canManageChildren && (
        <ContentGrid>
          <ChildrenRegistryCard
            childrenRecords={children}
            isSubmitting={isSubmitting}
            onCreateChild={handleCreateChild}
          />
          <CheckinHistoryCard records={history} />
        </ContentGrid>
      )}

      {generatedCode && (
        <CodeOverlay onClick={() => setGeneratedCode(null)}>
          <CodeCard onClick={(event) => event.stopPropagation()}>
            <h2>Ticket gerado</h2>
            <BigCode>{generatedCode}</BigCode>
            <p>Entregue o codigo ao responsavel. Clique fora para fechar.</p>
          </CodeCard>
        </CodeOverlay>
      )}
    </PageContainer>
  );
}

const CodeOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.78);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 2000;
`;

const CodeCard = styled.div`
  width: min(420px, 100%);
  background: ${({ theme }) => theme.colors.surface};
  padding: 2rem;
  border-radius: ${({ theme }) => theme.radii.lg};
  text-align: center;
  border: 2px solid ${({ theme }) => theme.colors.gold};
  box-shadow: ${({ theme }) => theme.shadow};

  h2 {
    margin: 0;
    color: ${({ theme }) => theme.colors.gold};
  }

  p {
    color: ${({ theme }) => theme.colors.muted};
    line-height: 1.5;
    margin: 0;
  }
`;

const BigCode = styled.div`
  margin: 1.5rem 0;
  color: ${({ theme }) => theme.colors.ice};
  font-family: monospace;
  font-size: clamp(2.5rem, 12vw, 4rem);
  font-weight: 800;
  letter-spacing: 0.18em;
`;
