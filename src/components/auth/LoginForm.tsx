
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';

interface LoginFormData {
  email: string;
  password: string;
}

const LoginForm = () => {
  const { login, loading, error } = useAuth();
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();
  
  const onSubmit = async (data: LoginFormData) => {
    await login(data);
  };
  
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      setResetError('Please enter your email address');
      return;
    }
    
    try {
      const { success, error } = await useAuth().resetPassword(resetEmail);
      if (success) {
        setResetSent(true);
        setResetError(null);
      } else {
        setResetError(error as string);
      }
    } catch (err) {
      setResetError('Failed to send reset email. Please try again.');
    }
  };

  return (
    <>
      {showResetForm ? (
        <div className="space-y-4">
          {resetSent ? (
            <div className="text-center">
              <div className="mb-6 text-coffee-mocha">
                <p>Check your email for a password reset link.</p>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowResetForm(false)}
                className="w-full"
              >
                Back to Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label htmlFor="resetEmail" className="block text-sm font-medium text-coffee-dark mb-1">
                  Email Address
                </label>
                <Input
                  id="resetEmail"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full"
                  placeholder="Enter your email"
                />
                {resetError && (
                  <p className="text-destructive text-sm mt-1">{resetError}</p>
                )}
              </div>
              <div className="pt-2">
                <Button type="submit" className="w-full bg-coffee-mocha hover:bg-coffee-espresso" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </div>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowResetForm(false)}
                  className="text-coffee-mocha hover:text-coffee-espresso text-sm"
                >
                  Back to Login
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-coffee-dark mb-1">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              className="w-full"
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="text-destructive text-sm mt-1">{errors.email.message}</p>
            )}
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-coffee-dark">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowResetForm(true)}
                className="text-coffee-mocha hover:text-coffee-espresso text-xs"
              >
                Forgot password?
              </button>
            </div>
            <Input
              id="password"
              type="password"
              {...register('password', {
                required: 'Password is required'
              })}
              className="w-full"
              placeholder="Enter your password"
            />
            {errors.password && (
              <p className="text-destructive text-sm mt-1">{errors.password.message}</p>
            )}
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div className="pt-2">
            <Button type="submit" className="w-full bg-coffee-mocha hover:bg-coffee-espresso" disabled={loading}>
              {loading ? 'Logging in...' : 'Log In'}
            </Button>
          </div>
          
          <div className="text-center pt-2">
            <p className="text-coffee-mocha text-sm">
              Don't have an account?{' '}
              <Link to="/signup" className="text-coffee-espresso hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </form>
      )}
    </>
  );
};

export default LoginForm;
