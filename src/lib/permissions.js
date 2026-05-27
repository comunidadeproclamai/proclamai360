export const ROLES = {
  ADMIN: 'admin',
  FINANCEIRO: 'financeiro',
  INFANTIL: 'infantil',
  LOUVOR: 'louvor',
  MEMBER: 'member',
};

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Administrador',
  [ROLES.FINANCEIRO]: 'Financeiro',
  [ROLES.INFANTIL]: 'Infantil',
  [ROLES.LOUVOR]: 'Louvor',
  [ROLES.MEMBER]: 'Membro',
};

export const PERMISSIONS = {
  DASHBOARD_VIEW: 'dashboard:view',
  MEMBERS_READ: 'members:read',
  MEMBERS_WRITE: 'members:write',
  FINANCIAL_READ: 'financial:read',
  FINANCIAL_WRITE: 'financial:write',
  CHILDREN_READ: 'children:read',
  CHILDREN_WRITE: 'children:write',
  WORSHIP_READ: 'worship:read',
  WORSHIP_WRITE: 'worship:write',
  SETTINGS_READ: 'settings:read',
  SETTINGS_WRITE: 'settings:write',
  USERS_MANAGE: 'users:manage',
};

const ROLE_ALIASES = {
  administrador: ROLES.ADMIN,
  adm: ROLES.ADMIN,
  membro: ROLES.MEMBER,
};

const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: Object.values(PERMISSIONS),
  [ROLES.FINANCEIRO]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.MEMBERS_READ,
    PERMISSIONS.FINANCIAL_READ,
    PERMISSIONS.FINANCIAL_WRITE,
  ],
  [ROLES.INFANTIL]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.MEMBERS_READ,
    PERMISSIONS.CHILDREN_READ,
    PERMISSIONS.CHILDREN_WRITE,
  ],
  [ROLES.LOUVOR]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.MEMBERS_READ,
    PERMISSIONS.WORSHIP_READ,
    PERMISSIONS.WORSHIP_WRITE,
  ],
  [ROLES.MEMBER]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.WORSHIP_READ,
  ],
};

export function normalizeRole(role) {
  const value = String(role || ROLES.MEMBER).trim().toLowerCase();
  return ROLE_ALIASES[value] || value;
}

export function getPermissionsForRole(role) {
  return ROLE_PERMISSIONS[normalizeRole(role)] || ROLE_PERMISSIONS[ROLES.MEMBER];
}

export function hasPermission(user, permission) {
  if (!user || !permission) return false;
  return getPermissionsForRole(user.role).includes(permission);
}

export function getRoleLabel(role) {
  return ROLE_LABELS[normalizeRole(role)] || ROLE_LABELS[ROLES.MEMBER];
}
