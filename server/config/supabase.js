import { createClient } from '@supabase/supabase-js';
import { config } from './env.js';

let supabaseClient = null;
let supabaseAdminClient = null;

if (config.supabase.isConfigured) {
  try {
    const supabaseUrl = config.supabase.url;
    const serviceKey = config.supabase.serviceRoleKey || config.supabase.anonKey;
    const anonKey = config.supabase.anonKey || serviceKey;

    // Client for standard public/authenticated queries
    supabaseClient = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false }
    });

    // Admin Client with Service Role (bypasses RLS for backend batch operations)
    supabaseAdminClient = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false }
    });

    console.log('[Supabase] Initialized client successfully for:', supabaseUrl);
  } catch (err) {
    console.error('[Supabase] Failed to initialize Supabase client:', err.message);
  }
} else {
  console.log('[Supabase] SUPABASE_URL / SUPABASE_KEY not set in environment. Running in local fallback mode.');
}

export const supabase = supabaseClient;
export const supabaseAdmin = supabaseAdminClient || supabaseClient;
export const isSupabaseConfigured = () => !!supabaseAdminClient;
