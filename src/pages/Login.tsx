
import LoginForm from '@/components/auth/LoginForm';
import AuthLayout from '@/components/auth/AuthLayout';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

const Login = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AuthLayout 
      title="Welcome Back" 
      subtitle="Log in to access your rewards"
    >
      <LoginForm />
    </AuthLayout>
  );
};

export default Login;
