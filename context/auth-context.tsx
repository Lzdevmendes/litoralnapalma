import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import type { AuthUser } from '@/lib/auth';

/**
 * Armazenamento seguro para dados de sessão do usuário.
 * expo-secure-store usa Keychain (iOS) / Keystore (Android) — criptografado pelo SO.
 * Limite de ~2KB por chave; objeto AuthUser fica bem abaixo disso.
 */
const STORAGE_KEY = 'litoral_na_palma_auth_user';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  setUser: (user: AuthUser | null) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function readSession(): Promise<AuthUser | null> {
  try {
    const raw = await SecureStore.getItemAsync(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

async function writeSession(user: AuthUser | null): Promise<void> {
  if (user) {
    await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(user));
  } else {
    await SecureStore.deleteItemAsync(STORAGE_KEY);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    readSession()
      .then((u) => setUserState(u))
      .finally(() => setIsLoading(false));
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
