/**
 * Contexto de autenticação.
 *
 * Com Supabase configurado:
 *   - Escuta `onAuthStateChange` para sincronizar sessão automaticamente
 *   - Supabase persiste o token via AsyncStorage (configurado em lib/supabase.ts)
 *   - SecureStore guarda o AuthUser serializado como cache rápido de UI
 *
 * Sem Supabase (dev/mock):
 *   - Sessão persiste apenas via SecureStore (comportamento anterior)
 */

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { type AuthUser } from '@/lib/auth';

const STORAGE_KEY = 'litoral_na_palma_auth_user';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  setUser: (user: AuthUser | null) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── SecureStore helpers ──────────────────────────────────────────────────────

async function readSession(): Promise<AuthUser | null> {
  try {
    const raw = await SecureStore.getItemAsync(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

async function writeSession(user: AuthUser | null): Promise<void> {
  try {
    if (user) {
      await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(user));
    } else {
      await SecureStore.deleteItemAsync(STORAGE_KEY);
    }
  } catch {
    // SecureStore pode falhar em emuladores sem secure hardware — ignora silenciosamente
  }
}

function supabaseSessionToAuthUser(sbUser: {
  id: string;
  email?: string | null;
  phone?: string | null;
  user_metadata?: Record<string, unknown>;
}): AuthUser {
  const meta = sbUser.user_metadata ?? {};
  return {
    id: sbUser.id,
    name:
      (meta.full_name as string | undefined) ??
      (meta.name as string | undefined) ??
      sbUser.email?.split('@')[0] ??
      'Usuário',
    email: sbUser.email ?? undefined,
    phone: sbUser.phone ?? undefined,
    photoUrl: (meta.avatar_url as string | undefined) ?? undefined,
  };
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      // 1) Sessão ativa no Supabase (token no AsyncStorage)
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const u = supabaseSessionToAuthUser(session.user);
          setUserState(u);
          writeSession(u);
        } else {
          // Sem sessão Supabase — tenta cache local como fallback
          readSession().then((cached) => setUserState(cached));
        }
        setIsLoading(false);
      });

      // 2) Escuta mudanças de sessão (login, logout, token refresh)
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const u = supabaseSessionToAuthUser(session.user);
          setUserState(u);
          writeSession(u);
        } else {
          setUserState(null);
          writeSession(null);
        }
      });

      return () => subscription.unsubscribe();
    } else {
      // Modo mock — apenas SecureStore
      readSession()
        .then((u) => setUserState(u))
        .finally(() => setIsLoading(false));
    }
  }, []);

  async function setUser(u: AuthUser | null) {
    setUserState(u);
    await writeSession(u);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de AuthProvider');
  return ctx;
}
