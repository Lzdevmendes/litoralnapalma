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
 * Login com Google.
 * Requer EXPO_PUBLIC_GOOGLE_CLIENT_ID e OAuth configurado no Supabase dashboard.
 * Por agora retorna mock — integração OAuth completa em próxima iteração.
 */
export async function signInWithGoogle(): Promise<AuthUser> {
  throw new Error(
    'Google OAuth não implementado — use e-mail ou telefone. ' +
    'Pendente: expo-auth-session + supabase.auth.signInWithIdToken',
  );
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
