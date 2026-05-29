/**
 * Camada de autenticação — Supabase Auth (OTP por email/telefone + Google OAuth).
 * Quando Supabase não está configurado (sem env vars), cai em mock local
 * para que o app continue funcionando em desenvolvimento sem backend.
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase';

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

function supabaseUserToAuthUser(sbUser: {
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

/** Envia OTP para o e-mail informado (magic link ou código de 6 dígitos). */
export async function sendEmailOTP(email: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    await delay(700);
    return; // mock — aceita qualquer email
  }
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  });
  if (error) throw new Error(error.message);
}

// ─── Telefone OTP ─────────────────────────────────────────────────────────────

/** Envia OTP via SMS para o número informado. Requer Phone provider habilitado no Supabase. */
export async function sendPhoneOTP(phone: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    await delay(700);
    return; // mock
  }
  const { error } = await supabase.auth.signInWithOtp({
    phone,
    options: { shouldCreateUser: true },
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

/**
 * Cria conta com e-mail. Com Supabase, `shouldCreateUser: true` já faz o cadastro
 * no primeiro OTP — esta função é um alias semântico de sendEmailOTP.
 */
export async function signUpWithEmail(
  _name: string,
  email: string,
  _password: string,
): Promise<void> {
  await sendEmailOTP(email);
}

/**
 * Cria conta com telefone. Alias de sendPhoneOTP.
 * Requer o provider Phone habilitado no Supabase dashboard.
 */
export async function signUpWithPhone(_name: string, phone: string): Promise<void> {
  await sendPhoneOTP(phone);
}

// ─── Google OAuth ─────────────────────────────────────────────────────────────

/**
 * Login com Google.
 * Requer EXPO_PUBLIC_GOOGLE_CLIENT_ID e OAuth configurado no Supabase dashboard.
 * Por agora retorna mock — integração OAuth completa em próxima iteração.
 */
export async function signInWithGoogle(): Promise<AuthUser> {
  await delay(900);
  // TODO: expo-auth-session + supabase.auth.signInWithOAuth({ provider: 'google' })
  return {
    id: `google_mock_${Date.now()}`,
    name: 'Usuário Google',
    email: 'usuario@gmail.com',
    photoUrl: undefined,
  };
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
