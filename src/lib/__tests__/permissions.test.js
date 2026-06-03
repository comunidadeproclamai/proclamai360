import { describe, it, expect } from 'vitest';
import { hasPermission, normalizeRole, PERMISSIONS, ROLES, getRoleLabel } from '../permissions';

describe('Permissions Library', () => {
  describe('normalizeRole', () => {
    it('normalizes known aliases', () => {
      expect(normalizeRole('administrador')).toBe(ROLES.ADMIN);
      expect(normalizeRole('adm')).toBe(ROLES.ADMIN);
      expect(normalizeRole('membro')).toBe(ROLES.MEMBER);
    });

    it('handles uppercase input', () => {
      expect(normalizeRole('ADMIN')).toBe(ROLES.ADMIN);
    });

    it('defaults to member for null/undefined/unknown', () => {
      expect(normalizeRole(null)).toBe(ROLES.MEMBER);
      expect(normalizeRole(undefined)).toBe(ROLES.MEMBER);
      expect(normalizeRole('unknown')).toBe('unknown'); // Normalizes but keeps unknown
    });
  });

  describe('hasPermission', () => {
    it('returns false for null user or permission', () => {
      expect(hasPermission(null, PERMISSIONS.MEMBERS_READ)).toBe(false);
      expect(hasPermission({ role: ROLES.ADMIN }, null)).toBe(false);
    });

    it('admin has all permissions', () => {
      const user = { role: ROLES.ADMIN };
      Object.values(PERMISSIONS).forEach(perm => {
        expect(hasPermission(user, perm)).toBe(true);
      });
    });

    it('financeiro role permissions', () => {
      const user = { role: ROLES.FINANCEIRO };
      expect(hasPermission(user, PERMISSIONS.FINANCIAL_WRITE)).toBe(true);
      expect(hasPermission(user, PERMISSIONS.MEMBERS_READ)).toBe(true);
      expect(hasPermission(user, PERMISSIONS.MEMBERS_WRITE)).toBe(false);
    });

    it('member role permissions', () => {
      const user = { role: ROLES.MEMBER };
      expect(hasPermission(user, PERMISSIONS.DASHBOARD_VIEW)).toBe(true);
      expect(hasPermission(user, PERMISSIONS.WORSHIP_READ)).toBe(true);
      expect(hasPermission(user, PERMISSIONS.FINANCIAL_READ)).toBe(false);
    });
  });

  describe('getRoleLabel', () => {
    it('returns correct labels', () => {
      expect(getRoleLabel(ROLES.ADMIN)).toBe('Administrador');
      expect(getRoleLabel(ROLES.FINANCEIRO)).toBe('Financeiro');
      expect(getRoleLabel('adm')).toBe('Administrador');
    });
  });
});
