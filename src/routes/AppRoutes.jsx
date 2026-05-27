import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '../layouts/AppShell.jsx';
import { ProtectedRoute } from '../modules/auth/routes/ProtectedRoute.jsx';
import { LoginPage } from '../modules/auth/pages/LoginPage.jsx';
import { DashboardPage } from '../modules/dashboard/pages/DashboardPage.jsx';
import { MembersPage } from '../modules/members/pages/MembersPage.jsx';
import { InfantilPage } from '../modules/infantil/pages/InfantilPage.jsx';
import { FinanceiroPage } from '../modules/financeiro/pages/FinanceiroPage.jsx';
import { LouvorPage } from '../modules/louvor/pages/LouvorPage.jsx';
import { ConfiguracoesPage } from '../modules/configuracoes/pages/ConfiguracoesPage.jsx';
import { PERMISSIONS } from '../lib/permissions.js';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route element={<ProtectedRoute permission={PERMISSIONS.MEMBERS_READ} />}>
            <Route path="/membros" element={<MembersPage />} />
          </Route>
          <Route element={<ProtectedRoute permission={PERMISSIONS.CHILDREN_READ} />}>
            <Route path="/infantil" element={<InfantilPage />} />
          </Route>
          <Route element={<ProtectedRoute permission={PERMISSIONS.FINANCIAL_READ} />}>
            <Route path="/financeiro" element={<FinanceiroPage />} />
          </Route>
          <Route element={<ProtectedRoute permission={PERMISSIONS.WORSHIP_READ} />}>
            <Route path="/louvor" element={<LouvorPage />} />
          </Route>
          <Route element={<ProtectedRoute permission={PERMISSIONS.SETTINGS_READ} />}>
            <Route path="/configuracoes" element={<ConfiguracoesPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
