
import SignupForm from '@/components/auth/SignupForm';
import AuthLayout from '@/components/auth/AuthLayout';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

const Signup = () => {
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
      title="Create an Account"
      subtitle="Join our rewards program and start earning points"
    >
      <SignupForm />
    </AuthLayout>
  );
};

export default Signup;
