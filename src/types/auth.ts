
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  full_name?: string;
  referralCode?: string;
  birthday?: string;
}

export interface AuthState {
  user: {
    id: string;
    email: string;
  } | null;
  profile: any | null;
  isAdmin: boolean;
  session: any | null;
  loading: boolean;
  error: string | null;
}
