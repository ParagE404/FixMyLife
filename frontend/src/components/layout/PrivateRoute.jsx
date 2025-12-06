import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

export function PrivateRoute({ children }) {
  const { token } = useAuthStore();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
