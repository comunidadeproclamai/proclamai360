import styled from 'styled-components';
import { LogOut, Menu, Sun, Moon } from 'lucide-react';
import { IconButton } from '../common/IconButton.jsx';
import { useAuth } from '../../modules/auth/hooks/useAuth.js';
import { useThemeMode } from '../../contexts/ThemeModeContext.jsx';

export function Header({ onOpenSidebar }) {
  const { user, logout } = useAuth();
  const { themeMode, toggleTheme } = useThemeMode();

  return (
    <HeaderBar>
      <MobileMenuButton type="button" onClick={onOpenSidebar} aria-label="Abrir menu">
        <Menu size={20} />
      </MobileMenuButton>

      <Greeting>
        <span>Olá,</span>
        <strong>{user?.name || 'Equipe Proclamai'}</strong>
      </Greeting>

      <UserActions>
        <ThemeToggleButton type="button" onClick={toggleTheme} title="Alternar Tema">
          {themeMode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </ThemeToggleButton>
        
        <UserBadgeContainer>
          <UserBadge>{getInitials(user?.name)}</UserBadge>
        </UserBadgeContainer>
        
        <LogoutButton type="button" onClick={logout} title="Sair do Sistema">
          <LogOut size={16} />
        </LogoutButton>
      </UserActions>
    </HeaderBar>
  );
}

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'P3';
}

const HeaderBar = styled.header`
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 4.5rem;
  padding: 0 2rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface === '#ffffff' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(28, 22, 23, 0.85)'};
  backdrop-filter: blur(20px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);

  @media (max-width: 640px) {
    min-height: 4rem;
    padding: 0 1rem;
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  width: 2.5rem;
  height: 2.5rem;
  align-items: center;
  justify-content: center;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.ice};
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.gold};
    color: ${({ theme }) => theme.colors.gold};
  }

  @media (max-width: 920px) {
    display: flex;
  }
`;

const Greeting = styled.div`
  min-width: 0;

  span {
    display: block;
    color: ${({ theme }) => theme.colors.gold};
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  strong {
    display: block;
    overflow: hidden;
    max-width: 42vw;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 1.1rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.ice};
    margin-top: 0.1rem;
  }
`;

const UserActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.95rem;
`;

const ThemeToggleButton = styled.button`
  width: 2.35rem;
  height: 2.35rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 50%;
  background: transparent;
  color: ${({ theme }) => theme.colors.muted};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: ${({ theme }) => theme.colors.gold};
    border-color: ${({ theme }) => theme.colors.gold};
  }
`;

const UserBadgeContainer = styled.div`
  padding: 2px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.goldGradient};
  box-shadow: 0 2px 8px rgba(197, 165, 92, 0.15);
`;

const UserBadge = styled.div`
  display: grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.wine};
  color: #fcfaf7;
  font-size: 0.85rem;
  font-weight: 800;
  border: 1.5px solid ${({ theme }) => theme.colors.surface};
`;

const LogoutButton = styled(IconButton)`
  width: 2.35rem;
  height: 2.35rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 50%;
  background: transparent;
  color: ${({ theme }) => theme.colors.muted};
  transition: all 0.2s ease;

  &:hover {
    background: rgba(223, 83, 83, 0.06);
    color: ${({ theme }) => theme.colors.danger};
    border-color: rgba(223, 83, 83, 0.2);
    transform: scale(1.05);
  }
`;
