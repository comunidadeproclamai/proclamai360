import styled from 'styled-components';
import { theme } from '../../styles/theme.js';

export const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 2.85rem;
  padding: 0 1rem;
  border: 0;
  border-radius: ${theme.radii.md};
  background: ${theme.colors.wine};
  color: ${theme.colors.ice};
  font-weight: 700;

  &:hover {
    background: ${theme.colors.wineLight};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
`;
