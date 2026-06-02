/**
 * Cliente Supabase configurado para React Native.
 * Usa AsyncStorage como adapter de sessão (obrigatório em RN).
 *
 * Variáveis de ambiente necessárias:
 *   EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
 *   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
 *
 * Quando não configuradas, `supabase` é null e as funções caem no mock.
 */

import { createClient } from '@supabase/supabase-js';
import { LargeSecureStore } from '@/lib/large-secure-store';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          storage: new LargeSecureStore(),
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      })
    : null;

export const isSupabaseConfigured = !!supabase;
