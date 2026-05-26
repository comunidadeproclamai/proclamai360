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
        <IconContainer>
          <LockKeyhole size={20} />
        </IconContainer>
        <div>
          <h1>Área de Acesso</h1>
          <p>{isRegister ? 'Crie a conta da sua equipe' : 'Entre com suas credenciais'}</p>
        </div>
      </PanelHeader>

      <ModeSwitch role="tablist" aria-label="Modo de autenticação">
        <TabButton type="button" data-active={!isRegister} onClick={() => onChangeMode('login')}>
          Entrar
        </TabButton>
        <TabButton type="button" data-active={isRegister} onClick={() => onChangeMode('register')}>
          Nova Conta
        </TabButton>
      </ModeSwitch>

      <Form onSubmit={onSubmit}>
        {isRegister && (
          <TextField
            label="Nome"
            name="name"
            placeholder="Seu nome completo"
            autoComplete="name"
            value={form.name}
            onChange={onChange}
          />
        )}

        <TextField
          label="E-mail"
          name="email"
          type="email"
          placeholder="exemplo@proclamai.com.br"
          autoComplete="email"
          value={form.email}
          onChange={onChange}
        />

        <TextField
          label="Senha"
          name="password"
          type="password"
          placeholder="••••••••••••"
          autoComplete={isRegister ? 'new-password' : 'current-password'}
          value={form.password}
          onChange={onChange}
        />

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <SubmitButton type="submit" disabled={isSubmitting}>
          {isRegister ? <UserPlus size={18} /> : <LogIn size={18} />}
          {isSubmitting ? 'Verificando...' : isRegister ? 'Criar Acesso' : 'Acessar Plataforma'}
        </SubmitButton>
      </Form>
    </Panel>
  );
}

const Panel = styled.section`
  width: min(100%, 27rem);
  padding: 2.25rem 2rem;
  border: 1px solid rgba(197, 165, 92, 0.16);
  border-radius: ${theme.radii.lg};
  background: rgba(28, 22, 23, 0.85);
  backdrop-filter: blur(20px);
  box-shadow: ${theme.shadow}, inset 0 1px 0 rgba(255, 255, 255, 0.05);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${theme.colors.goldGradient};
  }
`;

const PanelHeader = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 2rem;

  h1 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: ${theme.colors.ice};
    letter-spacing: -0.01em;
  }

  p {
    margin: 0.25rem 0 0;
    color: ${theme.colors.muted};
    font-size: 0.875rem;
    font-weight: 300;
  }
`;

const IconContainer = styled.div`
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: ${theme.radii.md};
  background: ${theme.colors.wineGlow};
  border: 1px solid rgba(127, 18, 44, 0.3);
  color: ${theme.colors.gold};
`;

const ModeSwitch = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.4rem;
  padding: 0.35rem;
  margin-bottom: 1.75rem;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  background: rgba(18, 14, 15, 0.6);
`;

const TabButton = styled.button`
  min-height: 2.5rem;
  border: 0;
  border-radius: ${theme.radii.sm};
  background: transparent;
  color: ${theme.colors.muted};
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s ease;

  &[data-active='true'] {
    background: ${theme.colors.wine};
    color: ${theme.colors.ice};
    box-shadow: 0 4px 12px rgba(92, 6, 30, 0.35);
  }

  &:hover:not([data-active='true']) {
    color: ${theme.colors.ice};
    background: rgba(255, 255, 255, 0.03);
  }
`;

const Form = styled.form`
  display: grid;
  gap: 1.25rem;
`;

const ErrorMessage = styled.div`
  padding: 0.9rem 1rem;
  border: 1px solid rgba(223, 83, 83, 0.3);
  border-radius: ${theme.radii.md};
  background: rgba(223, 83, 83, 0.06);
  color: ${theme.colors.danger};
  font-size: 0.875rem;
  line-height: 1.5;
`;

const SubmitButton = styled(Button)`
  margin-top: 0.5rem;
  width: 100%;
  box-shadow: 0 4px 20px rgba(92, 6, 30, 0.4);
  background: ${theme.colors.wine};
  border: 1px solid rgba(197, 165, 92, 0.15);

  &:hover {
    background: ${theme.colors.wineLight};
    box-shadow: 0 4px 25px rgba(127, 18, 44, 0.5);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

