import styled from 'styled-components';
import { theme } from '../../styles/theme.js';

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
  color: ${theme.colors.ice};
  width: 100%;

  span {
    color: ${theme.colors.muted};
    font-size: 0.85rem;
    font-weight: 600;
    letter-spacing: 0.02em;
  }

  input {
    width: 100%;
    min-height: 2.9rem;
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.radii.md};
    background: rgba(18, 14, 15, 0.6);
    color: ${theme.colors.ice};
    padding: 0 1rem;
    outline: none;
    font-size: 0.95rem;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.12);
    transition: all 0.2s ease;

    &::placeholder {
      color: rgba(255, 255, 255, 0.25);
    }
  }

  input:focus {
    border-color: ${theme.colors.gold};
    background: rgba(18, 14, 15, 0.8);
    box-shadow: 0 0 0 3px rgba(197, 165, 92, 0.12), inset 0 2px 4px rgba(0, 0, 0, 0.12);
  }

  small {
    color: ${theme.colors.danger};
    font-size: 0.8rem;
    margin-top: 0.2rem;
  }
`;

