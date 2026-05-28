import { useMemo, useState } from 'react';
import styled from 'styled-components';
import { QrCode, UserPlus } from 'lucide-react';
import { Button } from '../../../components/common/Button.jsx';
import { Field, FormGrid, Input, MutedText, Panel, PanelTitle, Select } from './InfantilLayout.js';

const initialForm = {
  childId: '',
  name: '',
  age: '',
  allergies: '',
  guardianId: '',
};

export function QuickCheckinCard({
  activeChildren = [],
  childrenRecords = [],
  disabled = false,
  guardians = [],
  isSubmitting = false,
  onSubmit,
}) {
  const [formData, setFormData] = useState(initialForm);

  const activeChildIds = useMemo(
    () => new Set(activeChildren.map((child) => child.childId)),
    [activeChildren],
  );
  const selectedChild = childrenRecords.find((child) => child.id === formData.childId);

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleChildChange = (childId) => {
    const child = childrenRecords.find((record) => record.id === childId);
    setFormData((current) => ({
      ...current,
      childId,
      name: '',
      age: '',
      allergies: '',
      guardianId: child?.primaryGuardian?.id || current.guardianId,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const isRegisteredCheckin = Boolean(formData.childId);
    const isManualCheckin = Boolean(formData.name && formData.age);

    if ((!isRegisteredCheckin && !isManualCheckin) || disabled || isSubmitting) return;

    await onSubmit(formData);
    setFormData(initialForm);
  };

  const canSubmit = formData.childId || (formData.name && formData.age);

  return (
    <Panel>
      <PanelTitle><UserPlus size={18} /> Novo check-in rápido</PanelTitle>
      <form onSubmit={handleSubmit}>
        <FormGrid>
          <Field $span={4}>
            <span>Criança cadastrada</span>
            <Select
              value={formData.childId}
              onChange={(event) => handleChildChange(event.target.value)}
              disabled={disabled || isSubmitting}
            >
              <option value="">Check-in avulso</option>
              {childrenRecords.map((child) => {
                const isActive = activeChildIds.has(child.id);
                return (
                  <option key={child.id} value={child.id} disabled={isActive}>
                    {child.name} - {child.age} anos{isActive ? ' - em sala' : ''}
                  </option>
                );
              })}
            </Select>
          </Field>

          <Field $span={3}>
            <span>Responsável</span>
            <Select
              value={formData.guardianId}
              onChange={(event) => updateField('guardianId', event.target.value)}
              disabled={disabled || isSubmitting}
            >
              <option value="">Visitante / geral</option>
              {guardians.map((guardian) => (
                <option key={guardian.id} value={guardian.id}>
                  {guardian.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field $span={2}>
            <span>Nome da criança</span>
            <Input
              placeholder="Nome completo"
              value={selectedChild?.name || formData.name}
              onChange={(event) => updateField('name', event.target.value)}
              disabled={Boolean(selectedChild) || disabled || isSubmitting}
            />
          </Field>

          <Field $span={1}>
            <span>Idade</span>
            <Input
              type="number"
              min="0"
              max="17"
              placeholder="Anos"
              value={selectedChild?.age ?? formData.age}
              onChange={(event) => updateField('age', event.target.value)}
              disabled={Boolean(selectedChild) || disabled || isSubmitting}
            />
          </Field>

          <Field $span={2}>
            <span>&nbsp;</span>
            <Button type="submit" disabled={!canSubmit || disabled || isSubmitting}>
              <QrCode size={18} /> {isSubmitting ? 'Gerando' : 'Ticket'}
            </Button>
          </Field>

          {!selectedChild && (
            <Field $span={12}>
              <span>Alergias / observações para check-in avulso</span>
              <Input
                placeholder="Nenhuma"
                value={formData.allergies}
                onChange={(event) => updateField('allergies', event.target.value)}
                disabled={disabled || isSubmitting}
              />
            </Field>
          )}

          {selectedChild && (
            <Summary $span={12}>
              <strong>{selectedChild.room}</strong>
              <span>{selectedChild.allergies ? `Alergia: ${selectedChild.allergies}` : 'Sem alergias registradas'}</span>
              <span>{selectedChild.primaryGuardian ? `Responsável principal: ${selectedChild.primaryGuardian.name}` : 'Sem responsável principal vinculado'}</span>
            </Summary>
          )}
        </FormGrid>
      </form>
    </Panel>
  );
}

const Summary = styled(MutedText)`
  grid-column: span ${({ $span = 12 }) => $span};
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  padding: 0.85rem 1rem;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.surfaceSoft};

  strong {
    color: ${({ theme }) => theme.colors.gold};
  }
`;
