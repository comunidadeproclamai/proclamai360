import styled from 'styled-components';
import { theme } from '../../styles/theme.js';

export function LoadingState({ label = 'Carregando...' }) {
  return <Box>{label}</Box>;
}

const Box = styled.div`
  display: grid;
  place-items: center;
  min-height: 100vh;
  color: ${theme.colors.muted};
  background: ${theme.colors.charcoal};
`;
