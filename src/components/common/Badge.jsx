import styled from 'styled-components';

const variantStyles = {
  success: { bg: 'rgba(60, 168, 118, 0.08)', border: 'rgba(60, 168, 118, 0.2)', color: 'success' },
  warning: { bg: 'rgba(212, 162, 63, 0.08)', border: 'rgba(212, 162, 63, 0.2)', color: 'warning' },
  danger:  { bg: 'rgba(223, 83, 83, 0.08)', border: 'rgba(223, 83, 83, 0.2)', color: 'danger' },
  neutral: { bg: 'rgba(255, 255, 255, 0.05)', border: 'rgba(255, 255, 255, 0.1)', color: 'muted' },
  info:    { bg: 'rgba(91, 155, 245, 0.08)', border: 'rgba(91, 155, 245, 0.2)', color: 'info' },
  gold:    { bg: 'rgba(197, 165, 92, 0.08)', border: 'rgba(197, 165, 92, 0.2)', color: 'gold' },
};

export function Badge({ variant = 'neutral', size = 'md', children }) {
  return (
    <Wrapper $variant={variant} $size={size}>
      {children}
    </Wrapper>
  );
}

const Wrapper = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: ${({ $size }) => ($size === 'sm' ? '0.2rem 0.6rem' : '0.3rem 0.85rem')};
  border-radius: 9999px;
  font-size: ${({ $size }) => ($size === 'sm' ? '0.65rem' : '0.72rem')};
  font-weight: 700;
  letter-spacing: 0.03em;
  white-space: nowrap;
  background: ${({ $variant }) => variantStyles[$variant]?.bg || variantStyles.neutral.bg};
  border: 1px solid ${({ $variant }) => variantStyles[$variant]?.border || variantStyles.neutral.border};
  color: ${({ $variant, theme }) => theme.colors[variantStyles[$variant]?.color || 'muted']};
  transition: all 0.2s ease;
`;
