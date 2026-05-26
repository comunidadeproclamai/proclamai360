import styled from 'styled-components';

export const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  min-height: 2.85rem;
  padding: 0 1.5rem;
  border: 1px solid rgba(197, 165, 92, 0.15);
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.wine};
  color: #fcfaf7;
  font-weight: 600;
  font-size: 0.95rem;
  box-shadow: 0 4px 15px rgba(92, 6, 30, 0.25);
  transition: all 250ms cubic-bezier(0.16, 1, 0.3, 1);
  letter-spacing: 0.01em;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.wineLight};
    box-shadow: 0 6px 20px rgba(127, 18, 44, 0.4);
    border-color: rgba(197, 165, 92, 0.3);
    transform: translateY(-2px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 2px 10px rgba(127, 18, 44, 0.3);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
    box-shadow: none;
  }
`;
