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
          <BrandMarkContainer>
            <BrandLogoImage src="/logo.png" alt="P" />
          </BrandMarkContainer>
          <div>
            <BrandName>Proclamai 360</BrandName>
            <BrandMeta>Gestão de Excelência</BrandMeta>
          </div>
          <CloseButton type="button" onClick={onClose} aria-label="Fechar menu">
            <X size={18} />
          </CloseButton>
        </Brand>

        <Nav aria-label="Navegação principal">
          {navigationItems.map((item) => {
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
  background: ${theme.colors.charcoal};
  border-right: 1px solid rgba(197, 165, 92, 0.08);
  z-index: 30;
  display: flex;
  flex-direction: column;
  box-shadow: 10px 0 30px rgba(0, 0, 0, 0.15);

  @media (max-width: 920px) {
    position: fixed;
    width: min(20rem, calc(100vw - 2rem));
    transform: translateX(${({ $isOpen }) => ($isOpen ? '0' : '-110%')});
    transition: transform 250ms cubic-bezier(0.16, 1, 0.3, 1);
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
    background: rgba(0, 0, 0, 0.65);
    backdrop-filter: blur(4px);
    z-index: 20;
  }
`;

const Brand = styled.div`
  display: grid;
  grid-template-columns: 2.75rem 1fr auto;
  align-items: center;
  gap: 0.85rem;
  margin-bottom: 2.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
`;

const BrandMarkContainer = styled.div`
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 50%;
  border: 1.5px solid ${theme.colors.gold};
  padding: 2px;
  background: rgba(18, 14, 15, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(197, 165, 92, 0.15);
`;

const BrandLogoImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
`;

const BrandName = styled.strong`
  display: block;
  line-height: 1.1;
  font-size: 1.1rem;
  font-weight: 700;
  color: ${theme.colors.ice};
  letter-spacing: -0.01em;
`;

const BrandMeta = styled.span`
  display: block;
  margin-top: 0.15rem;
  color: ${theme.colors.gold};
  font-size: 0.72rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
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
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.03);
    border-color: ${theme.colors.gold};
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
  border-radius: ${theme.radii.md};
  color: ${theme.colors.muted};
  font-weight: 500;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  position: relative;

  &.active {
    background: rgba(92, 6, 30, 0.22);
    color: ${theme.colors.ice};
    box-shadow: inset 3px 0 0 ${theme.colors.gold};
    
    ${IconWrapper} {
      color: ${theme.colors.gold};
      transform: scale(1.05);
    }
  }

  &:hover:not(.active) {
    background: rgba(255, 255, 255, 0.03);
    color: ${theme.colors.ice};
    
    ${IconWrapper} {
      color: ${theme.colors.goldLight};
      transform: scale(1.05);
    }
  }
`;
