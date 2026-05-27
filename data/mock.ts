import { CITIES } from './cities';
import type {
  TrafficRoute,
  Beach,
  UPA,
  WeatherData,
  SideRoute,
  Report,
} from "@/lib/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getCityData(cityId = 'caraguatatuba') {
  return CITIES.find((c) => c.id === cityId) ?? CITIES[0];
}

function pickRandom<T>(options: readonly T[], weights: number[]): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < options.length; i++) {
    r -= weights[i];
    if (r <= 0) return options[i];
  }
  return options[options.length - 1];
}

// ---------------------------------------------------------------------------
// Mock generators — derivam de cities.ts, adicionam campos dinâmicos
// ---------------------------------------------------------------------------

export function getMockWeather(): WeatherData {
  const conditions = ["ensolarado", "parcial", "nublado"] as const;
  return {
    temperature: 28 + Math.floor(Math.random() * 6),
    feelsLike: 31 + Math.floor(Math.random() * 4),
    humidity: 70 + Math.floor(Math.random() * 20),
    condition: conditions[Math.floor(Math.random() * conditions.length)],
    windSpeed: 10 + Math.floor(Math.random() * 15),
    uvIndex: 7 + Math.floor(Math.random() * 4),
    updatedAt: new Date().toISOString(),
  };
}

export function getMockTraffic(cityId?: string): TrafficRoute[] {
  const city = getCityData(cityId);
  return city.highways.map((h) => ({
    id: h.id,
    name: h.name,
    shortName: h.shortName,
    distance: h.distance,
    level: pickRandom(
      ["livre", "moderado", "lento", "parado"] as const,
      [25, 35, 25, 15]
    ),
    travelTime:
      h.typicalTravelTime +
      Math.floor(Math.random() * Math.ceil(h.typicalTravelTime * 0.6)),
    updatedAt: new Date().toISOString(),
  }));
}

export function getMockBeaches(cityId?: string): Beach[] {
  const city = getCityData(cityId);
  return city.beaches.map((b) => ({
    ...b,
    occupancy: pickRandom(
      ["vazia", "moderada", "lotada"] as const,
      [20, 40, 40]
    ),
    occupancyPercent: 15 + Math.floor(Math.random() * 75),
    wavesHeight: parseFloat((0.3 + Math.random() * 1.8).toFixed(1)),
    updatedAt: new Date().toISOString(),
  }));
}

export function getMockUPAs(): UPA[] {
  return CITIES.flatMap((city) =>
    city.upas.map((u) => ({
      ...u,
      waitTime: 20 + Math.floor(Math.random() * 100),
      patientsWaiting: 3 + Math.floor(Math.random() * 25),
      status: pickRandom(
        ["normal", "alerta", "critico"] as const,
        [55, 30, 15]
      ),
    }))
  );
}

// ---------------------------------------------------------------------------
// Dados estáticos (não dependem de cidade)
// ---------------------------------------------------------------------------

export const SIDE_ROUTES: SideRoute[] = [
  {
    id: "cachoeira-sete-quedas",
    name: "Cachoeira Sete Quedas",
    description: "Cachoeira escondida na Mata Atlântica, água cristalina.",
    type: "cachoeira",
    distance: 28,
    estimatedTime: 45,
    difficulty: "moderado",
    tags: ["natureza", "aventura", "fresco"],
    lat: -23.5542,
    lng: -45.3198,
  },
  {
    id: "trilha-jetuba",
    name: "Trilha do Jetuba",
    description: "Vista panorâmica do litoral norte e Serra do Mar.",
    type: "trilha",
    distance: 15,
    estimatedTime: 25,
    difficulty: "fácil",
    tags: ["natureza", "vista", "fácil"],
    lat: -23.5312,
    lng: -45.3421,
  },
  {
    id: "praia-juquei",
    name: "Praia do Juqueí",
    description: "Praia tranquila perto de São Sebastião, geralmente vazia.",
    type: "praia",
    distance: 42,
    estimatedTime: 55,
    tags: ["praia", "tranquilo", "natureza"],
    lat: -23.7712,
    lng: -45.4891,
  },
  {
    id: "lagoa-azul",
    name: "Lagoa Azul",
    description: "Lagoa de água doce ideal para stand-up paddle.",
    type: "praia",
    distance: 12,
    estimatedTime: 20,
    tags: ["água doce", "paddle", "relaxante"],
    lat: -23.5891,
    lng: -45.4012,
  },
];

export function getMockReports(): Report[] {
  return [
    {
      id: "r1",
      type: "lotacao_praia",
      description: "Martim de Sá super lotada",
      lat: -23.5936,
      lng: -45.3698,
      createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
      upvotes: 12,
    },
    {
      id: "r2",
      type: "acidente",
      description: "Acidente na Rio-Santos, km 178",
      lat: -23.602,
      lng: -45.38,
      createdAt: new Date(Date.now() - 32 * 60000).toISOString(),
      upvotes: 8,
    },
    {
      id: "r3",
      type: "blitz",
      description: "Blitz PRF na entrada da cidade",
      lat: -23.615,
      lng: -45.395,
      createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
      upvotes: 23,
    },
  ];
}
