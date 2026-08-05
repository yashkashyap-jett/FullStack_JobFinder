import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

/**
 * ProtectedRoute — guards routes by auth status and optional role check.
 * @param {string} role  - if provided, user.role must match
 * @param {string} redirectTo - where to send unauthorized users
 */
export default function ProtectedRoute({ children, role, redirectTo = '/login' }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (role && user?.role !== role) {
    // Redirect to role-specific dashboard
    const dashboard = user?.role === 'recruiter' ? '/recruiter/dashboard' : '/candidate/dashboard';
    return <Navigate to={dashboard} replace />;
  }

  return children;
}
