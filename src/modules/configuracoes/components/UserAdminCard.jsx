import styled from 'styled-components';
import { KeyRound, ShieldCheck, UserPlus } from 'lucide-react';
import {
  CardDescription,
  CardHeader,
  EmptyMessage,
  FormGroup,
  Input,
  Label,
  RoleSelect,
  SettingsCard,
} from './ConfiguracoesLayout.js';

export function UserAdminCard({
  users,
  roles,
  usersLoading,
  newUser,
  setNewUser,
  resetPasswords,
  setResetPasswords,
  isCreatingUser,
  onCreateUser,
  onChangeUserRole,
  onResetPassword,
}) {
  return (
    <SettingsCard>
      <CardHeader>
        <ShieldCheck size={20} />
        <h3>Usuarios & Permissoes</h3>
      </CardHeader>
      <CardDescription>
        Defina o perfil operacional de cada pessoa com acesso a plataforma.
      </CardDescription>

      <CreateUserForm onSubmit={onCreateUser}>
        <FormGroup>
          <Label>Nome</Label>
          <Input
            value={newUser.name}
            onChange={(event) => setNewUser({ ...newUser, name: event.target.value })}
            placeholder="Nome do usuario"
            required
          />
        </FormGroup>
        <FormGroup>
          <Label>E-mail</Label>
          <Input
            type="email"
            value={newUser.email}
            onChange={(event) => setNewUser({ ...newUser, email: event.target.value })}
            placeholder="email@dominio.com"
            required
          />
        </FormGroup>
        <FormGroup>
          <Label>Senha inicial</Label>
          <Input
            type="password"
            value={newUser.password}
            onChange={(event) => setNewUser({ ...newUser, password: event.target.value })}
            placeholder="Minimo 8 caracteres"
            required
          />
        </FormGroup>
        <FormGroup>
          <Label>Perfil</Label>
          <RoleSelect
            value={newUser.role}
            onChange={(event) => setNewUser({ ...newUser, role: event.target.value })}
          >
            {roles.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </RoleSelect>
        </FormGroup>
        <CreateUserButton type="submit" disabled={isCreatingUser}>
          <UserPlus size={16} />
          {isCreatingUser ? 'Criando...' : 'Criar usuario'}
        </CreateUserButton>
      </CreateUserForm>

      {usersLoading ? (
        <EmptyMessage>Carregando usuarios...</EmptyMessage>
      ) : users.length === 0 ? (
        <EmptyMessage>Nenhum usuario cadastrado.</EmptyMessage>
      ) : (
        <UsersList>
          {users.map((user) => (
            <UserRow key={user.id}>
              <UserInfo>
                <strong>{user.name}</strong>
                <span>{user.email}</span>
              </UserInfo>
              <RoleSelect
                value={user.role}
                onChange={(event) => onChangeUserRole(user.id, event.target.value)}
              >
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </RoleSelect>
              <ResetPasswordGroup>
                <PasswordInput
                  type="password"
                  value={resetPasswords[user.id] || ''}
                  onChange={(event) =>
                    setResetPasswords((current) => ({
                      ...current,
                      [user.id]: event.target.value,
                    }))
                  }
                  placeholder="Nova senha"
                />
                <IconActionButton
                  type="button"
                  title="Redefinir senha"
                  disabled={!resetPasswords[user.id]}
                  onClick={() => onResetPassword(user.id)}
                >
                  <KeyRound size={15} />
                </IconActionButton>
              </ResetPasswordGroup>
            </UserRow>
          ))}
        </UsersList>
      )}
    </SettingsCard>
  );
}

const CreateUserForm = styled.form`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
  margin-bottom: 1.25rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

const CreateUserButton = styled.button`
  min-height: 2.85rem;
  align-self: end;
  border: 1px solid rgba(197, 165, 92, 0.2);
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.wine};
  color: white;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

const UsersList = styled.div`
  display: grid;
  gap: 0.75rem;
`;

const UserRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 11rem 14rem;
  gap: 1rem;
  align-items: center;
  padding: 0.85rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.surfaceSoft};

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const UserInfo = styled.div`
  display: grid;
  gap: 0.15rem;
  min-width: 0;

  strong {
    color: ${({ theme }) => theme.colors.ice};
    font-size: 0.92rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  span {
    color: ${({ theme }) => theme.colors.muted};
    font-size: 0.78rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const ResetPasswordGroup = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 2.45rem;
  gap: 0.5rem;
`;

const PasswordInput = styled.input`
  min-height: 2.45rem;
  min-width: 0;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.ice};
  padding: 0 0.75rem;
  outline: none;
`;

const IconActionButton = styled.button`
  min-height: 2.45rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.gold};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
`;
