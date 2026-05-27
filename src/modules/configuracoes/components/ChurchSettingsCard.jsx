import styled from 'styled-components';
import { CheckCircle2, Home, Settings } from 'lucide-react';
import { Button } from '../../../components/common/Button.jsx';
import {
  CardDescription,
  CardHeader,
  FormGroup,
  Input,
  Label,
  SettingsCard,
} from './ConfiguracoesLayout.js';

export function ChurchSettingsCard({
  churchName,
  setChurchName,
  address,
  setAddress,
  loading,
  saveStatus,
  onSave,
}) {
  return (
    <SettingsCard>
      <CardHeader>
        <Home size={20} />
        <h3>Dados da Igreja</h3>
      </CardHeader>
      <CardDescription>
        Configure as informacoes publicas da congregacao para relatorios e tickets.
      </CardDescription>

      <Form onSubmit={onSave}>
        <FormGroup>
          <Label>Nome da Congregacao / Ministerio</Label>
          <Input
            type="text"
            value={churchName}
            onChange={(event) => setChurchName(event.target.value)}
            placeholder={loading ? 'Carregando...' : 'Ex: Comunidade Proclamai...'}
            disabled={loading}
          />
        </FormGroup>

        <FormGroup>
          <Label>Endereco Sede</Label>
          <Input
            type="text"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            placeholder={loading ? 'Carregando...' : 'Ex: Avenida Principal, 360...'}
            disabled={loading}
          />
        </FormGroup>

        <ButtonWrapper>
          <Button type="submit" disabled={saveStatus || loading}>
            {saveStatus ? <CheckCircle2 size={16} /> : <Settings size={16} />}
            {saveStatus ? 'Configuracoes Salvas!' : 'Salvar Preferencias'}
          </Button>
        </ButtonWrapper>
      </Form>
    </SettingsCard>
  );
}

const Form = styled.form`
  display: grid;
  gap: 1.25rem;
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 0.5rem;
`;
