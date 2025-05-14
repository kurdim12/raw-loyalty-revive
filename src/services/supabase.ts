
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

// Initialize Supabase client
const supabaseUrl = 'https://trijbstsrnveqpzrnmnz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRyaWpic3Rzcm52ZXFwenJubW56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMzk1MjgsImV4cCI6MjA2MjgxNTUyOH0.rp45zmFPYX3zs5pgiuiJtzK9wBJqhlrCU2MxroGDfK8';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

export default supabase;
