import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { Sun, Moon } from 'lucide-react';
import { AuthPanel } from '../components/AuthPanel.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useThemeMode } from '../../../contexts/ThemeModeContext.jsx';

const initialForm = {
  name: '',
  email: '',
  password: '',
};

export function LoginPage() {
  const { authenticate, isAuthenticated, isBootstrapping } = useAuth();
  const { themeMode, toggleTheme } = useThemeMode();
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
          'Não foi possível autenticar. Verifique os dados e tente novamente.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  // Dynamically select the logo based on the theme mode
  const logoSrc = themeMode === 'dark' ? '/logo-dark.png' : '/logo-light.png';

  return (
    <Page>
      <ThemeToggleFloating type="button" onClick={toggleTheme} title="Alternar Tema">
        {themeMode === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
      </ThemeToggleFloating>

      <LogoSection>
        <GlowBackdrop />
        <LogoWrapper>
          <LogoImage src={logoSrc} alt="Proclamai 360" />
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
  position: relative;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
    gap: 3rem;
    padding: 5rem 1.5rem 2rem 1.5rem;
  }
`;

const ThemeToggleFloating = styled.button`
  position: absolute;
  top: 2rem;
  right: 2rem;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.ice};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadow};
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.gold};
    color: ${({ theme }) => theme.colors.gold};
    transform: scale(1.05);
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
  background: radial-gradient(circle, rgba(197, 165, 92, 0.08) 0%, rgba(92, 6, 30, 0.05) 50%, transparent 100%);
  z-index: -1;
  pointer-events: none;
  filter: blur(40px);

  @media (max-width: 960px) {
    left: 50%;
  }
`;

const LogoWrapper = styled.div`
  width: 100%;
  max-width: 480px;
  margin-bottom: 2rem;
  filter: drop-shadow(0 15px 30px rgba(0, 0, 0, 0.2));
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.02);
  }

  @media (max-width: 960px) {
    max-width: 380px;
  }
`;

const LogoImage = styled.img`
  width: 100%;
  height: auto;
  display: block;
`;

const Tagline = styled.h2`
  font-size: clamp(1.4rem, 2.2vw, 1.8rem);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  line-height: 1.3;
  margin: 0 0 1.2rem 0;
  background: ${({ theme }) => theme.colors.goldGradient};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 10px rgba(197, 165, 92, 0.05);
`;

const Description = styled.p`
  max-width: 34rem;
  margin: 0;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 1rem;
  line-height: 1.7;
  font-weight: 400;
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
