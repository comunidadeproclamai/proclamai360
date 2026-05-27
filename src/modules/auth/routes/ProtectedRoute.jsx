import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { LoadingState } from '../../../components/feedback/LoadingState.jsx';
import { hasPermission } from '../../../lib/permissions.js';
import { useAuth } from '../hooks/useAuth.js';

export function ProtectedRoute({ permission }) {
  const location = useLocation();
  const { user, isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return <LoadingState label="Restaurando sessao..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (permission && !hasPermission(user, permission)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
