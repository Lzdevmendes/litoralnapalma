import type {
  TrafficRoute,
  Beach,
  UPA,
  WeatherData,
  SideRoute,
  Report,
} from "@/lib/types";

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

export function getMockTraffic(): TrafficRoute[] {
  return [
    {
      id: "rio-santos",
      name: "Rodovia Rio-Santos (BR-101)",
      shortName: "Rio-Santos",
      level: pickRandom(["livre", "moderado", "lento", "parado"] as const, [
        20, 40, 25, 15,
      ]),
      travelTime: 25 + Math.floor(Math.random() * 35),
      distance: 18.5,
      updatedAt: new Date().toISOString(),
    },
    {
      id: "tamoios",
      name: "Rodovia dos Tamoios (SP-099)",
      shortName: "Tamoios",
      level: pickRandom(["livre", "moderado", "lento", "parado"] as const, [
        30, 35, 20, 15,
      ]),
      travelTime: 40 + Math.floor(Math.random() * 50),
      distance: 82,
      updatedAt: new Date().toISOString(),
    },
    {
      id: "centro-caraguá",
      name: "Centro de Caraguatatuba",
      shortName: "Centro",
      level: pickRandom(["livre", "moderado", "lento"] as const, [25, 45, 30]),
      travelTime: 8 + Math.floor(Math.random() * 20),
      distance: 5.2,
      updatedAt: new Date().toISOString(),
    },
  ];
}

export function getMockBeaches(): Beach[] {
  return [
    {
      id: "martim-de-sa",
      name: "Martim de Sá",
      occupancy: pickRandom(
        ["vazia", "moderada", "lotada"] as const,
        [15, 35, 50]
      ),
      occupancyPercent: 40 + Math.floor(Math.random() * 60),
      waterQuality: "boa",
      wavesHeight: 0.5 + Math.random() * 1.5,
      lat: -23.5936,
      lng: -45.3698,
      updatedAt: new Date().toISOString(),
    },
    {
      id: "indaia",
      name: "Praia do Indaiá",
      occupancy: pickRandom(
        ["vazia", "moderada", "lotada"] as const,
        [20, 40, 40]
      ),
      occupancyPercent: 30 + Math.floor(Math.random() * 50),
      waterQuality: "boa",
      wavesHeight: 0.3 + Math.random() * 1.0,
      lat: -23.6151,
      lng: -45.4012,
      updatedAt: new Date().toISOString(),
    },
    {
      id: "cocanha",
      name: "Praia de Cocanha",
      occupancy: pickRandom(
        ["vazia", "moderada", "lotada"] as const,
        [30, 40, 30]
      ),
      occupancyPercent: 20 + Math.floor(Math.random() * 40),
      waterQuality: "boa",
      wavesHeight: 0.4 + Math.random() * 1.2,
      lat: -23.6490,
      lng: -45.4218,
      updatedAt: new Date().toISOString(),
    },
    {
      id: "massaguacu",
      name: "Massaguaçu",
      occupancy: pickRandom(
        ["vazia", "moderada", "lotada"] as const,
        [25, 35, 40]
      ),
      occupancyPercent: 35 + Math.floor(Math.random() * 55),
      waterQuality: "boa",
      wavesHeight: 0.6 + Math.random() * 1.8,
      lat: -23.5621,
      lng: -45.3291,
      updatedAt: new Date().toISOString(),
    },
    {
      id: "porto-novo",
      name: "Porto Novo",
      occupancy: pickRandom(
        ["vazia", "moderada", "lotada"] as const,
        [20, 50, 30]
      ),
      occupancyPercent: 25 + Math.floor(Math.random() * 45),
      waterQuality: "regular",
      wavesHeight: 0.3 + Math.random() * 0.8,
      lat: -23.6312,
      lng: -45.4091,
      updatedAt: new Date().toISOString(),
    },
  ];
}

export function getMockUPAs(): UPA[] {
  return [
    {
      id: "upa-caraguatatuba",
      name: "UPA 24h Caraguatatuba",
      city: "caraguatatuba",
      region: "centro",
      waitTime: 30 + Math.floor(Math.random() * 120),
      patientsWaiting: 5 + Math.floor(Math.random() * 30),
      status: pickRandom(
        ["normal", "alerta", "critico"] as const,
        [50, 35, 15]
      ),
      address: "Av. Adhemar de Barros, 1289 - Centro, Caraguatatuba",
      lat: -23.6201,
      lng: -45.4129,
    },
    {
      id: "upa-sao-sebastiao",
      name: "UPA São Sebastião",
      city: "sao-sebastiao",
      region: "centro",
      waitTime: 20 + Math.floor(Math.random() * 90),
      patientsWaiting: 3 + Math.floor(Math.random() * 20),
      status: pickRandom(
        ["normal", "alerta", "critico"] as const,
        [55, 30, 15]
      ),
      address: "R. João Lino da Silva, 250 - Topolândia, São Sebastião",
      lat: -23.7957,
      lng: -45.4082,
    },
    {
      id: "upa-ubatuba",
      name: "UPA Ubatuba",
      city: "ubatuba",
      region: "centro",
      waitTime: 15 + Math.floor(Math.random() * 60),
      patientsWaiting: 2 + Math.floor(Math.random() * 15),
      status: pickRandom(
        ["normal", "alerta", "critico"] as const,
        [60, 25, 15]
      ),
      address: "R. Dr. Paulo Virgílio Bastos, 93 - Centro, Ubatuba",
      lat: -23.4336,
      lng: -45.0838,
    },
    // Ilhabela não possui UPA própria — referência: UPA São Sebastião
  ];
}

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
    id: "praia-juqueí",
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

function pickRandom<T>(options: readonly T[], weights: number[]): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < options.length; i++) {
    r -= weights[i];
    if (r <= 0) return options[i];
  }
  return options[options.length - 1];
}
