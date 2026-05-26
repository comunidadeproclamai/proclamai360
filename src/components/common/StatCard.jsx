import styled from 'styled-components';
import { theme } from '../../styles/theme.js';

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
  padding: 1rem;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  background: ${({ $tone }) =>
    $tone === 'wine'
      ? 'linear-gradient(135deg, rgba(138, 31, 61, 0.38), rgba(41, 37, 37, 0.96))'
      : theme.colors.surface};

  span {
    display: block;
    color: ${theme.colors.muted};
    font-size: 0.82rem;
  }

  strong {
    display: block;
    margin-top: 0.8rem;
    font-size: 2rem;
    letter-spacing: 0;
  }

  small {
    display: block;
    margin-top: 0.35rem;
    color: ${theme.colors.mutedDark};
    line-height: 1.45;
  }
`;
