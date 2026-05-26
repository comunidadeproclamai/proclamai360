import styled from 'styled-components';
import { LogOut, Menu } from 'lucide-react';
import { IconButton } from '../common/IconButton.jsx';
import { useAuth } from '../../modules/auth/hooks/useAuth.js';
import { theme } from '../../styles/theme.js';

export function Header({ onOpenSidebar }) {
  const { user, logout } = useAuth();

  return (
    <HeaderBar>
      <MobileMenuButton type="button" onClick={onOpenSidebar} aria-label="Abrir menu">
        <Menu size={20} />
      </MobileMenuButton>

      <Greeting>
        <span>Ola,</span>
        <strong>{user?.name || 'Equipe'}</strong>
      </Greeting>

      <UserActions>
        <UserBadge>{getInitials(user?.name)}</UserBadge>
        <IconButton type="button" onClick={logout} title="Sair">
          <LogOut size={18} />
        </IconButton>
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
    .toUpperCase();
}

const HeaderBar = styled.header`
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 4.5rem;
  padding: 0 1.75rem;
  border-bottom: 1px solid ${theme.colors.border};
  background: rgba(30, 27, 27, 0.9);
  backdrop-filter: blur(18px);

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
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  background: ${theme.colors.surface};
  color: ${theme.colors.ice};

  @media (max-width: 920px) {
    display: flex;
  }
`;

const Greeting = styled.div`
  min-width: 0;

  span {
    display: block;
    color: ${theme.colors.mutedDark};
    font-size: 0.78rem;
  }

  strong {
    display: block;
    overflow: hidden;
    max-width: 42vw;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.98rem;
  }
`;

const UserActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.65rem;
`;

const UserBadge = styled.div`
  display: grid;
  place-items: center;
  width: 2.35rem;
  height: 2.35rem;
  border-radius: 50%;
  background: ${theme.colors.wine};
  color: ${theme.colors.ice};
  font-size: 0.8rem;
  font-weight: 800;
`;
