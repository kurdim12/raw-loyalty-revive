
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import supabase from '../services/supabase';
import { AuthState, LoginCredentials, SignupCredentials } from '../types/auth';

// Helper function to clean up auth state
const cleanupAuthState = () => {
  // Remove standard auth tokens
  localStorage.removeItem('supabase.auth.token');
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  // Remove from sessionStorage if in use
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

export const useAuth = () => {
  const navigate = useNavigate();
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    isAdmin: false,
    session: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          setState(prevState => ({
            ...prevState,
            user: {
              id: session.user.id,
              email: session.user.email || '' // Handle potential undefined email
            },
            session,
            loading: true
          }));

          // Defer fetching to avoid potential deadlocks
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setState({
            user: null,
            profile: null,
            isAdmin: false,
            session: null,
            loading: false,
            error: null
          });
        }
      }
    );

    // Initial session check
    checkUser();

    // Cleanup
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      setState(prevState => ({ ...prevState, loading: true }));
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setState(prevState => ({
          ...prevState,
          user: {
            id: session.user.id,
            email: session.user.email || '' // Handle potential undefined email
          },
          session,
        }));
        
        // Fetch user profile
        await fetchUserProfile(session.user.id);
      } else {
        setState({
          user: null,
          profile: null,
          isAdmin: false,
          session: null,
          loading: false,
          error: null
        });
      }
    } catch (error) {
      console.error('Error checking user:', error);
      setState(prevState => ({
        ...prevState,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }));
    }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      // Check if the user is an admin
      const { data: adminSettings } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'admin_emails')
        .single();

      const isAdmin = adminSettings?.value 
        ? ((adminSettings.value as string[]).includes(profile.email))
        : false;

      setState(prevState => ({
        ...prevState,
        profile,
        isAdmin,
        loading: false,
        error: null
      }));
    } catch (error) {
      console.error('Error fetching profile:', error);
      setState(prevState => ({
        ...prevState,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch profile'
      }));
    }
  };

  const login = async ({ email, password }: LoginCredentials) => {
    try {
      setState(prevState => ({ ...prevState, loading: true, error: null }));
      
      // Clean up existing auth state
      cleanupAuthState();
      
      // Attempt global sign out
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      toast.success("Login successful", {
        description: "Welcome back!",
      });

      // User and session will be set by the onAuthStateChange listener
      // Redirect will happen after profile is loaded
    } catch (error) {
      console.error('Error logging in:', error);
      
      toast.error("Login failed", {
        description: error instanceof Error ? error.message : 'Invalid credentials',
      });
      
      setState(prevState => ({
        ...prevState,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to login'
      }));
    }
  };

  const signup = async ({ email, password, full_name, referralCode }: SignupCredentials) => {
    try {
      setState(prevState => ({ ...prevState, loading: true, error: null }));
      
      // Clean up existing auth state
      cleanupAuthState();
      
      console.log('Signing up with metadata:', { full_name, referralCode });
      
      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: full_name || '',
            referral_code: referralCode || null
          }
        }
      });

      if (error) throw error;

      // After successful signup, verify if the profile was created
      if (data?.user) {
        // Wait a moment for the trigger to complete
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Check if profile exists
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();
        
        if (profileError || !profile) {
          console.warn('Profile not created automatically, creating manually');
          
          // Generate a manual referral code
          const manualCode = Math.random().toString(36).substring(2, 6).toUpperCase() + 
                             Math.random().toString(36).substring(2, 6).toUpperCase();
          
          // Create profile manually as fallback
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: email,
              full_name: full_name || '',
              points: 10,
              lifetime_points: 10,
              rank: 'Bronze',
              rank_progress: 0,
              referral_code: manualCode,
              referred_by: null
            });
          
          if (insertError) {
            console.error('Manual profile creation failed:', insertError);
          } else {
            // Create initial transaction
            await supabase
              .from('transactions')
              .insert({
                user_id: data.user.id,
                type: 'bonus',
                points: 10,
                description: 'Welcome bonus'
              });
          }
        }
      }

      toast.success("Sign up successful", {
        description: "Your account has been created with 10 bonus points!",
      });
      
      setState(prevState => ({
        ...prevState,
        loading: false,
        error: null
      }));

      return { success: true, data };
    } catch (error) {
      console.error('Error signing up:', error);
      
      toast.error("Sign up failed", {
        description: error instanceof Error ? error.message : 'Could not create account',
      });
      
      setState(prevState => ({
        ...prevState,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to sign up'
      }));
      return { success: false, error };
    }
  };

  const logout = async () => {
    try {
      setState(prevState => ({ ...prevState, loading: true, error: null }));
      
      // Clean up existing auth state
      cleanupAuthState();
      
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) throw error;
      
      toast.success("Logged out", {
        description: "You have been signed out successfully",
      });
      
      setState({
        user: null,
        profile: null,
        isAdmin: false,
        session: null,
        loading: false,
        error: null
      });
      
      // Force page reload for a clean state
      window.location.href = '/login';
    } catch (error) {
      console.error('Error logging out:', error);
      
      toast.error("Logout failed", {
        description: error instanceof Error ? error.message : 'Could not log out properly',
      });
      
      setState(prevState => ({
        ...prevState,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to logout'
      }));
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setState(prevState => ({ ...prevState, loading: true, error: null }));
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      toast.success("Password reset email sent", {
        description: "Check your email for a password reset link",
      });
      
      setState(prevState => ({
        ...prevState,
        loading: false,
      }));
      
      return { success: true };
    } catch (error) {
      console.error('Error resetting password:', error);
      
      toast.error("Password reset failed", {
        description: error instanceof Error ? error.message : 'Could not send reset email',
      });
      
      setState(prevState => ({
        ...prevState,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to reset password'
      }));
      return { success: false, error };
    }
  };

  // Refresh user profile data
  const refreshProfile = useCallback(async () => {
    if (state.user) {
      await fetchUserProfile(state.user.id);
    }
  }, [state.user]);

  // Redirect based on user role
  useEffect(() => {
    if (!state.loading && state.user && state.profile) {
      // Check if we're on login or signup page and redirect if needed
      const currentPath = window.location.pathname;
      if (currentPath === '/login' || currentPath === '/signup') {
        if (state.isAdmin) {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    }
  }, [state.loading, state.user, state.profile, state.isAdmin, navigate]);
  
  return {
    ...state,
    login,
    signup,
    logout,
    resetPassword,
    refreshProfile
  };
};

export default useAuth;
