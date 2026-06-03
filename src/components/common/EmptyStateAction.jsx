import styled from 'styled-components';

export function EmptyStateAction({ icon: Icon, title, description, actionLabel, onAction }) {
  return (
    <Container>
      {Icon && (
        <IconWrap>
          <Icon size={32} />
        </IconWrap>
      )}
      <Title>{title}</Title>
      {description && <Description>{description}</Description>}
      {actionLabel && onAction && (
        <ActionBtn type="button" onClick={onAction}>
          {actionLabel}
        </ActionBtn>
      )}
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 3.5rem 2rem;
  animation: fadeIn 0.4s ease forwards;
`;

const IconWrap = styled.div`
  display: grid;
  place-items: center;
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.wineGlow};
  border: 1px solid rgba(127, 18, 44, 0.15);
  color: ${({ theme }) => theme.colors.gold};
  margin-bottom: 1.25rem;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.ice};
`;

const Description = styled.p`
  margin: 0.5rem 0 0;
  max-width: 24rem;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.muted};
  line-height: 1.55;
`;

const ActionBtn = styled.button`
  margin-top: 1.25rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 2.65rem;
  padding: 0 1.25rem;
  border: 1px solid rgba(197, 165, 92, 0.15);
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.wine};
  color: #fcfaf7;
  font-weight: 600;
  font-size: 0.9rem;
  box-shadow: 0 4px 15px rgba(92, 6, 30, 0.25);
  transition: all 250ms cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    background: ${({ theme }) => theme.colors.wineLight};
    box-shadow: 0 6px 20px rgba(127, 18, 44, 0.4);
    transform: translateY(-2px);
  }
`;
