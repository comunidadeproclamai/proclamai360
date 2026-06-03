import { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { X } from 'lucide-react';

export function Modal({
  isOpen,
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  title,
  children,
  footer,
  onClose,
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = 'hidden';

    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose?.();
    };

    document.addEventListener('keydown', handleEscape);

    // Focus the dialog on open
    dialogRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <Dialog
        ref={dialogRef}
        $size={size}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
      >
        {title && (
          <Header>
            <Title>{title}</Title>
            <CloseBtn type="button" onClick={onClose} aria-label="Fechar modal">
              <X size={18} />
            </CloseBtn>
          </Header>
        )}

        <Body>{children}</Body>

        {footer && <Footer>{footer}</Footer>}
      </Dialog>
    </Overlay>
  );
}

const sizeMap = {
  sm: '400px',
  md: '500px',
  lg: '640px',
  xl: '800px',
};

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: ${({ theme }) => theme.zIndex.modal};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  animation: fadeIn 0.25s ease forwards;
`;

const Dialog = styled.div`
  width: min(${({ $size }) => sizeMap[$size] || sizeMap.md}, 100%);
  max-height: calc(100vh - 4rem);
  display: flex;
  flex-direction: column;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: ${({ theme }) => theme.shadow};
  overflow: hidden;
  animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  outline: none;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  flex-shrink: 0;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.ice};
  text-transform: uppercase;
  letter-spacing: -0.01em;
`;

const CloseBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: transparent;
  color: ${({ theme }) => theme.colors.muted};
  transition: all 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceSoft};
    color: ${({ theme }) => theme.colors.ice};
  }
`;

const Body = styled.div`
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceSoft};
  flex-shrink: 0;
`;
