
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { SignupCredentials } from '@/types/auth';
import { useEffect, useState } from 'react';

const SignupForm = () => {
  const { signup, loading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [referralFromURL, setReferralFromURL] = useState<string | null>(null);
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<SignupCredentials & { confirmPassword: string }>();
  
  // Extract referral code from URL if present
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const ref = searchParams.get('ref');
    if (ref) {
      setReferralFromURL(ref);
      setValue('referralCode', ref);
    }
  }, [location.search, setValue]);
  
  const onSubmit = async (data: SignupCredentials & { confirmPassword: string }) => {
    const { confirmPassword, ...signupData } = data;
    
    // Ensure referral code from URL is used if available
    if (referralFromURL && !signupData.referralCode) {
      signupData.referralCode = referralFromURL;
    }
    
    const { success } = await signup(signupData);
    
    if (success) {
      // We'll redirect the user automatically via auth state change
      // but just in case, let's navigate to the login page
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }
  };
  
  const password = watch('password', '');

  return (
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
        <label htmlFor="full_name" className="block text-sm font-medium text-coffee-dark mb-1">
          Full Name (Optional)
        </label>
        <Input
          id="full_name"
          type="text"
          {...register('full_name')}
          className="w-full"
          placeholder="Enter your full name"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-coffee-dark mb-1">
          Password
        </label>
        <Input
          id="password"
          type="password"
          {...register('password', {
            required: 'Password is required',
            minLength: {
              value: 6,
              message: 'Password must be at least 6 characters'
            }
          })}
          className="w-full"
          placeholder="Choose a password"
        />
        {errors.password && (
          <p className="text-destructive text-sm mt-1">{errors.password.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-coffee-dark mb-1">
          Confirm Password
        </label>
        <Input
          id="confirmPassword"
          type="password"
          {...register('confirmPassword', {
            required: 'Please confirm your password',
            validate: value => value === password || 'Passwords do not match'
          })}
          className="w-full"
          placeholder="Confirm your password"
        />
        {errors.confirmPassword && (
          <p className="text-destructive text-sm mt-1">{errors.confirmPassword.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="referralCode" className="block text-sm font-medium text-coffee-dark mb-1">
          Referral Code {referralFromURL && <span className="text-green-600">(Applied)</span>}
        </label>
        <Input
          id="referralCode"
          type="text"
          {...register('referralCode')}
          className={`w-full ${referralFromURL ? 'bg-green-50 border-green-200' : ''}`}
          placeholder="Enter referral code if you have one"
          disabled={!!referralFromURL}
        />
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <div className="pt-2">
        <Button type="submit" className="w-full bg-coffee-mocha hover:bg-coffee-espresso" disabled={loading}>
          {loading ? 'Signing up...' : 'Sign Up'}
        </Button>
      </div>
      
      <div className="text-center pt-2">
        <p className="text-coffee-mocha text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-coffee-espresso hover:underline font-medium">
            Log in
          </Link>
        </p>
      </div>
    </form>
  );
};

export default SignupForm;
