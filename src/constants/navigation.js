import {
  BarChart3,
  Baby,
  Music2,
  Settings,
  UsersRound,
  WalletCards,
} from 'lucide-react';
import { PERMISSIONS } from '../lib/permissions.js';

export const navigationItems = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: BarChart3,
    permission: PERMISSIONS.DASHBOARD_VIEW,
  },
  {
    label: 'Membros',
    path: '/membros',
    icon: UsersRound,
    permission: PERMISSIONS.MEMBERS_READ,
  },
  {
    label: 'Infantil',
    path: '/infantil',
    icon: Baby,
    permission: PERMISSIONS.CHILDREN_READ,
  },
  {
    label: 'Financeiro',
    path: '/financeiro',
    icon: WalletCards,
    permission: PERMISSIONS.FINANCIAL_READ,
  },
  {
    label: 'Louvor',
    path: '/louvor',
    icon: Music2,
    permission: PERMISSIONS.WORSHIP_READ,
  },
  {
    label: 'Configuracoes',
    path: '/configuracoes',
    icon: Settings,
    permission: PERMISSIONS.SETTINGS_READ,
  },
];
