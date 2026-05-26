import styled from 'styled-components';

export function LoadingState({ label = 'Carregando...' }) {
  return <Box>{label}</Box>;
}

const Box = styled.div`
  display: grid;
  place-items: center;
  min-height: 100vh;
  color: ${({ theme }) => theme.colors.muted};
  background: ${({ theme }) => theme.colors.charcoal};
  font-family: inherit;
  font-weight: 500;
`;
