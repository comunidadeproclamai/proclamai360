import { useState } from 'react';
import styled from 'styled-components';
import { useInfantilLive } from '../hooks/useInfantilLive.js';
import { LiveClassroomGrid } from '../components/LiveClassroomGrid.jsx';
import { QrCode, UserPlus, AlertCircle } from 'lucide-react';

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

const CheckinPanel = styled.div`
  background: ${({ theme }) => theme.colors.surface === '#ffffff' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(28, 22, 23, 0.7)'};
  backdrop-filter: blur(10px);
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 1.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  align-items: flex-end;
  box-shadow: ${({ theme }) => theme.shadow};
`;

const PanelTitle = styled.h2`
  width: 100%;
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.ice};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
  min-width: 200px;
`;

const Label = styled.label`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.muted};
  font-weight: 600;
  letter-spacing: 0.02em;
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  background: ${({ theme }) => theme.colors.surfaceSoft};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.ice};
  font-size: 0.95rem;
  outline: none;
  transition: all 0.2s;

  &:focus {
    border-color: ${({ theme }) => theme.colors.gold};
    box-shadow: 0 0 0 3px rgba(197, 165, 92, 0.12);
  }
`;

const ActionButton = styled.button`
  background: ${({ theme }) => theme.colors.wine};
  color: white;
  border: 1px solid rgba(197, 165, 92, 0.15);
  padding: 0.75rem 2rem;
  border-radius: ${({ theme }) => theme.radii.md};
  font-weight: 600;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  height: 44px;
  box-shadow: 0 4px 15px rgba(92, 6, 30, 0.25);
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.wineLight};
    box-shadow: 0 6px 20px rgba(127, 18, 44, 0.4);
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const CodeOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.8);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
`;

const CodeCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: 3rem;
  border-radius: ${({ theme }) => theme.radii.lg};
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  border: 2px solid ${({ theme }) => theme.colors.gold};
  box-shadow: ${({ theme }) => theme.shadow};
`;

const BigCode = styled.div`
  font-size: 4rem;
  font-family: monospace;
  font-weight: 800;
  letter-spacing: 0.2em;
  color: ${({ theme }) => theme.colors.ice};
  margin: 1rem 0;
`;

export function InfantilPage() {
  const { activeChildren, isLoading, addCheckin, doCheckout } = useInfantilLive();
  const [formData, setFormData] = useState({ name: '', age: '', allergies: '' });
  const [generatedCode, setGeneratedCode] = useState(null);

  const handleCheckin = () => {
    if (!formData.name || !formData.age) return;
    const code = addCheckin(formData.name, formData.age, formData.allergies);
    setGeneratedCode(code);
    setFormData({ name: '', age: '', allergies: '' });
  };

  return (
    <PageContainer>
      <Header>
        <TitleBlock>
          <Title>Ministério Infantil</Title>
          <Subtitle>Gestão e segurança em tempo real das salas.</Subtitle>
        </TitleBlock>
      </Header>

      <CheckinPanel>
        <PanelTitle><UserPlus size={18} /> Novo Check-in Rápido</PanelTitle>
        <FormGroup>
          <Label>Nome da Criança</Label>
          <Input 
            placeholder="Nome completo..." 
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
        </FormGroup>
        <FormGroup style={{ maxWidth: '120px', minWidth: '100px' }}>
          <Label>Idade</Label>
          <Input 
            type="number"
            placeholder="Anos" 
            value={formData.age}
            onChange={e => setFormData({...formData, age: e.target.value})}
          />
        </FormGroup>
        <FormGroup>
          <Label>Alergias / Observações</Label>
          <Input 
            placeholder="Nenhuma (Opcional)" 
            value={formData.allergies}
            onChange={e => setFormData({...formData, allergies: e.target.value})}
          />
        </FormGroup>
        <ActionButton onClick={handleCheckin} disabled={!formData.name || !formData.age}>
          <QrCode size={20} /> Gerar Ticket
        </ActionButton>
      </CheckinPanel>

      <div style={{ marginTop: '1rem' }}>
        <PanelTitle style={{ marginBottom: '1.5rem' }}><AlertCircle size={18} /> Crianças em Sala (Ao Vivo)</PanelTitle>
        <LiveClassroomGrid children={activeChildren} isLoading={isLoading} onCheckout={doCheckout} />
      </div>

      {generatedCode && (
        <CodeOverlay onClick={() => setGeneratedCode(null)}>
          <CodeCard onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: 0, color: '#c5a55c' }}>Ticket Gerado</h2>
            <BigCode>{generatedCode}</BigCode>
            <p style={{ color: '#8a7779', margin: 0 }}>Entregue o adesivo aos pais.<br/>Clique em qualquer lugar para fechar.</p>
          </CodeCard>
        </CodeOverlay>
      )}
    </PageContainer>
  );
}
