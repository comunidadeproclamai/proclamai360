import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';
import { navigationItems } from '../../constants/navigation.js';
import { useThemeMode } from '../../contexts/ThemeModeContext.jsx';
import { hasPermission } from '../../lib/permissions.js';
import { useAuth } from '../../modules/auth/hooks/useAuth.js';

export function Sidebar({ isOpen, onClose }) {
  const { themeMode } = useThemeMode();
  const { user } = useAuth();

  const logoSrc = themeMode === 'dark' ? '/logo-dark.png' : '/logo-light.png';
  const visibleItems = navigationItems.filter((item) => hasPermission(user, item.permission));

  return (
    <>
      <Backdrop $isOpen={isOpen} onClick={onClose} />
      <Aside $isOpen={isOpen}>
        <Brand>
          <BrandMarkContainer>
            <BrandLogoImage src={logoSrc} alt="Proclamai 360" />
          </BrandMarkContainer>
          <CloseButton type="button" onClick={onClose} aria-label="Fechar menu">
            <X size={18} />
          </CloseButton>
        </Brand>

        <Nav aria-label="Navegação principal">
          {visibleItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavItem key={item.path} to={item.path} onClick={onClose}>
                <IconWrapper>
                  <Icon size={18} />
                </IconWrapper>
                <span>{item.label}</span>
              </NavItem>
            );
          })}
        </Nav>
      </Aside>
    </>
  );
}

const Aside = styled.aside`
  position: sticky;
  top: 0;
  height: 100vh;
  padding: 1.5rem 1.25rem;
  background: ${({ theme }) => theme.colors.charcoal};
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  z-index: 30;
  display: flex;
  flex-direction: column;
  box-shadow: 10px 0 30px rgba(0, 0, 0, 0.05);

  @media (max-width: 920px) {
    position: fixed;
    width: min(20rem, calc(100vw - 2rem));
    transform: translateX(${({ $isOpen }) => ($isOpen ? '0' : '-110%')});
    transition: transform 250ms cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: ${({ theme }) => theme.shadow};
  }
`;

const Backdrop = styled.button`
  display: none;

  @media (max-width: 920px) {
    display: ${({ $isOpen }) => ($isOpen ? 'block' : 'none')};
    position: fixed;
    inset: 0;
    border: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    z-index: 20;
  }
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2.5rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const BrandMarkContainer = styled.div`
  width: 100%;
  max-width: 180px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.08));
`;

const BrandLogoImage = styled.img`
  width: 100%;
  height: auto;
  display: block;
`;

const CloseButton = styled.button`
  display: none;
  width: 2.25rem;
  height: 2.25rem;
  align-items: center;
  justify-content: center;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: transparent;
  color: ${({ theme }) => theme.colors.ice};
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: ${({ theme }) => theme.colors.gold};
  }

  @media (max-width: 920px) {
    display: flex;
  }
`;

const Nav = styled.nav`
  display: grid;
  gap: 0.45rem;
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 0.85rem;
  min-height: 2.85rem;
  padding: 0 1rem;
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.muted};
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  position: relative;

  &.active {
    background: ${({ theme }) => theme.colors.wineGlow};
    color: ${({ theme }) => theme.colors.wine};
    box-shadow: inset 3px 0 0 ${({ theme }) => theme.colors.gold};
    
    ${IconWrapper} {
      color: ${({ theme }) => theme.colors.gold};
      transform: scale(1.05);
    }
  }

  &:hover:not(.active) {
    background: rgba(255, 255, 255, 0.05);
    color: ${({ theme }) => theme.colors.ice};
    
    ${IconWrapper} {
      color: ${({ theme }) => theme.colors.gold};
      transform: scale(1.05);
    }
  }
`;
