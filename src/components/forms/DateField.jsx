import styled from 'styled-components';

export function DateField({ label, error, ...props }) {
  return (
    <Field>
      {label && <Label>{label}</Label>}
      <StyledInput type="date" {...props} />
      {error && <Error>{error}</Error>}
    </Field>
  );
}

const Field = styled.label`
  display: grid;
  gap: 0.5rem;
  width: 100%;
`;

const Label = styled.span`
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.02em;
`;

const StyledInput = styled.input`
  width: 100%;
  min-height: 2.9rem;
  padding: 0 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.surfaceSoft};
  color: ${({ theme }) => theme.colors.ice};
  font-size: 0.95rem;
  font-family: inherit;
  outline: none;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.03);
  transition: all 0.2s ease;

  &::-webkit-calendar-picker-indicator {
    filter: ${({ theme }) =>
      theme.colors.surface === '#ffffff' ? 'none' : 'invert(0.7) sepia(0.2) hue-rotate(-15deg)'};
    cursor: pointer;
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.gold};
    background: ${({ theme }) => theme.colors.surface};
    box-shadow: 0 0 0 3px rgba(197, 165, 92, 0.12), inset 0 2px 4px rgba(0, 0, 0, 0.03);
  }
`;

const Error = styled.small`
  color: ${({ theme }) => theme.colors.danger};
  font-size: 0.8rem;
  font-weight: 500;
`;
