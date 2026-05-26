import styled from 'styled-components';
import { theme } from '../../styles/theme.js';

export function TextField({ label, error, ...props }) {
  return (
    <Field>
      <span>{label}</span>
      <input {...props} />
      {error && <small>{error}</small>}
    </Field>
  );
}

const Field = styled.label`
  display: grid;
  gap: 0.45rem;
  color: ${theme.colors.ice};

  span {
    color: ${theme.colors.muted};
    font-size: 0.85rem;
    font-weight: 700;
  }

  input {
    width: 100%;
    min-height: 2.9rem;
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.radii.md};
    background: ${theme.colors.charcoal};
    color: ${theme.colors.ice};
    padding: 0 0.9rem;
    outline: none;
  }

  input:focus {
    border-color: ${theme.colors.wineLight};
  }

  small {
    color: ${theme.colors.danger};
  }
`;
