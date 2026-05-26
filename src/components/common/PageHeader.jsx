import styled from 'styled-components';
import { theme } from '../../styles/theme.js';

export function PageHeader({ eyebrow, title, description }) {
  return (
    <HeaderBlock>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </HeaderBlock>
  );
}

const HeaderBlock = styled.div`
  margin-bottom: 1.35rem;

  h1 {
    margin: 0;
    font-size: clamp(1.8rem, 3vw, 2.7rem);
    letter-spacing: 0;
  }

  p {
    max-width: 42rem;
    margin: 0.6rem 0 0;
    color: ${theme.colors.muted};
    line-height: 1.6;
  }
`;

const Eyebrow = styled.span`
  display: block;
  margin-bottom: 0.35rem;
  color: ${theme.colors.wineLight};
  font-size: 0.76rem;
  font-weight: 800;
  text-transform: uppercase;
`;
