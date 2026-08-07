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
  try {
    // 1. Expert optimization: combine into a single OR query instead of 2 parallel requests
    const checkPromise = supabase
      .from('profiles')
      .select('email, phone')
      .or(`email.eq.${email},phone.eq.${phone}`)
      .limit(2);

    // 2. Expert optimization: Optimistic UI progression with a 2.5s strict timeout
    // If the database is sleeping or network is extremely slow, don't block the user on Step 1.
    // The unique constraint will still be enforced during the final profile creation (createProfile).
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500));
    
    const result = await Promise.race([checkPromise, timeoutPromise]);

    if (!result || result.error || !result.data) {
      // Timeout or error: optimistically assume false to unblock user
      return { emailTaken: false, phoneTaken: false };
    }

    return {
      emailTaken: result.data.some((p) => p.email === email),
      phoneTaken: result.data.some((p) => p.phone === phone),
    };
  } catch (err) {
    return { emailTaken: false, phoneTaken: false };
  }
};

/**
 * Insert a new profile into the Supabase database.
 */
export const createProfile = async (profile: Omit<Profile, 'id' | 'created_at'>): Promise<{ data: Profile | null, error: string | null }> => {
  const { data, error } = await supabase.from('profiles').insert([profile]).select().single();
  if (error) {
    console.error('Supabase Insert Error:', error.message);
    return { data: null, error: error.message };
  }
  return { data, error: null };
};
