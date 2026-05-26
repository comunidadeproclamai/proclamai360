import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { AuthPanel } from '../components/AuthPanel.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { theme } from '../../../styles/theme.js';

const initialForm = {
  name: '',
  email: '',
  password: '',
};

export function LoginPage() {
  const { authenticate, isAuthenticated, isBootstrapping } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isBootstrapping && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  }

  function handleModeChange(nextMode) {
    setMode(nextMode);
    setError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await authenticate(mode, form);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Nao foi possivel autenticar. Verifique os dados e tente novamente.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Page>
      <Intro>
        <Kicker>Gestao acolhedora para equipes ministeriais</Kicker>
        <h2>Uma base simples para cuidar de pessoas, rotinas e ministerios.</h2>
        <p>
          Estrutura modular preparada para membros, financeiro, escalas, comunicacao e novos
          fluxos sem perder clareza.
        </p>
      </Intro>

      <AuthPanel
        mode={mode}
        form={form}
        error={error}
        isSubmitting={isSubmitting}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onChangeMode={handleModeChange}
      />
    </Page>
  );
}

const Page = styled.main`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(20rem, 27rem);
  align-items: center;
  gap: 3rem;
  min-height: 100vh;
  width: min(100%, 72rem);
  margin: 0 auto;
  padding: 2rem;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  @media (max-width: 520px) {
    padding: 1rem;
  }
`;

const Intro = styled.section`
  h2 {
    max-width: 42rem;
    margin: 0;
    font-size: clamp(2.25rem, 7vw, 4.8rem);
    line-height: 1;
    letter-spacing: 0;
  }

  p {
    max-width: 35rem;
    margin: 1.1rem 0 0;
    color: ${theme.colors.muted};
    font-size: 1.05rem;
    line-height: 1.7;
  }
`;

const Kicker = styled.span`
  display: block;
  margin-bottom: 0.8rem;
  color: ${theme.colors.wineLight};
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
`;
