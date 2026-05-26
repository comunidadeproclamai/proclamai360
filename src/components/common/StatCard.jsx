import styled from 'styled-components';

export function StatCard({ label, value, detail, tone = 'neutral' }) {
  return (
    <Card $tone={tone}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </Card>
  );
}

const Card = styled.article`
  min-height: 8.5rem;
  padding: 1.25rem 1.5rem;
  border: 1px solid ${({ theme }) => theme.colors.surface === '#ffffff' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.04)'};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ $tone, theme }) =>
    $tone === 'wine'
      ? `linear-gradient(135deg, rgba(92, 6, 30, 0.45) 0%, ${theme.colors.surface} 100%)`
      : theme.colors.surface === '#ffffff' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(28, 22, 23, 0.7)'};
  backdrop-filter: blur(10px);
  box-shadow: ${({ theme }) => theme.shadow};
  transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: transparent;
    transition: background 0.3s ease;
  }

  span {
    display: block;
    color: ${({ theme }) => theme.colors.muted};
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  strong {
    display: block;
    margin-top: 0.8rem;
    font-size: 2.25rem;
    font-weight: 800;
    color: ${({ $tone, theme }) => $tone === 'wine' ? theme.colors.wine : theme.colors.gold};
    letter-spacing: -0.02em;
  }

  small {
    display: block;
    margin-top: 0.45rem;
    color: ${({ theme }) => theme.colors.mutedDark};
    font-size: 0.8rem;
    line-height: 1.5;
    font-weight: 500;
  }

  &:hover {
    transform: translateY(-4px);
    border-color: rgba(197, 165, 92, 0.3);
    box-shadow: ${({ theme }) => theme.shadow}, 0 0 15px rgba(197, 165, 92, 0.1);

    &::after {
      background: ${({ theme }) => theme.colors.goldGradient};
    }
  }
`;
