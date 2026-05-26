import styled from 'styled-components';

export function TextField({ label, error, ...props }) {
  return (
    <Field>
      {label && <span>{label}</span>}
      <input {...props} />
      {error && <small>{error}</small>}
    </Field>
  );
}

const Field = styled.label`
  display: grid;
  gap: 0.5rem;
  color: ${({ theme }) => theme.colors.ice};
  width: 100%;

  span {
    color: ${({ theme }) => theme.colors.muted};
    font-size: 0.85rem;
    font-weight: 600;
    letter-spacing: 0.02em;
  }

  input {
    width: 100%;
    min-height: 2.9rem;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radii.md};
    background: ${({ theme }) => theme.colors.surfaceSoft};
    color: ${({ theme }) => theme.colors.ice};
    padding: 0 1rem;
    outline: none;
    font-size: 0.95rem;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.03);
    transition: all 0.2s ease;

    &::placeholder {
      color: ${({ theme }) => theme.colors.mutedDark};
      opacity: 0.6;
    }
  }

  input:focus {
    border-color: ${({ theme }) => theme.colors.gold};
    background: ${({ theme }) => theme.colors.surface};
    box-shadow: 0 0 0 3px rgba(197, 165, 92, 0.12), inset 0 2px 4px rgba(0, 0, 0, 0.03);
  }

  small {
    color: ${({ theme }) => theme.colors.danger};
    font-size: 0.8rem;
    margin-top: 0.2rem;
    font-weight: 500;
  }
`;
