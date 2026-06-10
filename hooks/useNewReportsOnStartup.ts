/**
 * Detecta reports novos desde a última abertura do app e retorna um contador.
 * Persiste o timestamp de "última visualização" em AsyncStorage.
 * Usado pelo dashboard para exibir um banner não-intrusivo.
 */
import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import type { City } from '@/data/cities';

const LAST_SEEN_KEY = '@litoral_na_palma:last_seen_reports';

interface NewReportsState {
  count: number;
  dismiss: () => void;
}

export function useNewReportsOnStartup(city: City): NewReportsState {
  const [count, setCount] = useState(0);
  const checkedRef = useRef(false);

  useEffect(() => {
    if (checkedRef.current) return;
    checkedRef.current = true;

    async function check() {
      if (!supabase) return;
      try {
        const raw = await AsyncStorage.getItem(LAST_SEEN_KEY);
        const lastSeen = raw ?? new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        const { data } = await supabase
          .from('reports')
          .select('id', { count: 'exact', head: false })
          .eq('city', city.id)
          .gt('created_at', lastSeen)
          .gt('expires_at', new Date().toISOString());

        if (data && data.length > 0) setCount(data.length);
      } catch {
        // silencia erros de rede — banner é bonus, não crítico
      }
    }

    check();
  }, [city.id]);

  function dismiss() {
    setCount(0);
    AsyncStorage.setItem(LAST_SEEN_KEY, new Date().toISOString()).catch(() => {});
  }

  return { count, dismiss };
}
