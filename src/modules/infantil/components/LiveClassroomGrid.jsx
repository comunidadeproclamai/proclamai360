import styled from 'styled-components';
import { theme } from '../../../styles/theme.js';
import { KidAvatar } from './KidAvatar.jsx';
import { LogOut, Clock } from 'lucide-react';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const Card = styled.div`
  background: ${theme.colors.surface};
  border: 1px solid ${({ $isAllergic }) => $isAllergic ? 'rgba(225, 93, 93, 0.4)' : theme.colors.border};
  border-radius: ${theme.radii.lg};
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
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
  font-size: 1.1rem;
  color: ${theme.colors.ice};
  font-weight: 600;
`;

const Subtitle = styled.span`
  font-size: 0.85rem;
  color: ${theme.colors.mutedDark};
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const CodeBadge = styled.div`
  padding: 0.5rem 1rem;
  background: ${theme.colors.charcoal};
  border: 1px dashed ${theme.colors.border};
  border-radius: ${theme.radii.md};
  font-family: monospace;
  font-size: 1.2rem;
  font-weight: 700;
  color: ${theme.colors.wineLight};
  text-align: center;
  letter-spacing: 2px;
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid ${theme.colors.border};
  padding-top: 1rem;
`;

const CheckoutButton = styled.button`
  background: transparent;
  color: ${theme.colors.muted};
  border: 1px solid ${theme.colors.border};
  padding: 0.5rem 1rem;
  border-radius: ${theme.radii.sm};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.2s;

  &:hover {
    background: ${theme.colors.surfaceSoft};
    color: ${theme.colors.ice};
    border-color: ${theme.colors.mutedDark};
  }
`;

const EmptyState = styled.div`
  padding: 4rem;
  text-align: center;
  color: ${theme.colors.mutedDark};
  background: ${theme.colors.surface};
  border: 1px dashed ${theme.colors.border};
  border-radius: ${theme.radii.lg};
`;

export function LiveClassroomGrid({ children, isLoading, onCheckout }) {
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
              {child.allergies && <Subtitle style={{ color: theme.colors.danger, fontWeight: 500 }}>Alergia: {child.allergies}</Subtitle>}
            </InfoBlock>
          </Header>
          
          <CodeBadge>{child.securityCode}</CodeBadge>

          <Actions>
            <Subtitle style={{ marginRight: 'auto' }}><Clock size={14}/> Entrou às {formatTime(child.checkinTime)}</Subtitle>
            <CheckoutButton onClick={() => onCheckout(child.id)}>
              <LogOut size={16} /> Check-out
            </CheckoutButton>
          </Actions>
        </Card>
      ))}
    </Grid>
  );
}
