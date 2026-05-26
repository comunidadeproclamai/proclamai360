import { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '../../../styles/theme.js';
import { parseCurrencyInput } from '../../../utils/currency.js';
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
`;

const TypeSelector = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const TypeButton = styled.button`
  flex: 1;
  padding: 0.75rem;
  border-radius: ${theme.radii.md};
  font-weight: 600;
  border: 1px solid ${({ $active, $type }) => 
    $active ? ($type === 'INFLOW' ? theme.colors.success : theme.colors.danger) : theme.colors.border
  };
  background: ${({ $active, $type }) => 
    $active ? ($type === 'INFLOW' ? 'rgba(70,178,128,0.1)' : 'rgba(225,93,93,0.1)') : 'transparent'
  };
  color: ${({ $active, $type }) => 
    $active ? ($type === 'INFLOW' ? theme.colors.success : theme.colors.danger) : theme.colors.muted
  };
  transition: all 0.2s;
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
  background: ${({ $primary }) => $primary ? theme.colors.wine : 'transparent'};
  color: ${({ $primary }) => $primary ? 'white' : theme.colors.ice};
  border: ${({ $primary }) => $primary ? 'none' : `1px solid ${theme.colors.border}`};
  
  &:hover {
    background: ${({ $primary }) => $primary ? theme.colors.wineLight : theme.colors.charcoal};
  }
`;

export function TransactionModal({ onClose, onSave, supportData }) {
  const { accounts = [], categories = [] } = supportData || {};
  
  const inflowCategories = categories.filter(c => c.type === 'INFLOW');
  const outflowCategories = categories.filter(c => c.type === 'OUTFLOW');

  const [formData, setFormData] = useState({ 
    description: '', 
    amountStr: '', 
    type: 'INFLOW',
    categoryId: '',
    accountId: accounts[0]?.id || ''
  });

  // Atualizar ID inicial quando trocar o array de categorias
  useEffect(() => {
    if (formData.type === 'INFLOW' && inflowCategories.length > 0 && !inflowCategories.find(c => c.id === formData.categoryId)) {
      setFormData(prev => ({ ...prev, categoryId: inflowCategories[0].id }));
    } else if (formData.type === 'OUTFLOW' && outflowCategories.length > 0 && !outflowCategories.find(c => c.id === formData.categoryId)) {
      setFormData(prev => ({ ...prev, categoryId: outflowCategories[0].id }));
    }
  }, [formData.type, categories]);

  const handleSubmit = () => {
    const numericAmount = parseCurrencyInput(formData.amountStr);
    if (!formData.description || numericAmount <= 0) {
      return alert('Descrição e valor são obrigatórios.');
    }
    if (!formData.categoryId || !formData.accountId) {
      return alert('Categoria e Conta são obrigatórias.');
    }
    
    onSave({
      description: formData.description,
      amount: numericAmount,
      type: formData.type,
      categoryId: formData.categoryId,
      accountId: formData.accountId
    });
    onClose();
  };

  const handleAmountChange = (e) => {
    const val = e.target.value.replace(/[^0-9,]/g, '');
    setFormData({ ...formData, amountStr: val });
  };

  const activeCategories = formData.type === 'INFLOW' ? inflowCategories : outflowCategories;

  return (
    <Overlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <Header>
          <Title>Novo Lançamento</Title>
          <CloseButton onClick={onClose}><X size={20} /></CloseButton>
        </Header>
        <Body>
          <TypeSelector>
            <TypeButton 
              $active={formData.type === 'INFLOW'} 
              $type="INFLOW"
              onClick={() => setFormData({...formData, type: 'INFLOW'})}
            >
              Receita
            </TypeButton>
            <TypeButton 
              $active={formData.type === 'OUTFLOW'} 
              $type="OUTFLOW"
              onClick={() => setFormData({...formData, type: 'OUTFLOW'})}
            >
              Despesa
            </TypeButton>
          </TypeSelector>

          <FormGroup>
            <Label>Descrição</Label>
            <Input 
              autoFocus
              placeholder="Ex: Dízimo - João Silva" 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
            />
          </FormGroup>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <FormGroup style={{ flex: 1 }}>
              <Label>Valor</Label>
              <Input 
                placeholder="0,00" 
                value={formData.amountStr} 
                onChange={handleAmountChange} 
              />
            </FormGroup>
            <FormGroup style={{ flex: 1 }}>
              <Label>Categoria</Label>
              <Select 
                value={formData.categoryId} 
                onChange={e => setFormData({...formData, categoryId: e.target.value})}
              >
                {activeCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </Select>
            </FormGroup>
          </div>

          <FormGroup>
            <Label>Conta Bancária</Label>
            <Select 
              value={formData.accountId} 
              onChange={e => setFormData({...formData, accountId: e.target.value})}
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </Select>
          </FormGroup>

        </Body>
        <Footer>
          <Button onClick={onClose}>Cancelar</Button>
          <Button $primary onClick={handleSubmit}>Salvar Lançamento</Button>
        </Footer>
      </ModalContent>
    </Overlay>
  );
}
