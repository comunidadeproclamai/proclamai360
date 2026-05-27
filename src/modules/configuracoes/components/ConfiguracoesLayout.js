import styled from 'styled-components';

export const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

export const SettingsGrid = styled.section`
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 1.5rem;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

export const SettingsCard = styled.article`
  padding: 1.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) =>
    theme.colors.surface === '#ffffff' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(28, 22, 23, 0.75)'};
  backdrop-filter: blur(10px);
  box-shadow: ${({ theme }) => theme.shadow};
  display: flex;
  flex-direction: column;
`;

export const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;

  svg {
    color: ${({ theme }) => theme.colors.gold};
  }

  h3 {
    margin: 0;
    font-size: 1.15rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.ice};
    letter-spacing: -0.01em;
  }
`;

export const CardDescription = styled.p`
  margin: 0 0 1.5rem 0;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.875rem;
  line-height: 1.6;
  font-weight: 400;
`;

export const FormGroup = styled.div`
  display: grid;
  gap: 0.5rem;
`;

export const Label = styled.label`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.muted};
  font-weight: 600;
`;

export const Input = styled.input`
  width: 100%;
  min-height: 2.85rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.surfaceSoft};
  color: ${({ theme }) => theme.colors.ice};
  padding: 0 1rem;
  outline: none;
  font-size: 0.95rem;
  transition: all 0.2s ease;

  &:focus {
    border-color: ${({ theme }) => theme.colors.gold};
    background: ${({ theme }) => theme.colors.surface};
    box-shadow: 0 0 0 3px rgba(197, 165, 92, 0.12);
  }
`;

export const RoleSelect = styled.select`
  min-height: 2.45rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.ice};
  padding: 0 0.75rem;
  outline: none;
`;

export const EmptyMessage = styled.div`
  padding: 1.5rem;
  text-align: center;
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.muted};
`;
