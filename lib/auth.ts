/**
 * Camada de autenticação — Supabase Auth (OTP por email/telefone + Google OAuth).
 * Quando Supabase não está configurado (sem env vars), cai em mock local
 * para que o app continue funcionando em desenvolvimento sem backend.
 */

import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const isExpoGo =
  Constants.executionEnvironment === 'storeClient' ||
  (Constants as unknown as { appOwnership?: string }).appOwnership === 'expo';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Código OTP aceito no modo mock (sem Supabase). */
export const DEV_OTP = '000000';

export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function supabaseUserToAuthUser(sbUser: {
  id: string;
  email?: string | null;
  phone?: string | null;
  user_metadata?: Record<string, unknown>;
}): AuthUser {
  const meta = sbUser.user_metadata ?? {};
  const name =
    (meta.full_name as string | undefined) ??
    (meta.name as string | undefined) ??
    sbUser.email?.split('@')[0] ??
    'Usuário';
  return {
    id: sbUser.id,
    name,
    email: sbUser.email ?? undefined,
    phone: sbUser.phone ?? undefined,
    photoUrl: (meta.avatar_url as string | undefined) ?? undefined,
  };
}

// ─── Email OTP ────────────────────────────────────────────────────────────────

/** Reenvia OTP para email — funciona para login e registro (shouldCreateUser: true sem dados extras). */
export async function resendEmailOTP(email: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    await delay(700);
    return;
  }
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  });
  if (error) throw new Error(error.message);
}

/** Reenvia OTP para telefone — funciona para login e registro. */
export async function resendPhoneOTP(phone: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    await delay(700);
    return;
  }
  const e164 = phone.startsWith('+') ? phone : `+55${phone.replace(/\D/g, '')}`;
  const { error } = await supabase.auth.signInWithOtp({
    phone: e164,
    options: { shouldCreateUser: true },
  });
  if (error) throw new Error(error.message);
}

/** Envia OTP para e-mail existente. Não cria conta nova — apenas login. */
export async function sendEmailOTP(email: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    await delay(700);
    return;
  }
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false },
  });
  if (error) throw new Error(error.message);
}

// ─── Telefone OTP ─────────────────────────────────────────────────────────────

/** Envia OTP via SMS para número existente. Não cria conta nova — apenas login. */
export async function sendPhoneOTP(phone: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    await delay(700);
    return;
  }
  const e164 = phone.startsWith('+') ? phone : `+55${phone.replace(/\D/g, '')}`;
  const { error } = await supabase.auth.signInWithOtp({
    phone: e164,
    options: { shouldCreateUser: false },
  });
  if (error) throw new Error(error.message);
}

// ─── Verificação de OTP ───────────────────────────────────────────────────────

/** Verifica o código OTP e retorna o usuário autenticado. */
export async function verifyOTP(
  contact: string,
  code: string,
  type: 'email' | 'phone',
): Promise<AuthUser> {
  if (!isSupabaseConfigured || !supabase) {
    await delay(600);
    if (code !== DEV_OTP) throw new Error('Código inválido (use 000000 no modo dev)');
    const isEmail = type === 'email';
    return {
      id: `mock_${Date.now()}`,
      name: isEmail ? contact.split('@')[0] : 'Usuário',
      email: isEmail ? contact : undefined,
      phone: isEmail ? undefined : contact,
    };
  }

  const otpType = type === 'email' ? 'email' : 'sms';
  const payload =
    type === 'email'
      ? { email: contact, token: code, type: otpType as 'email' }
      : { phone: contact, token: code, type: otpType as 'sms' };

  const { data, error } = await supabase.auth.verifyOtp(payload);
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('Verificação falhou — tente novamente');

  return supabaseUserToAuthUser(data.user);
}

// ─── Cadastro (alias do OTP — Supabase cria o usuário automaticamente) ────────

/** Cria conta com e-mail salvando o nome em user_metadata. */
export async function signUpWithEmail(name: string, email: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    await delay(700);
    return;
  }
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true, data: { full_name: name } },
  });
  if (error) throw new Error(error.message);
}

/** Cria conta com telefone salvando o nome em user_metadata. */
export async function signUpWithPhone(name: string, phone: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    await delay(700);
    return;
  }
  const e164 = phone.startsWith('+') ? phone : `+55${phone.replace(/\D/g, '')}`;
  const { error } = await supabase.auth.signInWithOtp({
    phone: e164,
    options: { shouldCreateUser: true, data: { full_name: name } },
  });
  if (error) throw new Error(error.message);
}

// ─── Google OAuth ─────────────────────────────────────────────────────────────

/**
 * Login com Google via Supabase OAuth + expo-web-browser.
 * Fluxo: abre Chrome Custom Tab → Google autentica → redireciona para
 * litoralnapalma://auth/callback → exchangeCodeForSession → onAuthStateChange
 * dispara no AuthContext → usuário logado automaticamente.
 *
 * Requer Google OAuth ativado no Supabase Dashboard → Authentication → Providers.
 * Não funciona no Expo Go — apenas em dev build ou produção.
 */
export async function signInWithGoogle(): Promise<void> {
  // Expo Go não suporta deep link com scheme customizado — OAuth requer dev build
  if (isExpoGo) {
    throw new Error('EXPO_GO_NOT_SUPPORTED');
  }

  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Configure as variáveis EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY.');
  }

  // Em dev build/produção: Linking.createURL retorna litoralnapalma://auth/callback
  const redirectTo = Linking.createURL('auth/callback');

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, skipBrowserRedirect: true },
  });

  if (error) throw new Error(error.message);
  if (!data.url) throw new Error('URL de autenticação não recebida do Supabase.');

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (result.type === 'success') {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(result.url);
    if (exchangeError) throw new Error(exchangeError.message);
  } else if (result.type === 'cancel') {
    throw new Error('LOGIN_CANCELLED');
  }
}

// ─── Sign out ─────────────────────────────────────────────────────────────────

/** Encerra a sessão do usuário. */
export async function signOut(): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    await supabase.auth.signOut();
    return;
  }
  await delay(200);
}
