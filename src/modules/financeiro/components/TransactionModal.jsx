import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { X } from 'lucide-react';
import { parseCurrencyInput } from '../../../utils/currency.js';

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

export function TransactionModal({ isSubmitting = false, onClose, onSave, supportData }) {
  const { accounts = [], categories = [] } = supportData || {};
  const inflowCategories = categories.filter((category) => category.type === 'INFLOW');
  const outflowCategories = categories.filter((category) => category.type === 'OUTFLOW');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    description: '',
    amountStr: '',
    type: 'INFLOW',
    categoryId: '',
    accountId: accounts[0]?.id || '',
    date: todayInputValue(),
  });

  useEffect(() => {
    const activeCategories = formData.type === 'INFLOW' ? inflowCategories : outflowCategories;
    if (activeCategories.length > 0 && !activeCategories.find((category) => category.id === formData.categoryId)) {
      setFormData((current) => ({ ...current, categoryId: activeCategories[0].id }));
    }
  }, [formData.type, formData.categoryId, inflowCategories, outflowCategories]);

  useEffect(() => {
    if (!formData.accountId && accounts[0]?.id) {
      setFormData((current) => ({ ...current, accountId: accounts[0].id }));
    }
  }, [accounts, formData.accountId]);

  const handleChange = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleAmountChange = (event) => {
    handleChange('amountStr', event.target.value.replace(/[^0-9,]/g, ''));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const numericAmount = parseCurrencyInput(formData.amountStr);
    setError('');

    if (!formData.description || numericAmount <= 0) {
      setError('Descricao e valor sao obrigatorios.');
      return;
    }

    if (!formData.categoryId || !formData.accountId) {
      setError('Categoria e conta sao obrigatorias.');
      return;
    }

    try {
      await onSave({
        description: formData.description,
        amount: numericAmount,
        type: formData.type,
        categoryId: formData.categoryId,
        accountId: formData.accountId,
        date: formData.date,
      });
      onClose();
    } catch (saveError) {
      setError(saveError.response?.data?.message || 'Nao foi possivel salvar o lancamento.');
    }
  };

  const activeCategories = formData.type === 'INFLOW' ? inflowCategories : outflowCategories;

  return (
    <Overlay onClick={isSubmitting ? undefined : onClose}>
      <ModalContent onClick={(event) => event.stopPropagation()}>
        <Header>
          <Title>Novo Lançamento</Title>
          <CloseButton type="button" onClick={onClose} disabled={isSubmitting} aria-label="Fechar">
            <X size={20} />
          </CloseButton>
        </Header>

        <Form onSubmit={handleSubmit}>
          <Body>
            <TypeSelector>
              <TypeButton
                type="button"
                $active={formData.type === 'INFLOW'}
                $type="INFLOW"
                onClick={() => handleChange('type', 'INFLOW')}
                disabled={isSubmitting}
              >
                Receita
              </TypeButton>
              <TypeButton
                type="button"
                $active={formData.type === 'OUTFLOW'}
                $type="OUTFLOW"
                onClick={() => handleChange('type', 'OUTFLOW')}
                disabled={isSubmitting}
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
                onChange={(event) => handleChange('description', event.target.value)}
                disabled={isSubmitting}
              />
            </FormGroup>

            <InlineGrid>
              <FormGroup>
                <Label>Valor</Label>
                <Input
                  placeholder="0,00"
                  value={formData.amountStr}
                  onChange={handleAmountChange}
                  disabled={isSubmitting}
                />
              </FormGroup>

              <FormGroup>
                <Label>Data</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(event) => handleChange('date', event.target.value)}
                  disabled={isSubmitting}
                />
              </FormGroup>
            </InlineGrid>

            <FormGroup>
              <Label>Categoria</Label>
              <Select
                value={formData.categoryId}
                onChange={(event) => handleChange('categoryId', event.target.value)}
                disabled={isSubmitting}
              >
                {activeCategories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Conta</Label>
              <Select
                value={formData.accountId}
                onChange={(event) => handleChange('accountId', event.target.value)}
                disabled={isSubmitting}
              >
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>{account.name}</option>
                ))}
              </Select>
            </FormGroup>

            {error && <ErrorMessage>{error}</ErrorMessage>}
          </Body>

          <Footer>
            <SecondaryButton type="button" onClick={onClose} disabled={isSubmitting}>Cancelar</SecondaryButton>
            <PrimaryButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar Lançamento'}
            </PrimaryButton>
          </Footer>
        </Form>
      </ModalContent>
    </Overlay>
  );
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.65);
`;

const ModalContent = styled.div`
  width: min(520px, 100%);
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadow};
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Title = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.colors.ice};
  font-size: 1.15rem;
  font-weight: 800;
`;

const CloseButton = styled.button`
  display: grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  border: 0;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: transparent;
  color: ${({ theme }) => theme.colors.muted};

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.surfaceSoft};
    color: ${({ theme }) => theme.colors.ice};
  }
`;

const Form = styled.form`
  margin: 0;
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
`;

const InlineGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.span`
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.85rem;
  font-weight: 700;
`;

const Input = styled.input`
  min-height: 2.85rem;
  padding: 0 1rem;
  background: ${({ theme }) => theme.colors.surfaceSoft};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.ice};
  font-size: 0.95rem;
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.gold};
    box-shadow: 0 0 0 3px rgba(197, 165, 92, 0.12);
  }
`;

const Select = styled.select`
  min-height: 2.85rem;
  padding: 0 1rem;
  background: ${({ theme }) => theme.colors.surfaceSoft};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.ice};
  font-size: 0.95rem;
  outline: none;

  option {
    background: ${({ theme }) => theme.colors.charcoal};
    color: ${({ theme }) => theme.colors.ice};
  }
`;

const TypeSelector = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const TypeButton = styled.button`
  flex: 1;
  min-height: 2.75rem;
  border-radius: ${({ theme }) => theme.radii.md};
  font-weight: 800;
  border: 1px solid ${({ $active, $type, theme }) => ($active ? ($type === 'INFLOW' ? theme.colors.success : theme.colors.danger) : theme.colors.border)};
  background: ${({ $active, $type }) => ($active ? ($type === 'INFLOW' ? 'rgba(60,168,118,0.1)' : 'rgba(223,83,83,0.1)') : 'transparent')};
  color: ${({ $active, $type, theme }) => ($active ? ($type === 'INFLOW' ? theme.colors.success : theme.colors.danger) : theme.colors.muted)};
`;

const ErrorMessage = styled.div`
  padding: 0.85rem 1rem;
  border: 1px solid rgba(223, 83, 83, 0.32);
  border-radius: ${({ theme }) => theme.radii.md};
  background: rgba(223, 83, 83, 0.1);
  color: ${({ theme }) => theme.colors.danger};
  font-size: 0.9rem;
  font-weight: 700;
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceSoft};
`;

const SecondaryButton = styled.button`
  min-height: 2.75rem;
  padding: 0 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: transparent;
  color: ${({ theme }) => theme.colors.ice};
  font-weight: 800;
`;

const PrimaryButton = styled.button`
  min-height: 2.75rem;
  padding: 0 1.25rem;
  border: 1px solid rgba(197, 165, 92, 0.15);
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.wine};
  color: white;
  font-weight: 800;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.wineLight};
  }
`;
