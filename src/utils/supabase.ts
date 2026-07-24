import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Profile {
  id?: string;
  first_name: string;
  last_name: string;
  gender: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  password_hash: string;
  role?: 'user' | 'admin';
  wallet_balance?: number;
  is_banned?: boolean;
  banned_at?: string | null;
  created_at?: string;
}

/**
 * Check if an email or phone already exists in the profiles table.
 * Returns true if a duplicate is found.
 */
export const checkDuplicate = async (email: string, phone: string): Promise<{ emailTaken: boolean; phoneTaken: boolean }> => {
  const [emailRes, phoneRes] = await Promise.all([
    supabase.from('profiles').select('id').eq('email', email).single(),
    supabase.from('profiles').select('id').eq('phone', phone).single(),
  ]);
  return {
    emailTaken: !!emailRes.data,
    phoneTaken: !!phoneRes.data,
  };
};

/**
 * Insert a new profile into the Supabase database.
 */
export const createProfile = async (profile: Omit<Profile, 'id' | 'created_at'>): Promise<{ error: string | null }> => {
  const { error } = await supabase.from('profiles').insert([profile]);
  if (error) {
    console.error('Supabase Insert Error:', error.message);
    return { error: error.message };
  }
  return { error: null };
};
