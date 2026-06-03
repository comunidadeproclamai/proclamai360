import styled from 'styled-components';

export function FormRow({ cols = 2, children }) {
  return <Row $cols={cols}>{children}</Row>;
}

const Row = styled.div`
  display: grid;
  grid-template-columns: repeat(${({ $cols }) => $cols}, minmax(0, 1fr));
  gap: 1rem;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;
