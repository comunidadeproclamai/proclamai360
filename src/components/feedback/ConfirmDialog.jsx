import { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { AlertTriangle, Trash2 } from 'lucide-react';

export function ConfirmDialog({
  isOpen,
  variant = 'danger', // 'danger' | 'warning'
  title = 'Confirmar ação',
  message = 'Esta ação não poderá ser desfeita.',
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  isLoading = false,
  onConfirm,
  onCancel,
}) {
  const confirmRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      confirmRef.current?.focus();

      const handleEscape = (e) => {
        if (e.key === 'Escape' && !isLoading) onCancel?.();
      };

      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = '';
      };
    }
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  const IconComponent = variant === 'danger' ? Trash2 : AlertTriangle;

  return (
    <Overlay onClick={isLoading ? undefined : onCancel}>
      <Dialog onClick={(e) => e.stopPropagation()} role="alertdialog" aria-modal="true" aria-label={title}>
        <IconWrap $variant={variant}>
          <IconComponent size={24} />
        </IconWrap>

        <Title>{title}</Title>
        <Message>{message}</Message>

        <Actions>
          <CancelBtn type="button" onClick={onCancel} disabled={isLoading}>
            {cancelLabel}
          </CancelBtn>
          <ConfirmBtn
            ref={confirmRef}
            type="button"
            $variant={variant}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Processando...' : confirmLabel}
          </ConfirmBtn>
        </Actions>
      </Dialog>
    </Overlay>
  );
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: ${({ theme }) => theme.zIndex.modal};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease forwards;
`;

const Dialog = styled.div`
  width: min(420px, 100%);
  padding: 2rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: ${({ theme }) => theme.shadow};
  text-align: center;
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
`;

const IconWrap = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  margin-bottom: 1rem;
  background: ${({ $variant }) =>
    $variant === 'danger' ? 'rgba(223, 83, 83, 0.1)' : 'rgba(212, 162, 63, 0.1)'};
  border: 1px solid ${({ $variant }) =>
    $variant === 'danger' ? 'rgba(223, 83, 83, 0.2)' : 'rgba(212, 162, 63, 0.2)'};
  color: ${({ $variant, theme }) =>
    $variant === 'danger' ? theme.colors.danger : theme.colors.warning};
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.ice};
`;

const Message = styled.p`
  margin: 0.6rem 0 1.5rem;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.9rem;
  line-height: 1.55;
`;

const Actions = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.75rem;
`;

const CancelBtn = styled.button`
  min-height: 2.65rem;
  padding: 0 1.25rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: transparent;
  color: ${({ theme }) => theme.colors.ice};
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.surfaceSoft};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ConfirmBtn = styled.button`
  min-height: 2.65rem;
  padding: 0 1.25rem;
  border-radius: ${({ theme }) => theme.radii.md};
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s ease;

  border: 1px solid ${({ $variant }) =>
    $variant === 'danger' ? 'rgba(223, 83, 83, 0.35)' : 'rgba(212, 162, 63, 0.35)'};
  background: ${({ $variant }) =>
    $variant === 'danger' ? 'rgba(223, 83, 83, 0.12)' : 'rgba(212, 162, 63, 0.12)'};
  color: ${({ $variant, theme }) =>
    $variant === 'danger' ? theme.colors.danger : theme.colors.warning};

  &:hover:not(:disabled) {
    background: ${({ $variant }) =>
      $variant === 'danger' ? 'rgba(223, 83, 83, 0.2)' : 'rgba(212, 162, 63, 0.2)'};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
