import { useState } from 'react';
import { QrCode, UserPlus } from 'lucide-react';
import { Button } from '../../../components/common/Button.jsx';
import { Field, FormGrid, Input, Panel, PanelTitle } from './InfantilLayout.js';

const initialForm = { name: '', age: '', allergies: '' };

export function QuickCheckinCard({ disabled = false, isSubmitting = false, onSubmit }) {
  const [formData, setFormData] = useState(initialForm);

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.name || !formData.age || disabled || isSubmitting) return;

    await onSubmit(formData);
    setFormData(initialForm);
  };

  return (
    <Panel>
      <PanelTitle><UserPlus size={18} /> Novo check-in rápido</PanelTitle>
      <form onSubmit={handleSubmit}>
        <FormGrid>
          <Field $span={4}>
            <span>Nome da criança</span>
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
            <span>Alergias / observações</span>
            <Input
              placeholder="Nenhuma"
              value={formData.allergies}
              onChange={(event) => updateField('allergies', event.target.value)}
              disabled={disabled || isSubmitting}
            />
          </Field>
          <Field $span={2}>
            <span>&nbsp;</span>
            <Button type="submit" disabled={!formData.name || !formData.age || disabled || isSubmitting}>
              <QrCode size={18} /> {isSubmitting ? 'Gerando' : 'Ticket'}
            </Button>
          </Field>
        </FormGrid>
      </form>
    </Panel>
  );
}
