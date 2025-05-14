
export interface AuthState {
  user: {
    id: string;
    email: string;
  } | null;
  profile: {
    id: string;
    email: string;
    full_name: string | null;
    points: number;
    lifetime_points: number;
    rank: string;
    rank_progress: number;
    referral_code: string;
  } | null;
  isAdmin: boolean;
  session: any | null;
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
