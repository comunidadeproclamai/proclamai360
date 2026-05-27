import { PageHeader } from '../../../components/common/PageHeader.jsx';
import { useThemeMode } from '../../../contexts/ThemeModeContext.jsx';
import { AuditLogCard } from '../components/AuditLogCard.jsx';
import { ChurchSettingsCard } from '../components/ChurchSettingsCard.jsx';
import { PageContainer, SettingsGrid } from '../components/ConfiguracoesLayout.js';
import { ThemeSettingsCard } from '../components/ThemeSettingsCard.jsx';
import { UserAdminCard } from '../components/UserAdminCard.jsx';
import { useConfiguracoesAdmin } from '../hooks/useConfiguracoesAdmin.js';

export function ConfiguracoesPage() {
  const { themeMode, setThemeMode } = useThemeMode();
  const { settings, users, audit } = useConfiguracoesAdmin();

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Sistema"
        title="Configuracoes"
        description="Gerencie preferencias visuais, dados institucionais, usuarios, permissoes e auditoria da plataforma."
      />

      <SettingsGrid>
        <ThemeSettingsCard themeMode={themeMode} onThemeChange={setThemeMode} />

        <ChurchSettingsCard
          churchName={settings.churchName}
          setChurchName={settings.setChurchName}
          address={settings.address}
          setAddress={settings.setAddress}
          loading={settings.loading}
          saveStatus={settings.saveStatus}
          onSave={settings.saveChurchSettings}
        />

        <UserAdminCard
          users={users.users}
          roles={users.roles}
          usersLoading={users.usersLoading}
          newUser={users.newUser}
          setNewUser={users.setNewUser}
          resetPasswords={users.resetPasswords}
          setResetPasswords={users.setResetPasswords}
          isCreatingUser={users.isCreatingUser}
          onCreateUser={users.submitNewUser}
          onChangeUserRole={users.changeUserRole}
          onResetPassword={users.submitPasswordReset}
        />

        <AuditLogCard auditLogs={audit.auditLogs} auditLoading={audit.auditLoading} />
      </SettingsGrid>
    </PageContainer>
  );
}
