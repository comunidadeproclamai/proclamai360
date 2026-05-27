import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearStoredToken, getStoredToken, storeToken } from '../../../lib/storage.js';
import * as authService from '../services/authService.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      const token = getStoredToken();

      if (!token) {
        setIsBootstrapping(false);
        return;
      }

      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch {
        clearStoredToken();
        setUser(null);
      } finally {
        setIsBootstrapping(false);
      }
    }

    restoreSession();
  }, []);

  useEffect(() => {
    function handleSessionExpired() {
      clearStoredToken();
      setUser(null);
      navigate('/login', { replace: true });
    }

    window.addEventListener('proclamai:session-expired', handleSessionExpired);
    return () => window.removeEventListener('proclamai:session-expired', handleSessionExpired);
  }, [navigate]);

  const authenticate = useCallback(
    async (credentials) => {
      const response = await authService.login(credentials);

      storeToken(response.token);
      setUser(response.user);
      navigate('/dashboard', { replace: true });
    },
    [navigate],
  );

  const logout = useCallback(() => {
    clearStoredToken();
    setUser(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isBootstrapping,
      authenticate,
      logout,
    }),
    [authenticate, isBootstrapping, logout, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
