import styled from 'styled-components';
import { KidAvatar } from './KidAvatar.jsx';
import { LogOut, Clock } from 'lucide-react';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface === '#ffffff' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(28, 22, 23, 0.7)'};
  backdrop-filter: blur(10px);
  border: 1px solid ${({ $isAllergic, theme }) => $isAllergic ? 'rgba(223, 83, 83, 0.4)' : theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  box-shadow: ${({ theme }) => theme.shadow};
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    transform: translateY(-4px);
    border-color: ${({ theme }) => theme.colors.gold};
    box-shadow: ${({ theme }) => theme.shadow}, 0 0 15px rgba(197, 165, 92, 0.05);
  }
`;

const Header = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const InfoBlock = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const Name = styled.h3`
  margin: 0;
  font-size: 1.05rem;
  color: ${({ theme }) => theme.colors.ice};
  font-weight: 700;
`;

const Subtitle = styled.span`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.muted};
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-weight: 400;
`;

const CodeBadge = styled.div`
  padding: 0.5rem 1rem;
  background: ${({ theme }) => theme.colors.surfaceSoft};
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  font-family: monospace;
  font-size: 1.25rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.gold};
  text-align: center;
  letter-spacing: 2px;
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding-top: 1rem;
`;

const CheckoutButton = styled.button`
  background: transparent;
  color: ${({ theme }) => theme.colors.muted};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 0.5rem 1rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 0.85rem;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceSoft};
    color: ${({ theme }) => theme.colors.ice};
    border-color: ${({ theme }) => theme.colors.gold};
  }
`;

const EmptyState = styled.div`
  padding: 4rem;
  text-align: center;
  color: ${({ theme }) => theme.colors.muted};
  background: ${({ theme }) => theme.colors.surface === '#ffffff' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(28, 22, 23, 0.7)'};
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  font-size: 0.95rem;
  font-weight: 400;
`;

export function LiveClassroomGrid({ children, isLoading, onCheckout, canManage = false }) {
  if (isLoading) return <EmptyState>Carregando salas...</EmptyState>;
  if (!children || children.length === 0) return <EmptyState>Nenhuma criança em sala no momento.</EmptyState>;

  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Grid>
      {children.map(child => (
        <Card key={child.id} $isAllergic={!!child.allergies}>
          <Header>
            <KidAvatar name={child.name} hasAllergies={!!child.allergies} size="56px" />
            <InfoBlock>
              <Name>{child.name}</Name>
              <Subtitle>
                {child.age} anos • {child.room}
              </Subtitle>
              {child.guardianName && <Subtitle>Resp: {child.guardianName}</Subtitle>}
              {child.allergies && <Subtitle style={{ color: '#cd3d3d', fontWeight: 600 }}>Alergia: {child.allergies}</Subtitle>}
              {child.specialNeeds && <Subtitle>Obs: {child.specialNeeds}</Subtitle>}
            </InfoBlock>
          </Header>
          
          <CodeBadge>{child.securityCode}</CodeBadge>

          <Actions>
            <Subtitle style={{ marginRight: 'auto' }}><Clock size={14}/> Entrou às {formatTime(child.checkinTime)}</Subtitle>
            {canManage && (
              <CheckoutButton onClick={() => onCheckout(child.id)}>
                <LogOut size={16} /> Check-out
              </CheckoutButton>
            )}
          </Actions>
        </Card>
      ))}
    </Grid>
  );
}
