import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthScreens } from '../../../dashboard/components/AuthScreens';

export function LoginPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    return <Navigate to={user.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard'} replace />;
  }

  return (
    <AuthScreens
      onLoginSuccess={(_handle, role) => {
        navigate(role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard', { replace: true });
      }}
    />
  );
}
