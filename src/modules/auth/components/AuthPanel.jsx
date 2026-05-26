import styled from 'styled-components';
import { LockKeyhole, LogIn, UserPlus } from 'lucide-react';
import { Button } from '../../../components/common/Button.jsx';
import { TextField } from '../../../components/forms/TextField.jsx';
import { theme } from '../../../styles/theme.js';

export function AuthPanel({
  mode,
  form,
  error,
  isSubmitting,
  onChange,
  onSubmit,
  onChangeMode,
}) {
  const isRegister = mode === 'register';

  return (
    <Panel>
      <PanelHeader>
        <LockKeyhole size={22} />
        <div>
          <h1>Proclamai 360</h1>
          <p>{isRegister ? 'Criar acesso da equipe' : 'Acessar ambiente interno'}</p>
        </div>
      </PanelHeader>

      <ModeSwitch role="tablist" aria-label="Modo de autenticacao">
        <button type="button" data-active={!isRegister} onClick={() => onChangeMode('login')}>
          Entrar
        </button>
        <button type="button" data-active={isRegister} onClick={() => onChangeMode('register')}>
          Criar conta
        </button>
      </ModeSwitch>

      <Form onSubmit={onSubmit}>
        {isRegister && (
          <TextField
            label="Nome"
            name="name"
            autoComplete="name"
            value={form.name}
            onChange={onChange}
          />
        )}

        <TextField
          label="E-mail"
          name="email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={onChange}
        />

        <TextField
          label="Senha"
          name="password"
          type="password"
          autoComplete={isRegister ? 'new-password' : 'current-password'}
          value={form.password}
          onChange={onChange}
        />

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <Button type="submit" disabled={isSubmitting}>
          {isRegister ? <UserPlus size={18} /> : <LogIn size={18} />}
          {isSubmitting ? 'Enviando...' : isRegister ? 'Criar conta' : 'Entrar'}
        </Button>
      </Form>
    </Panel>
  );
}

const Panel = styled.section`
  width: min(100%, 27rem);
  padding: 1.4rem;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  background: rgba(30, 27, 27, 0.94);
  box-shadow: ${theme.shadow};
`;

const PanelHeader = styled.div`
  display: flex;
  gap: 0.85rem;
  align-items: center;
  margin-bottom: 1.2rem;

  svg {
    color: ${theme.colors.wineLight};
  }

  h1 {
    margin: 0;
    font-size: 1.35rem;
    letter-spacing: 0;
  }

  p {
    margin: 0.25rem 0 0;
    color: ${theme.colors.muted};
  }
`;

const ModeSwitch = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.35rem;
  padding: 0.3rem;
  margin-bottom: 1.1rem;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  background: ${theme.colors.charcoal};

  button {
    min-height: 2.35rem;
    border: 0;
    border-radius: ${theme.radii.sm};
    background: transparent;
    color: ${theme.colors.muted};
    font-weight: 700;
  }

  button[data-active='true'] {
    background: ${theme.colors.surfaceSoft};
    color: ${theme.colors.ice};
  }
`;

const Form = styled.form`
  display: grid;
  gap: 0.9rem;
`;

const ErrorMessage = styled.div`
  padding: 0.8rem;
  border: 1px solid rgba(225, 93, 93, 0.42);
  border-radius: ${theme.radii.md};
  background: rgba(225, 93, 93, 0.08);
  color: ${theme.colors.danger};
  line-height: 1.45;
`;
