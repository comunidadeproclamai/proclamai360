import styled from 'styled-components';

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
    font-size: clamp(1.8rem, 3vw, 2.5rem);
    font-weight: 800;
    color: ${({ theme }) => theme.colors.ice};
    letter-spacing: -0.02em;
    text-transform: uppercase;
  }

  p {
    max-width: 44rem;
    margin: 0.65rem 0 0;
    color: ${({ theme }) => theme.colors.muted};
    font-size: 1rem;
    line-height: 1.65;
    font-weight: 400;
  }
`;

const Eyebrow = styled.span`
  display: block;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.gold};
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
`;
