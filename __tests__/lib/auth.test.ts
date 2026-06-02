/**
 * Testes para lib/auth.ts — cobre modo mock (sem Supabase configurado).
 *
 * A lib exporta funções que retornam mock quando `isSupabaseConfigured` é false.
 * Não testamos os branches Supabase reais aqui — esses precisam de integração.
 */

// Garante que o Supabase NÃO está configurado nestes testes
jest.mock('@/lib/supabase', () => ({
  supabase: null,
  isSupabaseConfigured: false,
}));

import {
  DEV_OTP,
  verifyOTP,
  signUpWithEmail,
  signUpWithPhone,
  sendEmailOTP,
  sendPhoneOTP,
  resendEmailOTP,
  resendPhoneOTP,
  signOut,
  supabaseUserToAuthUser,
} from '@/lib/auth';

// ── supabaseUserToAuthUser ────────────────────────────────────────────────────

describe('supabaseUserToAuthUser', () => {
  it('uses full_name from user_metadata as name', () => {
    const user = { id: 'u1', email: 'a@b.com', user_metadata: { full_name: 'João' } };
    expect(supabaseUserToAuthUser(user).name).toBe('João');
  });

  it('falls back to metadata.name if full_name missing', () => {
    const user = { id: 'u1', email: 'a@b.com', user_metadata: { name: 'Maria' } };
    expect(supabaseUserToAuthUser(user).name).toBe('Maria');
  });

  it('falls back to email prefix if no metadata name', () => {
    const user = { id: 'u1', email: 'joao@costa.com', user_metadata: {} };
    expect(supabaseUserToAuthUser(user).name).toBe('joao');
  });

  it('falls back to "Usuário" if no email and no metadata', () => {
    const user = { id: 'u1', user_metadata: {} };
    expect(supabaseUserToAuthUser(user).name).toBe('Usuário');
  });

  it('maps all fields correctly', () => {
    const user = {
      id: 'abc',
      email: 'x@y.com',
      phone: '+5511999990000',
      user_metadata: { full_name: 'Ana', avatar_url: 'https://pic.example.com/a.jpg' },
    };
    const result = supabaseUserToAuthUser(user);
    expect(result).toEqual({
      id: 'abc',
      name: 'Ana',
      email: 'x@y.com',
      phone: '+5511999990000',
      photoUrl: 'https://pic.example.com/a.jpg',
    });
  });
});

// ── Mock mode — verifyOTP ────────────────────────────────────────────────────

describe('verifyOTP (mock mode)', () => {
  it('resolves with AuthUser when correct DEV_OTP is supplied', async () => {
    const user = await verifyOTP('test@example.com', DEV_OTP, 'email');
    expect(user.id).toMatch(/^mock_/);
    expect(user.email).toBe('test@example.com');
    expect(user.phone).toBeUndefined();
    expect(user.name).toBe('test');
  });

  it('resolves for phone type with correct DEV_OTP', async () => {
    const user = await verifyOTP('+5511999990000', DEV_OTP, 'phone');
    expect(user.id).toMatch(/^mock_/);
    expect(user.phone).toBe('+5511999990000');
    expect(user.email).toBeUndefined();
    expect(user.name).toBe('Usuário');
  });

  it('throws when wrong OTP is supplied', async () => {
    await expect(verifyOTP('test@example.com', '123456', 'email')).rejects.toThrow();
  });

  it('error message mentions dev code', async () => {
    await expect(verifyOTP('a@b.com', '000001', 'email')).rejects.toThrow(/000000/);
  });
});

// ── Mock mode — sendEmailOTP / sendPhoneOTP ──────────────────────────────────

describe('sendEmailOTP (mock mode)', () => {
  it('resolves without error', async () => {
    await expect(sendEmailOTP('test@test.com')).resolves.toBeUndefined();
  });
});

describe('sendPhoneOTP (mock mode)', () => {
  it('resolves without error', async () => {
    await expect(sendPhoneOTP('11999990000')).resolves.toBeUndefined();
  });
});

// ── Mock mode — resendEmailOTP / resendPhoneOTP ───────────────────────────────

describe('resendEmailOTP (mock mode)', () => {
  it('resolves without error', async () => {
    await expect(resendEmailOTP('test@test.com')).resolves.toBeUndefined();
  });
});

describe('resendPhoneOTP (mock mode)', () => {
  it('resolves without error', async () => {
    await expect(resendPhoneOTP('11999990000')).resolves.toBeUndefined();
  });
});

// ── Mock mode — signUpWithEmail / signUpWithPhone ────────────────────────────

describe('signUpWithEmail (mock mode)', () => {
  it('resolves without error', async () => {
    await expect(signUpWithEmail('João', 'joao@test.com')).resolves.toBeUndefined();
  });
});

describe('signUpWithPhone (mock mode)', () => {
  it('resolves without error', async () => {
    await expect(signUpWithPhone('Maria', '11988887777')).resolves.toBeUndefined();
  });
});

// ── Mock mode — signOut ──────────────────────────────────────────────────────

describe('signOut (mock mode)', () => {
  it('resolves without error', async () => {
    await expect(signOut()).resolves.toBeUndefined();
  });
});

// ── DEV_OTP constant ─────────────────────────────────────────────────────────

describe('DEV_OTP', () => {
  it('is a 6-digit string', () => {
    expect(DEV_OTP).toMatch(/^\d{6}$/);
  });

  it('equals "000000"', () => {
    expect(DEV_OTP).toBe('000000');
  });
});
