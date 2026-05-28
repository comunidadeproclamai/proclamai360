import { useState } from 'react';
import styled from 'styled-components';
import { IdCard, Save } from 'lucide-react';
import { Button } from '../../../components/common/Button.jsx';
import { Field, FormGrid, Input, MutedText, Panel, PanelTitle } from './InfantilLayout.js';

const initialForm = { name: '', phone: '', email: '' };

export function GuardianRegistryCard({
  disabled = false,
  guardians = [],
  isSubmitting = false,
  onCreateGuardian,
}) {
  const [formData, setFormData] = useState(initialForm);

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.name || disabled || isSubmitting) return;

    await onCreateGuardian(formData);
    setFormData(initialForm);
  };

  return (
    <Panel>
      <PanelTitle><IdCard size={18} /> Responsáveis</PanelTitle>
      <form onSubmit={handleSubmit}>
        <FormGrid>
          <Field $span={5}>
            <span>Nome</span>
            <Input
              placeholder="Nome do responsável"
              value={formData.name}
              onChange={(event) => updateField('name', event.target.value)}
              disabled={disabled || isSubmitting}
            />
          </Field>
          <Field $span={3}>
            <span>Telefone</span>
            <Input
              placeholder="Opcional"
              value={formData.phone}
              onChange={(event) => updateField('phone', event.target.value)}
              disabled={disabled || isSubmitting}
            />
          </Field>
          <Field $span={4}>
            <span>E-mail</span>
            <Input
              type="email"
              placeholder="Opcional"
              value={formData.email}
              onChange={(event) => updateField('email', event.target.value)}
              disabled={disabled || isSubmitting}
            />
          </Field>
          <Field $span={3}>
            <span>&nbsp;</span>
            <Button type="submit" disabled={!formData.name || disabled || isSubmitting}>
              <Save size={18} /> Salvar
            </Button>
          </Field>
        </FormGrid>
      </form>

      <List>
        {guardians.length === 0 ? (
          <MutedText>Nenhum responsável cadastrado para seleção rápida.</MutedText>
        ) : (
          guardians.slice(0, 6).map((guardian) => (
            <Row key={guardian.id}>
              <strong>{guardian.name}</strong>
              <span>{guardian.phone || guardian.email || 'Sem contato'}</span>
            </Row>
          ))
        )}
      </List>
    </Panel>
  );
}

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1.25rem;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 0;
  border-top: 1px solid ${({ theme }) => theme.colors.border};

  strong {
    color: ${({ theme }) => theme.colors.ice};
    font-size: 0.9rem;
  }

  span {
    color: ${({ theme }) => theme.colors.muted};
    font-size: 0.85rem;
    text-align: right;
  }
`;
