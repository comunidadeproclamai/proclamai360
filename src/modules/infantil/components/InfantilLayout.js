import styled from 'styled-components';

export const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

export const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1rem;

  @media (max-width: 720px) {
    align-items: flex-start;
    flex-direction: column;
  }
`;

export const TitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const Title = styled.h1`
  font-size: clamp(1.8rem, 3vw, 2.5rem);
  font-weight: 800;
  margin: 0;
  color: ${({ theme }) => theme.colors.ice};
  text-transform: uppercase;
`;

export const Subtitle = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 1rem;
  font-weight: 400;
`;

export const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr);
  gap: 1.5rem;
  align-items: start;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

export const Panel = styled.section`
  background: ${({ theme }) => theme.colors.surface === '#ffffff' ? 'rgba(255, 255, 255, 0.86)' : 'rgba(28, 22, 23, 0.72)'};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 1.5rem;
  box-shadow: ${({ theme }) => theme.shadow};
`;

export const PanelTitle = styled.h2`
  margin: 0 0 1rem;
  color: ${({ theme }) => theme.colors.ice};
  font-size: 1.05rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1rem;
  align-items: end;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

export const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  grid-column: span ${({ $span = 4 }) => $span};
  min-width: 0;

  @media (max-width: 760px) {
    grid-column: 1;
  }

  span {
    color: ${({ theme }) => theme.colors.muted};
    font-size: 0.85rem;
    font-weight: 700;
  }
`;

export const Input = styled.input`
  min-height: 2.85rem;
  padding: 0 1rem;
  background: ${({ theme }) => theme.colors.surfaceSoft};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.ice};
  font-size: 0.95rem;
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.gold};
    box-shadow: 0 0 0 3px rgba(197, 165, 92, 0.12);
  }
`;

export const MutedText = styled.p`
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.9rem;
  line-height: 1.55;
  margin: 0;
`;
