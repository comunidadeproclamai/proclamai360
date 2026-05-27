import { useEffect, useState } from 'react';
import * as configuracoesService from '../services/configuracoesService.js';

const EMPTY_USER_FORM = {
  name: '',
  email: '',
  password: '',
  role: 'member',
};

export function useConfiguracoesAdmin() {
  const [churchName, setChurchName] = useState('');
  const [address, setAddress] = useState('');
  const [saveStatus, setSaveStatus] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(true);
  const [newUser, setNewUser] = useState(EMPTY_USER_FORM);
  const [resetPasswords, setResetPasswords] = useState({});
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  async function loadSettings() {
    try {
      setLoading(true);
      const data = await configuracoesService.getSettings();
      setChurchName(data?.churchName || '');
      setAddress(data?.street || '');
    } catch (err) {
      console.error('Erro ao buscar configuracoes:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadUsers() {
    try {
      setUsersLoading(true);
      const data = await configuracoesService.listUsers();
      setUsers(data.data || []);
      setRoles(data.roles || []);
    } catch (err) {
      console.error('Erro ao buscar usuarios:', err);
    } finally {
      setUsersLoading(false);
    }
  }

  async function loadAuditLogs() {
    try {
      setAuditLoading(true);
      const data = await configuracoesService.listAuditLogs();
      setAuditLogs(data.data || []);
    } catch (err) {
      console.error('Erro ao buscar auditoria:', err);
    } finally {
      setAuditLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
    loadUsers();
    loadAuditLogs();
  }, []);

  async function saveChurchSettings(event) {
    event.preventDefault();
    try {
      setSaveStatus(true);
      await configuracoesService.saveSettings({
        churchName,
        street: address,
      });
      setTimeout(() => setSaveStatus(false), 2000);
    } catch (err) {
      console.error('Erro ao salvar preferencias:', err);
      alert('Erro ao salvar as configuracoes: ' + (err.response?.data?.error || err.message));
      setSaveStatus(false);
    }
  }

  async function changeUserRole(userId, role) {
    const previousUsers = users;
    setUsers((currentUsers) =>
      currentUsers.map((user) => (user.id === userId ? { ...user, role } : user)),
    );

    try {
      await configuracoesService.updateUserRole(userId, role);
      await loadAuditLogs();
    } catch (err) {
      setUsers(previousUsers);
      alert('Erro ao atualizar perfil: ' + (err.response?.data?.message || err.message));
    }
  }

  async function submitNewUser(event) {
    event.preventDefault();
    try {
      setIsCreatingUser(true);
      await configuracoesService.createUser(newUser);
      setNewUser(EMPTY_USER_FORM);
      await Promise.all([loadUsers(), loadAuditLogs()]);
    } catch (err) {
      alert('Erro ao criar usuario: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsCreatingUser(false);
    }
  }

  async function submitPasswordReset(userId) {
    const password = resetPasswords[userId] || '';
    if (!password) return;

    try {
      await configuracoesService.resetUserPassword(userId, password);
      setResetPasswords((current) => ({ ...current, [userId]: '' }));
      await loadAuditLogs();
    } catch (err) {
      alert('Erro ao redefinir senha: ' + (err.response?.data?.message || err.message));
    }
  }

  return {
    settings: {
      churchName,
      setChurchName,
      address,
      setAddress,
      saveStatus,
      loading,
      saveChurchSettings,
    },
    users: {
      users,
      roles,
      usersLoading,
      newUser,
      setNewUser,
      resetPasswords,
      setResetPasswords,
      isCreatingUser,
      changeUserRole,
      submitNewUser,
      submitPasswordReset,
    },
    audit: {
      auditLogs,
      auditLoading,
    },
  };
}
