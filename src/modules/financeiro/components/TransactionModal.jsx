import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Modal } from '../../../components/common/Modal.jsx';
import { FormRow } from '../../../components/forms/FormRow.jsx';
import { SelectField } from '../../../components/forms/SelectField.jsx';
import { DateField } from '../../../components/forms/DateField.jsx';
import { parseCurrencyInput } from '../../../utils/currency.js';

const Input = styled.input`
  width: 100%;
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

const Label = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.85rem;
  font-weight: 700;
`;

const TypeSelector = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
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

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: ${({ theme }) => theme.radii.md};
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.2s;

  ${({ $primary, theme }) => $primary ? `
    background: ${theme.colors.wine};
    color: white;
    border: 1px solid rgba(197, 165, 92, 0.15);
    box-shadow: 0 4px 15px rgba(92, 6, 30, 0.25);

    &:hover:not(:disabled) {
      background: ${theme.colors.wineLight};
      transform: translateY(-1px);
    }
  ` : `
    background: transparent;
    color: ${theme.colors.ice};
    border: 1px solid ${theme.colors.border};

    &:hover:not(:disabled) {
      background: ${theme.colors.surfaceSoft};
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

export function TransactionModal({ isSubmitting = false, onClose, onSave, supportData, transactionToEdit = null }) {
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
    if (transactionToEdit) {
      setFormData({
        description: transactionToEdit.description,
        amountStr: transactionToEdit.amount.toString().replace('.', ','),
        type: transactionToEdit.type,
        categoryId: transactionToEdit.categoryId,
        accountId: transactionToEdit.accountId,
        date: transactionToEdit.date ? new Date(transactionToEdit.date).toISOString().slice(0, 10) : todayInputValue(),
      });
    }
  }, [transactionToEdit]);

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

  const handleSubmit = async () => {
    const numericAmount = parseCurrencyInput(formData.amountStr);
    setError('');

    if (!formData.description || numericAmount <= 0) {
      setError('Descrição e valor são obrigatórios.');
      return;
    }

    if (!formData.categoryId || !formData.accountId) {
      setError('Categoria e conta são obrigatórias.');
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
      setError(saveError.response?.data?.message || 'Não foi possível salvar o lançamento.');
    }
  };

  const activeCategories = formData.type === 'INFLOW' ? inflowCategories : outflowCategories;

  const footer = (
    <>
      <Button onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
      <Button $primary onClick={handleSubmit} disabled={isSubmitting}>
        {isSubmitting ? 'Salvando...' : (transactionToEdit ? 'Salvar Alterações' : 'Salvar Lançamento')}
      </Button>
    </>
  );

  return (
    <Modal 
      isOpen={true} 
      onClose={isSubmitting ? undefined : onClose} 
      title={transactionToEdit ? 'Editar Lançamento' : 'Novo Lançamento'} 
      footer={footer}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {error && <div style={{ color: '#ff6b6b', fontSize: '0.85rem' }}>{error}</div>}
        
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

        <Label>
          Descrição
          <Input
            autoFocus
            placeholder="Ex: Dízimo - João Silva"
            value={formData.description}
            onChange={(event) => handleChange('description', event.target.value)}
            disabled={isSubmitting}
          />
        </Label>

        <FormRow>
          <Label>
            Valor
            <Input
              placeholder="0,00"
              value={formData.amountStr}
              onChange={handleAmountChange}
              disabled={isSubmitting}
            />
          </Label>
          <DateField 
            label="Data" 
            value={formData.date} 
            onChange={(event) => handleChange('date', event.target.value)}
            disabled={isSubmitting}
          />
        </FormRow>

        <SelectField
          label="Categoria"
          value={formData.categoryId}
          onChange={(event) => handleChange('categoryId', event.target.value)}
          disabled={isSubmitting}
          options={activeCategories.map(cat => ({ value: cat.id, label: cat.name }))}
        />

        <SelectField
          label="Conta"
          value={formData.accountId}
          onChange={(event) => handleChange('accountId', event.target.value)}
          disabled={isSubmitting}
          options={accounts.map(acc => ({ value: acc.id, label: acc.name }))}
        />
      </div>
    </Modal>
  );
}
