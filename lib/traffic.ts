/**
 * Integração com a Google Maps Routes API v2 para dados de trânsito em tempo real.
 *
 * Documentação: https://developers.google.com/maps/documentation/routes
 * Requer chave configurada em EXPO_PUBLIC_GOOGLE_ROUTES_KEY.
 *
 * Sem a chave, retorna objeto vazio — fetchTraffic em api.ts cai no mock.
 */

import type { TrafficLevel } from '@/lib/types';
import type { HighwayStatic } from '@/data/cities';

const GOOGLE_ROUTES_URL =
  'https://routes.googleapis.com/directions/v2:computeRoutes';

const GOOGLE_KEY = process.env.EXPO_PUBLIC_GOOGLE_ROUTES_KEY;

interface RouteEndpoints {
  origin: { lat: number; lng: number };
  dest: { lat: number; lng: number };
}

/**
 * Coordenadas de origem e destino para cada rodovia monitorada.
 * Cobre todas as highways definidas em data/cities.ts.
 */
const HIGHWAY_ENDPOINTS: Record<string, RouteEndpoints> = {
  // Caraguatatuba
  'rio-santos':         { origin: { lat: -23.7957, lng: -45.4082 }, dest: { lat: -23.6201, lng: -45.4129 } },
  'tamoios':            { origin: { lat: -23.6201, lng: -45.4129 }, dest: { lat: -23.1794, lng: -45.8869 } },
  // São Sebastião
  'rio-santos-norte':   { origin: { lat: -23.7957, lng: -45.4082 }, dest: { lat: -23.6201, lng: -45.4129 } },
  'rio-santos-sul':     { origin: { lat: -23.8500, lng: -45.4500 }, dest: { lat: -23.7957, lng: -45.4082 } },
  // Ubatuba
  'rio-santos-uba':     { origin: { lat: -23.4336, lng: -45.0838 }, dest: { lat: -23.7957, lng: -45.4082 } },
  'tamoios-norte':      { origin: { lat: -23.1794, lng: -45.8869 }, dest: { lat: -23.4336, lng: -45.0838 } },
  'oswaldo-cruz':       { origin: { lat: -23.4336, lng: -45.0838 }, dest: { lat: -23.1909, lng: -45.9012 } },
  // São Sebastião — Acesso ao Porto
  'acesso-porto-ss':    { origin: { lat: -23.8090, lng: -45.4080 }, dest: { lat: -23.8115, lng: -45.4139 } },
  // Ilhabela
  'balsa':              { origin: { lat: -23.7957, lng: -45.4082 }, dest: { lat: -23.7779, lng: -45.3526 } },
  'perimetral':         { origin: { lat: -23.7779, lng: -45.3526 }, dest: { lat: -23.8453, lng: -45.3801 } },
};

/**
 * Converte a razão atual/sem-trânsito em nível de congestionamento.
 * Thresholds conforme especificação da LIT-15.
 */
function ratioToLevel(ratio: number): TrafficLevel {
  if (ratio < 1.1) return 'livre';
  if (ratio < 1.4) return 'moderado';
  if (ratio < 1.8) return 'lento';
  return 'parado';
}

interface RouteResult {
  level: TrafficLevel;
  travelTime: number; // minutos
}

interface GoogleRoutesResponse {
  routes?: Array<{
    duration: string;       // ex: "1234s"
    staticDuration: string; // ex: "987s"
  }>;
}

async function fetchSingleRoute(highwayId: string): Promise<RouteResult | null> {
  const endpoints = HIGHWAY_ENDPOINTS[highwayId];
  if (!endpoints) return null;

  const res = await fetch(GOOGLE_ROUTES_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_KEY!,
      'X-Goog-FieldMask': 'routes.duration,routes.staticDuration',
    },
    body: JSON.stringify({
      origin: {
        location: { latLng: { latitude: endpoints.origin.lat, longitude: endpoints.origin.lng } },
      },
      destination: {
        location: { latLng: { latitude: endpoints.dest.lat, longitude: endpoints.dest.lng } },
      },
      travelMode: 'DRIVE',
      routingPreference: 'TRAFFIC_AWARE',
    }),
  });

  if (!res.ok) throw new Error(`Google Routes API error: ${res.status}`);

  const json = (await res.json()) as GoogleRoutesResponse;
  const route = json.routes?.[0];
  if (!route) return null;

  // A API retorna duração no formato "NNs" (segundos como string)
  const duration = parseInt(route.duration.replace('s', ''), 10);
  const staticDuration = parseInt(route.staticDuration.replace('s', ''), 10);
  const ratio = staticDuration > 0 ? duration / staticDuration : 1;

  return {
    level: ratioToLevel(ratio),
    travelTime: Math.round(duration / 60),
  };
}

/**
 * Busca dados de trânsito real para todas as rodovias fornecidas.
 * Retorna objeto vazio se EXPO_PUBLIC_GOOGLE_ROUTES_KEY não estiver configurada.
 * Rotas sem endpoint mapeado ou com erro são silenciosamente ignoradas.
 */
export async function fetchGoogleTraffic(
  highways: HighwayStatic[]
): Promise<Partial<Record<string, RouteResult>>> {
  if (!GOOGLE_KEY) return {};

  const settled = await Promise.allSettled(
    highways.map(async (h) => ({ id: h.id, data: await fetchSingleRoute(h.id) }))
  );

  const out: Partial<Record<string, RouteResult>> = {};
  for (const r of settled) {
    if (r.status === 'fulfilled' && r.value.data) {
      out[r.value.id] = r.value.data;
    }
  }
  return out;
}
