import { Navigate } from 'react-router-dom';

/** Protects admin routes — requires sessionStorage flag set by AdminLogin. */
export default function AdminProtectedRoute({ children }) {
  const isAdmin = sessionStorage.getItem('shughar_admin_auth') === 'true';
  if (!isAdmin) return <Navigate to="/admin/login" replace />;
  return children;
}
