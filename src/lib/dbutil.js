import { createClient } from '@supabase/supabase-js';

const getSupabaseClient = () => {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_API_KEY);
}

export {
  getSupabaseClient
}
