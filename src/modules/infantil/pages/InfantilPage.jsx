import { useState } from 'react';
import styled from 'styled-components';
import { useInfantilLive } from '../hooks/useInfantilLive.js';
import { LiveClassroomGrid } from '../components/LiveClassroomGrid.jsx';
import { theme } from '../../../styles/theme.js';
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
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  color: ${theme.colors.ice};
  letter-spacing: -0.02em;
`;

const Subtitle = styled.p`
  margin: 0;
  color: ${theme.colors.mutedDark};
  font-size: 1rem;
`;

const CheckinPanel = styled.div`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  padding: 1.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  align-items: flex-end;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
`;

const PanelTitle = styled.h2`
  width: 100%;
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  color: ${theme.colors.ice};
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
  color: ${theme.colors.muted};
  font-weight: 500;
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  background: ${theme.colors.charcoal};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  color: ${theme.colors.ice};
  font-size: 1rem;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${theme.colors.wine};
    box-shadow: 0 0 0 2px rgba(138, 31, 61, 0.2);
  }
`;

const ActionButton = styled.button`
  background: ${theme.colors.wine};
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: ${theme.radii.md};
  font-weight: 600;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  height: 46px;
  box-shadow: 0 4px 12px rgba(138, 31, 61, 0.3);
  transition: all 0.2s;

  &:hover {
    background: ${theme.colors.wineLight};
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const CodeOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
`;

const CodeCard = styled.div`
  background: ${theme.colors.surface};
  padding: 3rem;
  border-radius: ${theme.radii.lg};
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  border: 2px solid ${theme.colors.wine};
`;

const BigCode = styled.div`
  font-size: 4rem;
  font-family: monospace;
  font-weight: 800;
  letter-spacing: 0.2em;
  color: ${theme.colors.ice};
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
            <h2 style={{ margin: 0, color: theme.colors.muted }}>Ticket Gerado</h2>
            <BigCode>{generatedCode}</BigCode>
            <p style={{ color: theme.colors.mutedDark, margin: 0 }}>Entregue o adesivo aos pais.<br/>Clique em qualquer lugar para fechar.</p>
          </CodeCard>
        </CodeOverlay>
      )}
    </PageContainer>
  );
}
