import styled from 'styled-components';

export function EmptyState({ title, description }) {
  return (
    <Box>
      <strong>{title}</strong>
      <p>{description}</p>
    </Box>
  );
}

const Box = styled.section`
  padding: 1.5rem;
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.surfaceSoft};

  strong {
    display: block;
    color: ${({ theme }) => theme.colors.ice};
    font-weight: 700;
  }

  p {
    margin: 0.45rem 0 0;
    color: ${({ theme }) => theme.colors.muted};
    font-size: 0.9rem;
    line-height: 1.55;
    font-weight: 400;
  }
`;
