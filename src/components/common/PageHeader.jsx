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
  margin-bottom: 2.25rem;

  h1 {
    margin: 0;
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(1.8rem, 3vw, 2.6rem);
    font-weight: 700;
    color: ${theme.colors.ice};
    letter-spacing: -0.02em;
  }

  p {
    max-width: 44rem;
    margin: 0.65rem 0 0;
    color: ${theme.colors.muted};
    font-size: 1rem;
    line-height: 1.65;
    font-weight: 300;
  }
`;

const Eyebrow = styled.span`
  display: block;
  margin-bottom: 0.5rem;
  color: ${theme.colors.gold};
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
`;

