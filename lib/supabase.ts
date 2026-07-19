import { createClient } from "@supabase/supabase-js";

let supabaseClient: any = null;

export const getSupabase = () => {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)?.trim();
    
    console.log("Supabase URL:", supabaseUrl);
    console.log("Supabase Key:", supabaseAnonKey ? "PRESENT" : "MISSING");

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("NEXT_PUBLIC_SUPABASE_URL and (NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) must be defined");
    }
    
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseClient;
};
