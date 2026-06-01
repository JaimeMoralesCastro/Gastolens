import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export function displayName(user) {
  return user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Usuario';
}
