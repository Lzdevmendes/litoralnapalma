import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@litoral_na_palma:favorites';

interface Favorites {
  beaches: string[];
  highways: string[];
}

const DEFAULT: Favorites = { beaches: [], highways: [] };

async function loadFavorites(): Promise<Favorites> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Favorites) : DEFAULT;
  } catch {
    return DEFAULT;
  }
}

async function saveFavorites(fav: Favorites): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(fav));
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorites>(DEFAULT);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadFavorites().then((f) => {
      setFavorites(f);
      setLoaded(true);
    });
  }, []);

  const toggleBeach = useCallback(async (beachId: string) => {
    setFavorites((prev) => {
      const next = prev.beaches.includes(beachId)
        ? { ...prev, beaches: prev.beaches.filter((id) => id !== beachId) }
        : { ...prev, beaches: [...prev.beaches, beachId] };
      saveFavorites(next).catch(() => {});
      return next;
    });
  }, []);

  const toggleHighway = useCallback(async (highwayId: string) => {
    setFavorites((prev) => {
      const next = prev.highways.includes(highwayId)
        ? { ...prev, highways: prev.highways.filter((id) => id !== highwayId) }
        : { ...prev, highways: [...prev.highways, highwayId] };
      saveFavorites(next).catch(() => {});
      return next;
    });
  }, []);

  const isBeachFavorite = useCallback(
    (beachId: string) => favorites.beaches.includes(beachId),
    [favorites.beaches],
  );

  const isHighwayFavorite = useCallback(
    (highwayId: string) => favorites.highways.includes(highwayId),
    [favorites.highways],
  );

  return { favorites, loaded, toggleBeach, toggleHighway, isBeachFavorite, isHighwayFavorite };
}
