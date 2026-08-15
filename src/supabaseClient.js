import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://anssfvwefpeatohppdlh.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_xXMYtlIhCkxGtTvNH-fybQ_Tt22tJOv';

export const supabase = createClient(supabaseUrl, supabaseKey);
