import { useState } from 'react';
import styled from 'styled-components';
import { LockKeyhole, LogOut, X } from 'lucide-react';
import { Button } from '../../../components/common/Button.jsx';
import { Input } from './InfantilLayout.js';

export function CheckoutConfirmationModal({ child, isSubmitting = false, onClose, onConfirm }) {
  const [securityCode, setSecurityCode] = useState('');

  if (!child) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (securityCode.trim().length < 4 || isSubmitting) return;

    await onConfirm(child, securityCode.trim().toUpperCase());
  };

  return (
    <Overlay>
      <Modal role="dialog" aria-modal="true" aria-labelledby="checkout-title">
        <Header>
          <IconBox><LockKeyhole size={20} /></IconBox>
          <div>
            <h2 id="checkout-title">Conferir retirada</h2>
            <p>{child.name}</p>
          </div>
          <CloseButton type="button" onClick={onClose} aria-label="Fechar">
            <X size={18} />
          </CloseButton>
        </Header>

        <Details>
          <span>Sala: {child.room}</span>
          {child.guardianName && <span>Responsavel: {child.guardianName}</span>}
        </Details>

        <form onSubmit={handleSubmit}>
          <Field>
            <span>Codigo do ticket</span>
            <Input
              autoFocus
              maxLength={6}
              placeholder="Ex: A102"
              value={securityCode}
              onChange={(event) => setSecurityCode(event.target.value.toUpperCase())}
              disabled={isSubmitting}
            />
          </Field>
          <Actions>
            <SecondaryButton type="button" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </SecondaryButton>
            <Button type="submit" disabled={securityCode.trim().length < 4 || isSubmitting}>
              <LogOut size={18} /> Liberar
            </Button>
          </Actions>
        </form>
      </Modal>
    </Overlay>
  );
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 2100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.72);
`;

const Modal = styled.div`
  width: min(440px, 100%);
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 1.5rem;
  box-shadow: ${({ theme }) => theme.shadow};
`;

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;

  h2 {
    margin: 0;
    color: ${({ theme }) => theme.colors.ice};
    font-size: 1.2rem;
  }

  p {
    margin: 0.25rem 0 0;
    color: ${({ theme }) => theme.colors.muted};
  }
`;

const IconBox = styled.div`
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.surfaceSoft};
  color: ${({ theme }) => theme.colors.gold};
`;

const CloseButton = styled.button`
  margin-left: auto;
  display: grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: transparent;
  color: ${({ theme }) => theme.colors.muted};

  &:hover {
    color: ${({ theme }) => theme.colors.ice};
    border-color: ${({ theme }) => theme.colors.gold};
  }
`;

const Details = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.85rem 1rem;
  margin-bottom: 1rem;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.surfaceSoft};
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.9rem;
`;

const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  span {
    color: ${({ theme }) => theme.colors.muted};
    font-size: 0.85rem;
    font-weight: 700;
  }
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.25rem;
`;

const SecondaryButton = styled.button`
  min-height: 2.85rem;
  padding: 0 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: transparent;
  color: ${({ theme }) => theme.colors.muted};
  font-weight: 700;

  &:hover:not(:disabled) {
    color: ${({ theme }) => theme.colors.ice};
    border-color: ${({ theme }) => theme.colors.gold};
  }
`;
