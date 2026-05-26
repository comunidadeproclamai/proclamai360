import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { LoadingState } from '../../../components/feedback/LoadingState.jsx';
import { useAuth } from '../hooks/useAuth.js';

export function ProtectedRoute() {
  const location = useLocation();
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return <LoadingState label="Restaurando sessao..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
