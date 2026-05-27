import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CITIES, DEFAULT_CITY } from '@/data/cities';
import type { City } from '@/data/cities';

const STORAGE_KEY = '@litoral_na_palma:city';

interface CityContextValue {
  city: City;
  setCity: (city: City) => void;
}

const CityContext = createContext<CityContextValue>({
  city: DEFAULT_CITY,
  setCity: () => {},
});

export function CityProvider({ children }: { children: ReactNode }) {
  const [city, setCityState] = useState<City>(DEFAULT_CITY);

  // Restaura preferência salva ao iniciar
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((id) => {
        if (id) {
          const found = CITIES.find((c) => c.id === id);
          if (found) setCityState(found);
        }
      })
      .catch(() => {});
  }, []);

  function setCity(next: City) {
    setCityState(next);
    AsyncStorage.setItem(STORAGE_KEY, next.id).catch(() => {});
  }

  return (
    <CityContext.Provider value={{ city, setCity }}>
      {children}
    </CityContext.Provider>
  );
}

export function useCity() {
  return useContext(CityContext);
}
