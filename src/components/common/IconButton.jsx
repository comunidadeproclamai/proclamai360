import styled from 'styled-components';
import { theme } from '../../styles/theme.js';

export const IconButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.35rem;
  height: 2.35rem;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  background: ${theme.colors.surface};
  color: ${theme.colors.ice};

  &:hover {
    border-color: ${theme.colors.wineLight};
  }
`;
