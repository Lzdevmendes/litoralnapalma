import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserMode } from '@/lib/types';

const STORAGE_KEY = '@litoral_na_palma:user_mode';

interface UserModeContextValue {
  mode: UserMode;
  setMode: (mode: UserMode) => void;
}

const UserModeContext = createContext<UserModeContextValue>({
  mode: 'morador',
  setMode: () => {},
});

export function UserModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<UserMode>('morador');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === 'morador' || stored === 'turista') setModeState(stored);
    });
  }, []);

  function setMode(m: UserMode) {
    setModeState(m);
    AsyncStorage.setItem(STORAGE_KEY, m);
  }

  return (
    <UserModeContext.Provider value={{ mode, setMode }}>
      {children}
    </UserModeContext.Provider>
  );
}

export function useUserMode() {
  return useContext(UserModeContext);
}
