import { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  CheckCircle2,
  ClipboardList,
  Home,
  KeyRound,
  Moon,
  Palette,
  Settings,
  ShieldCheck,
  Sun,
  UserPlus,
} from 'lucide-react';
import { PageHeader } from '../../../components/common/PageHeader.jsx';
import { Button } from '../../../components/common/Button.jsx';
import { useThemeMode } from '../../../contexts/ThemeModeContext.jsx';
import { apiClient } from '../../../services/apiClient.js';

export function ConfiguracoesPage() {
  const { themeMode, setThemeMode } = useThemeMode();
  const [churchName, setChurchName] = useState('');
  const [address, setAddress] = useState('');
  const [saveStatus, setSaveStatus] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(true);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'member',
  });
  const [resetPasswords, setResetPasswords] = useState({});
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  const loadUsers = async () => {
    try {
      setUsersLoading(true);
      const { data } = await apiClient.get('/users/list');
      setUsers(data.data || []);
      setRoles(data.roles || []);
    } catch (err) {
      console.error('Erro ao buscar usuarios:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  const loadAuditLogs = async () => {
    try {
      setAuditLoading(true);
      const { data } = await apiClient.get('/users/audit');
      setAuditLogs(data.data || []);
    } catch (err) {
      console.error('Erro ao buscar auditoria:', err);
    } finally {
      setAuditLoading(false);
    }
  };

  useEffect(() => {
    async function loadSettings() {
      try {
        const { data } = await apiClient.get('/settings');
        if (data) {
          setChurchName(data.churchName || '');
          setAddress(data.street || '');
        }
      } catch (err) {
        console.error('Erro ao buscar configurações:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  useEffect(() => {
    loadUsers();
    loadAuditLogs();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaveStatus(true);
      await apiClient.post('/settings', {
        churchName,
        street: address
      });
      setTimeout(() => {
        setSaveStatus(false);
      }, 2000);
    } catch (err) {
      console.error('Erro ao salvar preferências:', err);
      alert('Erro ao salvar as configurações: ' + (err.response?.data?.error || err.message));
      setSaveStatus(false);
    }
  };

  const handleRoleChange = async (userId, role) => {
    const previousUsers = users;
    setUsers((currentUsers) =>
      currentUsers.map((user) => (user.id === userId ? { ...user, role } : user)),
    );

    try {
      await apiClient.patch('/users/role', { userId, role });
      await loadAuditLogs();
    } catch (err) {
      setUsers(previousUsers);
      alert('Erro ao atualizar perfil: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();
    try {
      setIsCreatingUser(true);
      await apiClient.post('/users/create', newUser);
      setNewUser({ name: '', email: '', password: '', role: 'member' });
      await Promise.all([loadUsers(), loadAuditLogs()]);
    } catch (err) {
      alert('Erro ao criar usuario: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleResetPassword = async (userId) => {
    const password = resetPasswords[userId] || '';
    if (!password) return;

    try {
      await apiClient.patch('/users/password', { userId, password });
      setResetPasswords((current) => ({ ...current, [userId]: '' }));
      await loadAuditLogs();
    } catch (err) {
      alert('Erro ao redefinir senha: ' + (err.response?.data?.message || err.message));
    }
  };

  const formatDateTime = (value) => {
    return new Date(value).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Sistema"
        title="Configurações"
        description="Gerencie as preferências estéticas, dados institucionais e configurações gerais da plataforma Proclamai 360."
      />

      <SettingsGrid>
        {/* Theme Preferences Card */}
        <SettingsCard>
          <CardHeader>
            <Palette size={20} />
            <h3>Identidade Visual & Tema</h3>
          </CardHeader>
          <CardDescription>
            Escolha a tonalidade do sistema com base na logo. O tema claro utiliza a versão vermelha e o tema escuro utiliza a versão branca com ouro.
          </CardDescription>

          <ThemeOptions>
            {/* Dark Theme Selection Card */}
            <ThemeOptionCard 
              $active={themeMode === 'dark'} 
              onClick={() => setThemeMode('dark')}
              $mode="dark"
            >
              <MiniPreview $mode="dark">
                <MiniLogo src="/logo-dark.png" alt="Proclamai 360" />
                <span className="dot" />
              </MiniPreview>
              <OptionInfo>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Moon size={16} />
                  <strong>Tema Escuro</strong>
                </div>
                <span>Vinho profundo & Ouro sobre Charcoal</span>
              </OptionInfo>
              {themeMode === 'dark' && <ActiveBadge />}
            </ThemeOptionCard>

            {/* Light Theme Selection Card */}
            <ThemeOptionCard 
              $active={themeMode === 'light'} 
              onClick={() => setThemeMode('light')}
              $mode="light"
            >
              <MiniPreview $mode="light">
                <MiniLogo src="/logo-light.png" alt="Proclamai 360" />
                <span className="dot" />
              </MiniPreview>
              <OptionInfo>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sun size={16} />
                  <strong>Tema Claro</strong>
                </div>
                <span>Vinho profundo & Ouro sobre Off-White</span>
              </OptionInfo>
              {themeMode === 'light' && <ActiveBadge />}
            </ThemeOptionCard>
          </ThemeOptions>
        </SettingsCard>

        {/* Institution Data Card */}
        <SettingsCard>
          <CardHeader>
            <Home size={20} />
            <h3>Dados da Igreja</h3>
          </CardHeader>
          <CardDescription>
            Configure as informações públicas da congregação que serão exibidas nos relatórios e nos tickets gerados.
          </CardDescription>

          <Form onSubmit={handleSave}>
            <FormGroup>
              <Label>Nome da Congregação / Ministério</Label>
              <Input 
                type="text" 
                value={churchName} 
                onChange={(e) => setChurchName(e.target.value)}
                placeholder={loading ? 'Carregando...' : 'Ex: Comunidade Proclamai...'}
                disabled={loading}
              />
            </FormGroup>

            <FormGroup>
              <Label>Endereço Sede</Label>
              <Input 
                type="text" 
                value={address} 
                onChange={(e) => setAddress(e.target.value)}
                placeholder={loading ? 'Carregando...' : 'Ex: Avenida Principal, 360...'}
                disabled={loading}
              />
            </FormGroup>

            <ButtonWrapper>
              <Button type="submit" disabled={saveStatus || loading}>
                {saveStatus ? <CheckCircle2 size={16} /> : <Settings size={16} />}
                {saveStatus ? 'Configurações Salvas!' : 'Salvar Preferências'}
              </Button>
            </ButtonWrapper>
          </Form>
        </SettingsCard>

        <SettingsCard>
          <CardHeader>
            <ShieldCheck size={20} />
            <h3>Usuarios & Permissoes</h3>
          </CardHeader>
          <CardDescription>
            Defina o perfil operacional de cada pessoa com acesso a plataforma.
          </CardDescription>

          <CreateUserForm onSubmit={handleCreateUser}>
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
            <UsersEmpty>Carregando usuarios...</UsersEmpty>
          ) : users.length === 0 ? (
            <UsersEmpty>Nenhum usuario cadastrado.</UsersEmpty>
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
                    onChange={(event) => handleRoleChange(user.id, event.target.value)}
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
                      onClick={() => handleResetPassword(user.id)}
                    >
                      <KeyRound size={15} />
                    </IconActionButton>
                  </ResetPasswordGroup>
                </UserRow>
              ))}
            </UsersList>
          )}
        </SettingsCard>

        <SettingsCard>
          <CardHeader>
            <ClipboardList size={20} />
            <h3>Auditoria Recente</h3>
          </CardHeader>
          <CardDescription>
            Acompanhe as ultimas acoes sensiveis realizadas na plataforma.
          </CardDescription>

          {auditLoading ? (
            <UsersEmpty>Carregando auditoria...</UsersEmpty>
          ) : auditLogs.length === 0 ? (
            <UsersEmpty>Nenhum evento registrado.</UsersEmpty>
          ) : (
            <AuditList>
              {auditLogs.map((log) => (
                <AuditRow key={log.id}>
                  <AuditHeader>
                    <strong>{log.action}</strong>
                    <span>{formatDateTime(log.timestamp)}</span>
                  </AuditHeader>
                  <AuditMeta>
                    {log.user?.name || 'Usuario'} - {log.user?.email || 'sem e-mail'}
                  </AuditMeta>
                  <AuditDetails>{JSON.stringify(log.details)}</AuditDetails>
                </AuditRow>
              ))}
            </AuditList>
          )}
        </SettingsCard>
      </SettingsGrid>
    </PageContainer>
  );
}

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const SettingsGrid = styled.section`
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 1.5rem;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

const SettingsCard = styled.article`
  padding: 1.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.surface === '#ffffff' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(28, 22, 23, 0.75)'};
  backdrop-filter: blur(10px);
  box-shadow: ${({ theme }) => theme.shadow};
  display: flex;
  flex-direction: column;
`;

const CardHeader = styled.div`
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

const CardDescription = styled.p`
  margin: 0 0 1.5rem 0;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.875rem;
  line-height: 1.6;
  font-weight: 400;
`;

const ThemeOptions = styled.div`
  display: grid;
  gap: 1rem;
`;

const ThemeOptionCard = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid ${({ $active, theme }) => $active ? theme.colors.gold : theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.surfaceSoft};
  cursor: pointer;
  position: relative;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    border-color: ${({ $active, theme }) => $active ? theme.colors.gold : 'rgba(197, 165, 92, 0.3)'};
    transform: translateY(-2px);
  }
`;

const MiniPreview = styled.div`
  width: 90px;
  height: 55px;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ $mode }) => $mode === 'dark' ? '#120e0f' : '#FAF8F5'};
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 0.25rem;

  .dot {
    position: absolute;
    bottom: 2px;
    right: 2px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #c5a55c;
  }
`;

const MiniLogo = styled.img`
  width: 100%;
  height: auto;
  object-fit: contain;
`;

const OptionInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  flex: 1;

  strong {
    font-size: 0.95rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.ice};
  }

  span {
    font-size: 0.78rem;
    color: ${({ theme }) => theme.colors.muted};
    font-weight: 400;
  }
`;

const ActiveBadge = styled.div`
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.gold};
  box-shadow: 0 0 10px ${({ theme }) => theme.colors.gold};
`;

const Form = styled.form`
  display: grid;
  gap: 1.25rem;
`;

const FormGroup = styled.div`
  display: grid;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.muted};
  font-weight: 600;
`;

const Input = styled.input`
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

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 0.5rem;
`;

const UsersList = styled.div`
  display: grid;
  gap: 0.75rem;
`;

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

const RoleSelect = styled.select`
  min-height: 2.45rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.ice};
  padding: 0 0.75rem;
  outline: none;
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

const UsersEmpty = styled.div`
  padding: 1.5rem;
  text-align: center;
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.muted};
`;

const AuditList = styled.div`
  display: grid;
  gap: 0.75rem;
  max-height: 28rem;
  overflow: auto;
  padding-right: 0.25rem;
`;

const AuditRow = styled.div`
  display: grid;
  gap: 0.35rem;
  padding: 0.85rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.surfaceSoft};
`;

const AuditHeader = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;

  strong {
    color: ${({ theme }) => theme.colors.ice};
    font-size: 0.9rem;
  }

  span {
    color: ${({ theme }) => theme.colors.muted};
    font-size: 0.75rem;
    white-space: nowrap;
  }
`;

const AuditMeta = styled.span`
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.78rem;
`;

const AuditDetails = styled.code`
  color: ${({ theme }) => theme.colors.mutedDark};
  font-size: 0.72rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
