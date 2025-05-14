export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          phone: string | null
          full_name: string | null
          points: number
          lifetime_points: number
          rank: string
          rank_progress: number
          referral_code: string
          referred_by: string | null
          created_at: string
          updated_at: string
          birthday: string | null
        }
        Insert: {
          id: string
          email: string
          phone?: string | null
          full_name?: string | null
          points?: number
          lifetime_points?: number
          rank?: string
          rank_progress?: number
          referral_code?: string
          referred_by?: string | null
          created_at?: string
          updated_at?: string
          birthday?: string | null
        }
        Update: {
          id?: string
          email?: string
          phone?: string | null
          full_name?: string | null
          points?: number
          lifetime_points?: number
          rank?: string
          rank_progress?: number
          referral_code?: string
          referred_by?: string | null
          created_at?: string
          updated_at?: string
          birthday?: string | null
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          type: string
          points: number
          description: string
          drink_type: string | null
          amount_spent: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          points: number
          description: string
          drink_type?: string | null
          amount_spent?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          points?: number
          description?: string
          drink_type?: string | null
          amount_spent?: number | null
          created_at?: string
        }
      }
      rewards: {
        Row: {
          id: string
          name: string
          description: string | null
          points_required: number
          category: string
          image_url: string | null
          quantity_available: number | null
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          points_required: number
          category: string
          image_url?: string | null
          quantity_available?: number | null
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          points_required?: number
          category?: string
          image_url?: string | null
          quantity_available?: number | null
          active?: boolean
          created_at?: string
        }
      }
      redemptions: {
        Row: {
          id: string
          user_id: string
          reward_id: string
          points_spent: number
          status: string
          redeemed_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          reward_id: string
          points_spent: number
          status?: string
          redeemed_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          reward_id?: string
          points_spent?: number
          status?: string
          redeemed_at?: string
          completed_at?: string | null
        }
      }
      settings: {
        Row: {
          id: string
          key: string
          value: Json
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: Json
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: Json
          updated_at?: string
        }
      }
      community_messages: {
        Row: {
          id: string
          user_id: string
          message: string
          is_announcement: boolean
          is_hidden: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          message: string
          is_announcement?: boolean
          is_hidden?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          message?: string
          is_announcement?: boolean
          is_hidden?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Profile type for ease of use
export type Profile = Database['public']['Tables']['profiles']['Row'];

// Transaction type for ease of use
export type Transaction = Database['public']['Tables']['transactions']['Row'];

// Reward type for ease of use
export type Reward = Database['public']['Tables']['rewards']['Row'];

// Redemption type for ease of use
export type Redemption = Database['public']['Tables']['redemptions']['Row'];

// Setting type for ease of use
export type Setting = Database['public']['Tables']['settings']['Row'];

// Community message type for ease of use
export type CommunityMessage = Database['public']['Tables']['community_messages']['Row'];

// User session type
export type UserSession = {
  user: {
    id: string;
    email: string;
  } | null;
  profile: Profile | null;
  isAdmin: boolean;
}
