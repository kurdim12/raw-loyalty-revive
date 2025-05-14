
import SignupForm from '@/components/auth/SignupForm';
import AuthLayout from '@/components/auth/AuthLayout';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, useLocation } from 'react-router-dom';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

const Signup = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  // Check for referral in query params
  const query = new URLSearchParams(location.search);
  const hasReferral = query.has('ref');

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
      subtitle={hasReferral ? 
        "Join with a referral and earn bonus points!" : 
        "Join our rewards program and start earning points"}
    >
      <SignupForm />
    </AuthLayout>
  );
};

export default Signup;
