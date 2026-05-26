import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';
import { navigationItems } from '../../constants/navigation.js';
import { appConfig } from '../../config/appConfig.js';
import { theme } from '../../styles/theme.js';

export function Sidebar({ isOpen, onClose }) {
  return (
    <>
      <Backdrop $isOpen={isOpen} onClick={onClose} />
      <Aside $isOpen={isOpen}>
        <Brand>
          <BrandMark>P</BrandMark>
          <div>
            <BrandName>{appConfig.name}</BrandName>
            <BrandMeta>gestao interna</BrandMeta>
          </div>
          <CloseButton type="button" onClick={onClose} aria-label="Fechar menu">
            <X size={18} />
          </CloseButton>
        </Brand>

        <Nav aria-label="Navegacao principal">
          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavItem key={item.path} to={item.path} onClick={onClose}>
                <Icon size={18} />
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
  padding: 1.25rem;
  background: ${theme.colors.charcoal};
  z-index: 30;

  @media (max-width: 920px) {
    position: fixed;
    width: min(20rem, calc(100vw - 2rem));
    transform: translateX(${({ $isOpen }) => ($isOpen ? '0' : '-110%')});
    transition: transform 180ms ease;
    box-shadow: ${theme.shadow};
  }
`;

const Backdrop = styled.button`
  display: none;

  @media (max-width: 920px) {
    display: ${({ $isOpen }) => ($isOpen ? 'block' : 'none')};
    position: fixed;
    inset: 0;
    border: 0;
    background: rgba(0, 0, 0, 0.56);
    z-index: 20;
  }
`;

const Brand = styled.div`
  display: grid;
  grid-template-columns: 2.75rem 1fr auto;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const BrandMark = styled.div`
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: ${theme.radii.md};
  background: ${theme.colors.wine};
  color: ${theme.colors.ice};
  font-weight: 800;
`;

const BrandName = styled.strong`
  display: block;
  line-height: 1.1;
`;

const BrandMeta = styled.span`
  display: block;
  margin-top: 0.2rem;
  color: ${theme.colors.mutedDark};
  font-size: 0.78rem;
`;

const CloseButton = styled.button`
  display: none;
  width: 2.25rem;
  height: 2.25rem;
  align-items: center;
  justify-content: center;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.sm};
  background: transparent;
  color: ${theme.colors.ice};

  @media (max-width: 920px) {
    display: flex;
  }
`;

const Nav = styled.nav`
  display: grid;
  gap: 0.35rem;
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 0.7rem;
  min-height: 2.75rem;
  padding: 0 0.85rem;
  border-radius: ${theme.radii.md};
  color: ${theme.colors.muted};

  &.active {
    background: rgba(138, 31, 61, 0.18);
    color: ${theme.colors.ice};
  }

  &:hover {
    background: ${theme.colors.surfaceSoft};
    color: ${theme.colors.ice};
  }
`;
