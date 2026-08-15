import { database } from '../database.js';
import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';

export const dbService = {
  getCollection: async (name) => {
    return await database.getCollection(name);
  },

  saveCollection: async (name, data) => {
    return await database.saveCollection(name, data);
  },

  /**
   * Direct granular Supabase query helpers
   */
  supabase: supabaseAdmin,
  isConfigured: isSupabaseConfigured
};
