import { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '../../../styles/theme.js';
import { X } from 'lucide-react';

const fadeIn = keyframes`
  from { opacity: 0; backdrop-filter: blur(0px); }
  to { opacity: 1; backdrop-filter: blur(8px); }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(30px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${fadeIn} 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: ${theme.colors.surface};
  width: 100%;
  max-width: 500px;
  border-radius: ${theme.radii.lg};
  box-shadow: 0 24px 80px rgba(0,0,0,0.4);
  border: 1px solid ${theme.colors.border};
  animation: ${slideUp} 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Header = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid ${theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  color: ${theme.colors.ice};
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: ${theme.colors.muted};
  border-radius: 50%;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    background: ${theme.colors.surfaceSoft};
    color: ${theme.colors.ice};
  }
`;

const Body = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  color: ${theme.colors.muted};
  font-weight: 500;
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  background: ${theme.colors.charcoal};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  color: ${theme.colors.ice};
  font-size: 0.95rem;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${theme.colors.wine};
    box-shadow: 0 0 0 2px rgba(138, 31, 61, 0.2);
  }
`;

const Select = styled.select`
  padding: 0.75rem 1rem;
  background: ${theme.colors.charcoal};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  color: ${theme.colors.ice};
  font-size: 0.95rem;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${theme.colors.wine};
  }
`;

const Footer = styled.div`
  padding: 1.5rem;
  background: ${theme.colors.surfaceSoft};
  border-top: 1px solid ${theme.colors.border};
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: ${theme.radii.md};
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.2s;

  ${({ $primary }) => $primary ? `
    background: ${theme.colors.wine};
    color: white;
    border: none;
    box-shadow: 0 4px 12px rgba(138, 31, 61, 0.3);

    &:hover {
      background: ${theme.colors.wineLight};
      transform: translateY(-1px);
    }
  ` : `
    background: transparent;
    color: ${theme.colors.ice};
    border: 1px solid ${theme.colors.border};

    &:hover {
      background: ${theme.colors.charcoal};
    }
  `}
`;

export function MemberFormModal({ onClose, onSave }) {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', status: 'ACTIVE', congregation: 'Sede' });

  const handleSubmit = () => {
    if (!formData.name) return alert('Nome é obrigatório');
    onSave(formData);
    onClose();
  };

  return (
    <Overlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <Header>
          <Title>Novo Membro</Title>
          <CloseButton onClick={onClose}><X size={20} /></CloseButton>
        </Header>
        <Body>
          <FormGroup>
            <Label>Nome Completo</Label>
            <Input 
              autoFocus
              placeholder="Digite o nome..." 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
            />
          </FormGroup>
          <FormGroup>
            <Label>E-mail</Label>
            <Input 
              type="email"
              placeholder="email@exemplo.com" 
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})} 
            />
          </FormGroup>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <FormGroup style={{ flex: 1 }}>
              <Label>Telefone</Label>
              <Input 
                placeholder="(00) 00000-0000" 
                value={formData.phone} 
                onChange={e => setFormData({...formData, phone: e.target.value})} 
              />
            </FormGroup>
            <FormGroup style={{ flex: 1 }}>
              <Label>Status</Label>
              <Select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="ACTIVE">Ativo</option>
                <option value="VISITOR">Visitante</option>
                <option value="INACTIVE">Inativo</option>
              </Select>
            </FormGroup>
          </div>
        </Body>
        <Footer>
          <Button onClick={onClose}>Cancelar</Button>
          <Button $primary onClick={handleSubmit}>Salvar Membro</Button>
        </Footer>
      </ModalContent>
    </Overlay>
  );
}
