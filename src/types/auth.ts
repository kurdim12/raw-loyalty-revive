
import { Session } from '@supabase/supabase-js';
import { Profile } from './database';

export interface AuthState {
  user: {
    id: string;
    email: string;
  } | null;
  profile: Profile | null;
  isAdmin: boolean;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials extends LoginCredentials {
  full_name?: string;
  referralCode?: string;
}

export interface ResetPasswordCredentials {
  email: string;
}
