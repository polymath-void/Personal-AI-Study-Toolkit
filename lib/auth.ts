import { getSupabase } from './supabase';
import { UserRole } from '../types';

export async function signUpUser(email: string, password: string, name: string, role: UserRole) {
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.signUp({ 
    email, 
    password,
    options: {
      data: { name, role },
      emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined
    }
  });
  
  if (error) throw error;
  if (!data.user) throw new Error('Signup failed');

  return data.user;
}
