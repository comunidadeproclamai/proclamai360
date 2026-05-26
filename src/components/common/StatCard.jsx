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
  padding: 1.25rem 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: ${theme.radii.md};
  background: ${({ $tone }) =>
    $tone === 'wine'
      ? 'linear-gradient(135deg, rgba(92, 6, 30, 0.45) 0%, rgba(28, 22, 23, 0.9) 100%)'
      : 'rgba(28, 22, 23, 0.7)'};
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
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
    background: ${({ $tone }) => $tone === 'wine' ? theme.colors.wineLight : 'transparent'};
    transition: background 0.3s ease;
  }

  span {
    display: block;
    color: ${theme.colors.muted};
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  strong {
    display: block;
    margin-top: 0.8rem;
    font-size: 2.25rem;
    font-weight: 700;
    color: ${({ $tone }) => $tone === 'wine' ? theme.colors.ice : theme.colors.gold};
    letter-spacing: -0.02em;
    font-family: 'Outfit', sans-serif;
  }

  small {
    display: block;
    margin-top: 0.45rem;
    color: ${theme.colors.mutedDark};
    font-size: 0.825rem;
    line-height: 1.5;
  }

  &:hover {
    transform: translateY(-4px);
    border-color: rgba(197, 165, 92, 0.3);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35), 0 0 15px rgba(197, 165, 92, 0.1);

    &::after {
      background: ${theme.colors.goldGradient};
    }
  }
`;

