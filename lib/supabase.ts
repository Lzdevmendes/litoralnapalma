/**
 * Cliente Supabase configurado para React Native.
 * Usa LargeSecureStore (chunking sobre expo-secure-store) como adapter de sessão —
 * mantém a sessão inteira (tokens de acesso/refresh) em armazenamento criptografado
 * (Keychain/Keystore), contornando o limite de ~2KB por chave do SecureStore.
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
