import styled from 'styled-components';
import { AlertTriangle } from 'lucide-react';

const AvatarWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const Circle = styled.div`
  width: ${({ $size }) => $size || '48px'};
  height: ${({ $size }) => $size || '48px'};
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.surfaceSoft};
  border: 2px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.ice};
  font-weight: 700;
  font-size: ${({ $size }) => $size ? '1.1rem' : '0.9rem'};
  letter-spacing: 1px;
`;

const AllergyBadge = styled.div`
  position: absolute;
  top: -4px;
  right: -4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.danger};
  border: 2px solid ${({ theme }) => theme.colors.surface};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  animation: pulse 2s infinite;

  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.15); }
    100% { transform: scale(1); }
  }
`;

export function KidAvatar({ name, hasAllergies, size }) {
  const getInitials = (n) => {
    if (!n) return '??';
    const parts = n.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return n.substring(0, 2).toUpperCase();
  };

  return (
    <AvatarWrapper title={hasAllergies ? 'ATENÇÃO: Possui Alergias/Restrições' : ''}>
      <Circle $size={size}>
        {getInitials(name)}
      </Circle>
      {hasAllergies && (
        <AllergyBadge>
          <AlertTriangle size={12} strokeWidth={3} />
        </AllergyBadge>
      )}
    </AvatarWrapper>
  );
}
