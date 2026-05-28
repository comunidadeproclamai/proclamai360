import { useState } from 'react';
import styled from 'styled-components';
import { Baby, Save } from 'lucide-react';
import { Button } from '../../../components/common/Button.jsx';
import { Field, FormGrid, Input, MutedText, Panel, PanelTitle, Select } from './InfantilLayout.js';

const initialForm = { name: '', age: '', allergies: '', specialNeeds: '', guardianId: '', relation: 'Responsavel' };

export function ChildrenRegistryCard({
  childrenRecords,
  disabled = false,
  guardians = [],
  isSubmitting = false,
  onCreateChild,
}) {
  const [formData, setFormData] = useState(initialForm);

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.name || !formData.age || disabled || isSubmitting) return;

    await onCreateChild(formData);
    setFormData(initialForm);
  };

  return (
    <Panel>
      <PanelTitle><Baby size={18} /> Cadastro de crianças</PanelTitle>
      <form onSubmit={handleSubmit}>
        <FormGrid>
          <Field $span={5}>
            <span>Nome</span>
            <Input
              placeholder="Nome completo"
              value={formData.name}
              onChange={(event) => updateField('name', event.target.value)}
              disabled={disabled || isSubmitting}
            />
          </Field>
          <Field $span={2}>
            <span>Idade</span>
            <Input
              type="number"
              min="0"
              max="17"
              placeholder="Anos"
              value={formData.age}
              onChange={(event) => updateField('age', event.target.value)}
              disabled={disabled || isSubmitting}
            />
          </Field>
          <Field $span={4}>
            <span>Necessidades especiais</span>
            <Input
              placeholder="Opcional"
              value={formData.specialNeeds}
              onChange={(event) => updateField('specialNeeds', event.target.value)}
              disabled={disabled || isSubmitting}
            />
          </Field>
          <Field $span={4}>
            <span>Responsável principal</span>
            <Select
              value={formData.guardianId}
              onChange={(event) => updateField('guardianId', event.target.value)}
              disabled={disabled || isSubmitting}
            >
              <option value="">Sem vínculo</option>
              {guardians.map((guardian) => (
                <option key={guardian.id} value={guardian.id}>
                  {guardian.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field $span={2}>
            <span>Parentesco</span>
            <Input
              placeholder="Pai, mae..."
              value={formData.relation}
              onChange={(event) => updateField('relation', event.target.value)}
              disabled={disabled || isSubmitting || !formData.guardianId}
            />
          </Field>
          <Field $span={3}>
            <span>Alergias / observações</span>
            <Input
              placeholder="Opcional"
              value={formData.allergies}
              onChange={(event) => updateField('allergies', event.target.value)}
              disabled={disabled || isSubmitting}
            />
          </Field>
          <Field $span={3}>
            <span>&nbsp;</span>
            <Button type="submit" disabled={!formData.name || !formData.age || disabled || isSubmitting}>
              <Save size={18} /> Salvar
            </Button>
          </Field>
        </FormGrid>
      </form>

      <List>
        {childrenRecords.length === 0 ? (
          <MutedText>Nenhuma criança cadastrada ainda.</MutedText>
        ) : (
          childrenRecords.slice(0, 8).map((child) => (
            <Row key={child.id}>
              <div>
                <strong>{child.name}</strong>
                <span>
                  {child.age} anos • {child.room}
                  {child.primaryGuardian ? ` • Resp: ${child.primaryGuardian.name}` : ''}
                </span>
              </div>
              <Badge>{child.checkinsCount} check-ins</Badge>
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
  padding: 0.85rem 0;
  border-top: 1px solid ${({ theme }) => theme.colors.border};

  strong {
    display: block;
    color: ${({ theme }) => theme.colors.ice};
    font-size: 0.95rem;
  }

  span {
    color: ${({ theme }) => theme.colors.muted};
    font-size: 0.85rem;
  }
`;

const Badge = styled.span`
  align-self: center;
  white-space: nowrap;
  padding: 0.35rem 0.6rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.surfaceSoft};
  color: ${({ theme }) => theme.colors.gold};
  font-weight: 700;
`;
