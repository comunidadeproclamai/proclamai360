import styled from 'styled-components';

export function TextArea({ label, error, maxLength, value, ...props }) {
  const charCount = value?.length || 0;

  return (
    <Field>
      {label && (
        <LabelRow>
          <Label>{label}</Label>
          {maxLength && (
            <Counter $near={charCount > maxLength * 0.9}>
              {charCount}/{maxLength}
            </Counter>
          )}
        </LabelRow>
      )}
      <StyledTextArea value={value} maxLength={maxLength} {...props} />
      {error && <Error>{error}</Error>}
    </Field>
  );
}

const Field = styled.label`
  display: grid;
  gap: 0.5rem;
  width: 100%;
`;

const LabelRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
`;

const Label = styled.span`
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.02em;
`;

const Counter = styled.span`
  font-size: 0.72rem;
  font-weight: 600;
  color: ${({ $near, theme }) => ($near ? theme.colors.warning : theme.colors.mutedDark)};
  transition: color 0.2s ease;
`;

const StyledTextArea = styled.textarea`
  width: 100%;
  min-height: 5rem;
  padding: 0.75rem 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.surfaceSoft};
  color: ${({ theme }) => theme.colors.ice};
  font-size: 0.95rem;
  font-family: inherit;
  outline: none;
  resize: vertical;
  line-height: 1.55;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.03);
  transition: all 0.2s ease;

  &::placeholder {
    color: ${({ theme }) => theme.colors.mutedDark};
    opacity: 0.6;
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
