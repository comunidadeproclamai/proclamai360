import styled from 'styled-components';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const colorMap = {
  success: { bg: 'rgba(60, 168, 118, 0.12)', border: 'rgba(60, 168, 118, 0.35)', icon: '#3ca876' },
  error: { bg: 'rgba(223, 83, 83, 0.12)', border: 'rgba(223, 83, 83, 0.35)', icon: '#df5353' },
  warning: { bg: 'rgba(212, 162, 63, 0.12)', border: 'rgba(212, 162, 63, 0.35)', icon: '#d4a23f' },
  info: { bg: 'rgba(91, 155, 245, 0.12)', border: 'rgba(91, 155, 245, 0.35)', icon: '#5b9bf5' },
};

export function Toast({ type = 'info', message, duration = 4000, onClose }) {
  const Icon = iconMap[type] || Info;
  const colors = colorMap[type] || colorMap.info;

  return (
    <Wrapper $bg={colors.bg} $border={colors.border}>
      <IconWrap $color={colors.icon}>
        <Icon size={18} />
      </IconWrap>

      <Message>{message}</Message>

      <CloseBtn type="button" onClick={onClose} aria-label="Fechar notificação">
        <X size={14} />
      </CloseBtn>

      {duration > 0 && (
        <ProgressBar $color={colors.icon} $duration={duration} />
      )}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ $border }) => $border};
  background: ${({ $bg }) => $bg};
  backdrop-filter: blur(16px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
  pointer-events: all;
  overflow: hidden;
  animation: slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  min-width: 280px;
`;

const IconWrap = styled.div`
  flex-shrink: 0;
  color: ${({ $color }) => $color};
  margin-top: 1px;
`;

const Message = styled.span`
  flex: 1;
  font-size: 0.88rem;
  font-weight: 600;
  line-height: 1.45;
  color: ${({ theme }) => theme.colors.ice};
`;

const CloseBtn = styled.button`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background: transparent;
  color: ${({ theme }) => theme.colors.muted};
  transition: all 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    color: ${({ theme }) => theme.colors.ice};
  }
`;

const ProgressBar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background: ${({ $color }) => $color};
  animation: progressShrink ${({ $duration }) => $duration}ms linear forwards;
  border-radius: 0 0 0 ${({ theme }) => theme.radii.md};
`;
