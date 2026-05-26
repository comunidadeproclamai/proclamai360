import styled from 'styled-components';
import { theme } from '../../styles/theme.js';

export function EmptyState({ title, description }) {
  return (
    <Box>
      <strong>{title}</strong>
      <p>{description}</p>
    </Box>
  );
}

const Box = styled.section`
  padding: 1.25rem;
  border: 1px dashed ${theme.colors.border};
  border-radius: ${theme.radii.md};
  background: rgba(30, 27, 27, 0.74);

  strong {
    display: block;
  }

  p {
    margin: 0.45rem 0 0;
    color: ${theme.colors.muted};
    line-height: 1.55;
  }
`;
