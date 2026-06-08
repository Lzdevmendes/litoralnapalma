import type { TrafficLevel, BeachOccupancy } from "./types";

export function trafficLevelColor(level: TrafficLevel): string {
  const map: Record<TrafficLevel, string> = {
    livre: "#22c55e",
    moderado: "#f59e0b",
    lento: "#f97316",
    parado: "#ef4444",
  };
  return map[level];
}

export function occupancyColor(occupancy: BeachOccupancy): string {
  const map: Record<BeachOccupancy, string> = {
    vazia: "#22c55e",
    moderada: "#f59e0b",
    lotada: "#ef4444",
  };
  return map[occupancy];
}

export function occupancyLabel(occupancy: BeachOccupancy, locale: 'pt' | 'en' = 'pt'): string {
  const labels: Record<'pt' | 'en', Record<BeachOccupancy, string>> = {
    pt: { vazia: 'Vazia', moderada: 'Moderada', lotada: 'Lotada' },
    en: { vazia: 'Empty', moderada: 'Moderate', lotada: 'Crowded' },
  };
  return labels[locale][occupancy];
}

export function formatWaitTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

export function timeAgo(dateStr: string, locale: 'pt' | 'en' = 'pt'): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (locale === 'en') {
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins} min ago`;
    return `${Math.floor(mins / 60)}h ago`;
  }
  if (mins < 1) return 'agora';
  if (mins < 60) return `há ${mins} min`;
  return `há ${Math.floor(mins / 60)}h`;
}

/**
 * Calcula a distância em km entre dois pontos geográficos (fórmula de Haversine).
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Formata distância em metros ou km com 1 casa decimal. */
export function formatDistance(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`;
}

/**
 * Gera URL de navegação para o Maps nativo da plataforma.
 * Coordenadas são SEMPRE primárias — garantem posição exata independente de nome.
 * O `name` + `city` aparecem apenas como rótulo do pin, não como busca.
 *
 * iOS:     maps://?ll=lat,lng&q=rótulo → abre nas coordenadas exatas; q= é só o rótulo do pin
 *          (atenção: `maps:` SEM as `//` não é o esquema registrado pelo Apple Maps —
 *          o iOS repassa a query inteira como string opaca e o app busca por ela, caindo
 *          em local aleatório/sem sentido)
 * Android: geo:lat,lng?q=lat,lng(rótulo) → coordenada exata; nome entre parênteses como rótulo
 * Web:     ?q=lat,lng&z=17 → pin direto nas coordenadas, zoom de rua
 */
export function mapsNavigationUrl(
  lat: number,
  lng: number,
  name: string,
  city?: string,
  state = 'SP',
): string {
  const label = city ? `${name}, ${city}, ${state}` : name;
  const os = process.env.EXPO_OS;
  if (os === 'ios') {
    // maps:// (com barras) é o esquema registrado pelo Apple Maps — abre exatamente
    // nas coordenadas de `ll` e exibe `label` apenas como rótulo do pin
    return `maps://?ll=${lat},${lng}&q=${encodeURIComponent(label)}`;
  }
  if (os === 'android') {
    // geo: coordenada exata; nome entre parênteses é rótulo do pin no Google Maps
    return `geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(label)})`;
  }
  // Web: pin nas coordenadas exatas com zoom 17 (nível de rua/praia)
  return `https://maps.google.com/?q=${lat},${lng}&z=17`;
}
