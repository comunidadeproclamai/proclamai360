import styled from 'styled-components';
import { Moon, Palette, Sun } from 'lucide-react';
import { CardDescription, CardHeader, SettingsCard } from './ConfiguracoesLayout.js';

export function ThemeSettingsCard({ themeMode, onThemeChange }) {
  return (
    <SettingsCard>
      <CardHeader>
        <Palette size={20} />
        <h3>Identidade Visual & Tema</h3>
      </CardHeader>
      <CardDescription>
        Escolha a tonalidade do sistema com base na logo.
      </CardDescription>

      <ThemeOptions>
        <ThemeOptionCard
          $active={themeMode === 'dark'}
          onClick={() => onThemeChange('dark')}
          $mode="dark"
        >
          <MiniPreview $mode="dark">
            <MiniLogo src="/logo-dark.png" alt="Proclamai 360" />
            <span className="dot" />
          </MiniPreview>
          <OptionInfo>
            <div>
              <Moon size={16} />
              <strong>Tema Escuro</strong>
            </div>
            <span>Vinho profundo & Ouro sobre Charcoal</span>
          </OptionInfo>
          {themeMode === 'dark' && <ActiveBadge />}
        </ThemeOptionCard>

        <ThemeOptionCard
          $active={themeMode === 'light'}
          onClick={() => onThemeChange('light')}
          $mode="light"
        >
          <MiniPreview $mode="light">
            <MiniLogo src="/logo-light.png" alt="Proclamai 360" />
            <span className="dot" />
          </MiniPreview>
          <OptionInfo>
            <div>
              <Sun size={16} />
              <strong>Tema Claro</strong>
            </div>
            <span>Vinho profundo & Ouro sobre Off-White</span>
          </OptionInfo>
          {themeMode === 'light' && <ActiveBadge />}
        </ThemeOptionCard>
      </ThemeOptions>
    </SettingsCard>
  );
}

const ThemeOptions = styled.div`
  display: grid;
  gap: 1rem;
`;

const ThemeOptionCard = styled.button`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid ${({ $active, theme }) => ($active ? theme.colors.gold : theme.colors.border)};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.surfaceSoft};
  cursor: pointer;
  position: relative;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  text-align: left;

  &:hover {
    border-color: ${({ $active, theme }) =>
      $active ? theme.colors.gold : 'rgba(197, 165, 92, 0.3)'};
    transform: translateY(-2px);
  }
`;

const MiniPreview = styled.div`
  width: 90px;
  height: 55px;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ $mode }) => ($mode === 'dark' ? '#120e0f' : '#FAF8F5')};
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 0.25rem;

  .dot {
    position: absolute;
    bottom: 2px;
    right: 2px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #c5a55c;
  }
`;

const MiniLogo = styled.img`
  width: 100%;
  height: auto;
  object-fit: contain;
`;

const OptionInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  flex: 1;

  div {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  strong {
    font-size: 0.95rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.ice};
  }

  span {
    font-size: 0.78rem;
    color: ${({ theme }) => theme.colors.muted};
    font-weight: 400;
  }
`;

const ActiveBadge = styled.div`
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.gold};
  box-shadow: 0 0 10px ${({ theme }) => theme.colors.gold};
`;
