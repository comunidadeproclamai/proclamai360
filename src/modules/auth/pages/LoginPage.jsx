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
      <LogoSection>
        <GlowBackdrop />
        <LogoWrapper>
          <LogoImage src="/logo.png" alt="Proclamai 360" />
        </LogoWrapper>
        <Tagline>Gerindo o Reino de Deus com Excelência</Tagline>
        <Description>
          Uma plataforma de gestão premium, integrada e inteligente para congregações modernas cuidarem de pessoas, finanças e escalas em 360 graus.
        </Description>
      </LogoSection>

      <FormSection>
        <AuthPanel
          mode={mode}
          form={form}
          error={error}
          isSubmitting={isSubmitting}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onChangeMode={handleModeChange}
        />
      </FormSection>
    </Page>
  );
}

const Page = styled.main`
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  align-items: center;
  gap: 4rem;
  min-height: 100vh;
  width: 100%;
  max-width: 80rem;
  margin: 0 auto;
  padding: 3rem 2rem;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
    gap: 3rem;
    padding: 2rem 1.5rem;
  }
`;

const LogoSection = styled.section`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  padding: 2rem 0;
  animation: fadeIn 0.8s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(15px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 960px) {
    align-items: center;
    text-align: center;
  }
`;

const GlowBackdrop = styled.div`
  position: absolute;
  top: 50%;
  left: 30%;
  transform: translate(-50%, -50%);
  width: 25rem;
  height: 25rem;
  background: radial-gradient(circle, rgba(197, 165, 92, 0.09) 0%, rgba(92, 6, 30, 0.08) 50%, transparent 100%);
  z-index: -1;
  pointer-events: none;
  filter: blur(40px);

  @media (max-width: 960px) {
    left: 50%;
  }
`;

const LogoWrapper = styled.div`
  max-width: 260px;
  margin-bottom: 2rem;
  filter: drop-shadow(0 15px 30px rgba(0, 0, 0, 0.45));
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.03);
  }

  @media (max-width: 960px) {
    max-width: 200px;
  }
`;

const LogoImage = styled.img`
  width: 100%;
  height: auto;
  display: block;
`;

const Tagline = styled.h2`
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(2rem, 3.5vw, 3rem);
  font-weight: 600;
  font-style: italic;
  line-height: 1.2;
  margin: 0 0 1.2rem 0;
  background: ${theme.colors.goldGradient};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.01em;
  text-shadow: 0 2px 10px rgba(197, 165, 92, 0.1);
`;

const Description = styled.p`
  max-width: 34rem;
  margin: 0;
  color: ${theme.colors.muted};
  font-size: 1.1rem;
  line-height: 1.7;
  font-weight: 300;
  letter-spacing: 0.01em;
`;

const FormSection = styled.section`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  animation: fadeInRight 0.8s ease-out;

  @keyframes fadeInRight {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
  }
`;
