import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AccountInactiveModal from './AccountInactiveModal.jsx';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, user, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Intercept access for deactivated accounts — show custom admin written popup modal
  if (user?.status === 'inactive') {
    return <AccountInactiveModal user={user} onSignOut={logout} />;
  }

  return children;
}
