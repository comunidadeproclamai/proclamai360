import styled from 'styled-components';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

export function InfantilNotice({ notice, onClose }) {
  if (!notice) return null;

  const Icon = notice.type === 'success' ? CheckCircle2 : AlertCircle;

  return (
    <Notice $type={notice.type}>
      <Icon size={18} />
      <span>{notice.message}</span>
      <button type="button" onClick={onClose} aria-label="Fechar aviso">
        <X size={16} />
      </button>
    </Notice>
  );
}

const Notice = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.9rem 1rem;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ $type, theme }) => ($type === 'success' ? 'rgba(60, 168, 118, 0.38)' : 'rgba(223, 83, 83, 0.38)')};
  background: ${({ $type }) => ($type === 'success' ? 'rgba(60, 168, 118, 0.12)' : 'rgba(223, 83, 83, 0.12)')};
  color: ${({ $type, theme }) => ($type === 'success' ? theme.colors.success : theme.colors.danger)};
  font-weight: 700;

  span {
    flex: 1;
  }

  button {
    display: grid;
    place-items: center;
    width: 1.9rem;
    height: 1.9rem;
    border: 0;
    border-radius: ${({ theme }) => theme.radii.sm};
    background: transparent;
    color: inherit;
  }
`;
