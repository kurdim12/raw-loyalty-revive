
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

// Initialize Supabase client
// NOTE: In a production environment, these should be environment variables
const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseAnonKey = 'your-supabase-anon-key';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export default supabase;
