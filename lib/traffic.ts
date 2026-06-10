/**
 * Integração com a Google Maps Routes API v2 via Edge Function proxy.
 *
 * A chave da API fica em `GOOGLE_ROUTES_KEY` como secret da Edge Function
 * (nunca no bundle do app). O app chama `supabase.functions.invoke('routes-proxy')`.
 *
 * Sem Supabase configurado, retorna objeto vazio — fetchTraffic em api.ts cai no mock.
 */

import { supabase } from '@/lib/supabase';
import type { TrafficLevel } from '@/lib/types';
import type { HighwayStatic } from '@/data/cities';

interface RouteResult {
  level: TrafficLevel;
  travelTime: number; // minutos
}

/**
 * Busca dados de trânsito real via proxy server-side.
 * Retorna objeto vazio se Supabase não estiver configurado ou se a chamada falhar.
 */
export async function fetchGoogleTraffic(
  highways: HighwayStatic[]
): Promise<Partial<Record<string, RouteResult>>> {
  if (!supabase || highways.length === 0) return {};

  const { data, error } = await supabase.functions.invoke('routes-proxy', {
    body: { highwayIds: highways.map((h) => h.id) },
  });

  if (error || !data) return {};
  return data as Partial<Record<string, RouteResult>>;
}
