import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../services/supabase';
import { AuthState, LoginCredentials, SignupCredentials } from '../types/auth';
import { User, Session } from '@supabase/supabase-js';

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
      async (event, session) => {
        if (session) {
          setState(prevState => ({
            ...prevState,
            user: {
              id: session.user.id,
              email: session.user.email || ''
            },
            session,
            loading: true
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
            email: session.user.email || ''
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

      // Check if the user is an admin (you would need a settings table entry with admin emails)
      const { data: adminSettings } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'admin_emails')
        .single();

      const isAdmin = adminSettings?.value 
        ? (adminSettings.value as string[]).includes(profile.email)
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
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // User will be set by the onAuthStateChange listener
    } catch (error) {
      console.error('Error logging in:', error);
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
      
      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name,
            referral_code: referralCode
          }
        }
      });

      if (error) throw error;

      // Profile creation and referral handling is managed by the database trigger
      
      setState(prevState => ({
        ...prevState,
        loading: false,
        error: null
      }));

      return { success: true, data };
    } catch (error) {
      console.error('Error signing up:', error);
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
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setState({
        user: null,
        profile: null,
        isAdmin: false,
        session: null,
        loading: false,
        error: null
      });
      
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
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
      
      setState(prevState => ({
        ...prevState,
        loading: false,
      }));
      
      return { success: true };
    } catch (error) {
      console.error('Error resetting password:', error);
      setState(prevState => ({
        ...prevState,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to reset password'
      }));
      return { success: false, error };
    }
  };

  return {
    ...state,
    login,
    signup,
    logout,
    resetPassword,
    refreshProfile: () => state.user && fetchUserProfile(state.user.id),
  };
};

export default useAuth;
