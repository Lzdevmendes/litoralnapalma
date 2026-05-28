// Tipos estáticos para configuração de cidade.
// Os tipos completos com campos dinâmicos (Beach, UPA, TrafficRoute) ficam em lib/types.ts.

export type FuelType = 'gasolina' | 'etanol' | 'diesel' | 'gnv';

export interface FuelPrice {
  type: FuelType;
  price: number;     // R$/L (ou R$/m³ para GNV)
  updatedAt: string; // ISO date string
}

export interface GasStation {
  id: string;
  name: string;
  brand: string;
  address: string;
  lat: number;
  lng: number;
  fuels: FuelPrice[];
}

export interface BeachAmenities {
  banheiros: boolean;
  quiosques: boolean;
  estacionamento: boolean;
}

export interface BeachStatic {
  id: string;
  name: string;
  waterQuality: 'boa' | 'regular' | 'impropia';
  lat: number;
  lng: number;
  amenities: BeachAmenities;
}

export interface UPAStatic {
  id: string;
  name: string;
  city: string; // city id
  region: 'centro' | 'sul' | 'norte';
  address: string;
  lat: number;
  lng: number;
}

export interface HighwayStatic {
  id: string;
  name: string;
  shortName: string;
  distance: number; // km
  typicalTravelTime: number; // minutos em condições normais
}

export interface FeiraLivre {
  day: string;      // "Sáb", "Qua"
  location: string; // local da feira
  hours: string;    // "6h–13h"
}

export interface PasseioBarco {
  name: string;
  departures: string; // "8h e 14h"
}

export interface CityServices {
  feiraLivre: FeiraLivre[];
  trilhasCount: number;
  trilhasHighlight: string; // destaque curto para a sub-label
  passeiosBarco: PasseioBarco[];
  temBalsa: boolean; // true apenas para Ilhabela e São Sebastião
}

export interface City {
  id: string;
  name: string;
  state: string;
  center: { lat: number; lng: number };
  zoom: number;
  beaches: BeachStatic[];
  upas: UPAStatic[];
  highways: HighwayStatic[];
  services: CityServices;
  gasStations: GasStation[];
}

export const CITIES: City[] = [
  {
    id: 'caraguatatuba',
    name: 'Caraguatatuba',
    state: 'SP',
    center: { lat: -23.6201, lng: -45.4129 },
    zoom: 12,
    beaches: [
      { id: 'martim-de-sa',  name: 'Martim de Sá',       waterQuality: 'boa',     lat: -23.5936, lng: -45.3698, amenities: { banheiros: true,  quiosques: true,  estacionamento: true  } },
      { id: 'indaia',        name: 'Praia do Indaiá',     waterQuality: 'boa',     lat: -23.6151, lng: -45.4012, amenities: { banheiros: true,  quiosques: true,  estacionamento: true  } },
      { id: 'cocanha',       name: 'Praia de Cocanha',    waterQuality: 'boa',     lat: -23.6490, lng: -45.4218, amenities: { banheiros: true,  quiosques: true,  estacionamento: true  } },
      { id: 'massaguacu',    name: 'Massaguaçu',          waterQuality: 'boa',     lat: -23.5621, lng: -45.3291, amenities: { banheiros: true,  quiosques: false, estacionamento: true  } },
      { id: 'porto-novo',    name: 'Porto Novo',          waterQuality: 'regular', lat: -23.6312, lng: -45.4091, amenities: { banheiros: true,  quiosques: true,  estacionamento: true  } },
    ],
    upas: [
      {
        id: 'upa-caraguatatuba',
        name: 'UPA 24h Caraguatatuba',
        city: 'caraguatatuba',
        region: 'centro',
        address: 'Av. Adhemar de Barros, 1289 - Centro, Caraguatatuba',
        lat: -23.6201,
        lng: -45.4129,
      },
    ],
    highways: [
      { id: 'rio-santos',         name: 'Rodovia Rio-Santos (SP-055)',     shortName: 'Rio-Santos', distance: 18.5, typicalTravelTime: 25 },
      { id: 'tamoios',            name: 'Rodovia dos Tamoios (SP-099)',    shortName: 'Tamoios',    distance: 82,   typicalTravelTime: 55 },
      { id: 'centro-caraguatuba', name: 'Centro de Caraguatatuba',        shortName: 'Centro',     distance: 5.2,  typicalTravelTime: 10 },
    ],
    services: {
      feiraLivre: [
        { day: 'Sáb', location: 'Orla do Porto', hours: '6h–13h' },
        { day: 'Qua', location: 'Bairro do Indaiá', hours: '6h–12h' },
      ],
      trilhasCount: 6,
      trilhasHighlight: 'Serra do Mar',
      passeiosBarco: [{ name: 'Enseadas e ilhotas', departures: '9h e 15h' }],
      temBalsa: false,
    },
    gasStations: [
      {
        id: 'posto-ipiranga-centro-cara',
        name: 'Ipiranga Centro',
        brand: 'Ipiranga',
        address: 'Av. Adhemar de Barros, 980 - Centro, Caraguatatuba',
        lat: -23.6198,
        lng: -45.4135,
        fuels: [
          { type: 'gasolina', price: 6.59, updatedAt: '2026-05-28' },
          { type: 'etanol',   price: 4.59, updatedAt: '2026-05-28' },
          { type: 'diesel',   price: 6.29, updatedAt: '2026-05-28' },
        ],
      },
      {
        id: 'posto-shell-indaia-cara',
        name: 'Shell Indaiá',
        brand: 'Shell',
        address: 'Av. Dr. Paulo Figueiredo, 320 - Indaiá, Caraguatatuba',
        lat: -23.6148,
        lng: -45.4008,
        fuels: [
          { type: 'gasolina', price: 6.69, updatedAt: '2026-05-28' },
          { type: 'etanol',   price: 4.79, updatedAt: '2026-05-28' },
          { type: 'diesel',   price: 6.39, updatedAt: '2026-05-28' },
        ],
      },
      {
        id: 'posto-petrobras-massaguacu',
        name: 'Petrobras Massaguaçu',
        brand: 'Petrobras',
        address: 'Rod. Rio-Santos, km 156 - Massaguaçu, Caraguatatuba',
        lat: -23.5618,
        lng: -45.3285,
        fuels: [
          { type: 'gasolina', price: 6.49, updatedAt: '2026-05-28' },
          { type: 'etanol',   price: 4.49, updatedAt: '2026-05-28' },
          { type: 'diesel',   price: 6.19, updatedAt: '2026-05-28' },
          { type: 'gnv',      price: 3.85, updatedAt: '2026-05-28' },
        ],
      },
    ],
  },

  {
    id: 'sao-sebastiao',
    name: 'São Sebastião',
    state: 'SP',
    center: { lat: -23.780, lng: -45.490 },
    zoom: 11,
    beaches: [
      { id: 'praia-grande-ss',       name: 'Praia Grande',            waterQuality: 'boa',     lat: -23.8198, lng: -45.4072, amenities: { banheiros: true,  quiosques: true,  estacionamento: true  } },
      { id: 'maresias',              name: 'Maresias',                waterQuality: 'boa',     lat: -23.8004, lng: -45.5313, amenities: { banheiros: true,  quiosques: true,  estacionamento: true  } },
      { id: 'boicucanga',            name: 'Boiçucanga',              waterQuality: 'boa',     lat: -23.8133, lng: -45.5706, amenities: { banheiros: true,  quiosques: true,  estacionamento: true  } },
      { id: 'camburi',               name: 'Camburi',                 waterQuality: 'boa',     lat: -23.7672, lng: -45.5879, amenities: { banheiros: true,  quiosques: true,  estacionamento: false } },
      { id: 'juquei',                name: 'Juqueí',                  waterQuality: 'boa',     lat: -23.7712, lng: -45.4891, amenities: { banheiros: false, quiosques: true,  estacionamento: true  } },
      { id: 'barra-do-sahy',         name: 'Barra do Sahy',           waterQuality: 'boa',     lat: -23.7915, lng: -45.5102, amenities: { banheiros: false, quiosques: false, estacionamento: true  } },
      { id: 'boraceia',              name: 'Boracéia',                waterQuality: 'boa',     lat: -23.7127, lng: -45.4451, amenities: { banheiros: true,  quiosques: true,  estacionamento: true  } },
      { id: 'toque-toque-pequeno',   name: 'Toque-Toque Pequeno',     waterQuality: 'boa',     lat: -23.7826, lng: -45.5197, amenities: { banheiros: false, quiosques: true,  estacionamento: false } },
      { id: 'ss-centro',             name: 'Praia de São Sebastião',  waterQuality: 'regular', lat: -23.8090, lng: -45.4080, amenities: { banheiros: true,  quiosques: true,  estacionamento: true  } },
    ],
    upas: [
      {
        id: 'upa-sao-sebastiao',
        name: 'UPA São Sebastião',
        city: 'sao-sebastiao',
        region: 'centro',
        address: 'R. João Lino da Silva, 250 - Topolândia, São Sebastião',
        lat: -23.7957,
        lng: -45.4082,
      },
    ],
    highways: [
      { id: 'rio-santos-norte',  name: 'Rio-Santos Norte (SP-055)',          shortName: 'Rio-Santos N', distance: 22, typicalTravelTime: 30 },
      { id: 'rio-santos-sul',    name: 'Rio-Santos Sul (SP-055)',            shortName: 'Rio-Santos S', distance: 15, typicalTravelTime: 20 },
      { id: 'acesso-porto-ss',   name: 'Acesso ao Porto de São Sebastião',   shortName: 'Porto',        distance: 4,  typicalTravelTime: 8  },
      { id: 'centro-ss',         name: 'Centro de São Sebastião',            shortName: 'Centro',       distance: 8,  typicalTravelTime: 12 },
    ],
    services: {
      feiraLivre: [
        { day: 'Sáb', location: 'Mercadão (Centro)', hours: '6h–13h' },
      ],
      trilhasCount: 8,
      trilhasHighlight: 'Costão · Lagoa dos Bambus',
      passeiosBarco: [{ name: 'Montão de Trigo', departures: '8h e 14h' }],
      temBalsa: true,
    },
    gasStations: [
      {
        id: 'posto-br-ss-centro',
        name: 'BR São Sebastião',
        brand: 'BR',
        address: 'Av. Guarda Mor Lobo Viana, 1220 - Centro, São Sebastião',
        lat: -23.8092,
        lng: -45.4082,
        fuels: [
          { type: 'gasolina', price: 6.64, updatedAt: '2026-05-28' },
          { type: 'etanol',   price: 4.69, updatedAt: '2026-05-28' },
          { type: 'diesel',   price: 6.34, updatedAt: '2026-05-28' },
        ],
      },
      {
        id: 'posto-shell-maresias',
        name: 'Shell Maresias',
        brand: 'Shell',
        address: 'Rod. Rio-Santos, km 84 - Maresias, São Sebastião',
        lat: -23.8001,
        lng: -45.5318,
        fuels: [
          { type: 'gasolina', price: 6.74, updatedAt: '2026-05-28' },
          { type: 'etanol',   price: 4.84, updatedAt: '2026-05-28' },
          { type: 'diesel',   price: 6.44, updatedAt: '2026-05-28' },
        ],
      },
      {
        id: 'posto-ipiranga-boicucanga',
        name: 'Ipiranga Boiçucanga',
        brand: 'Ipiranga',
        address: 'Rod. Rio-Santos, km 73 - Boiçucanga, São Sebastião',
        lat: -23.8130,
        lng: -45.5709,
        fuels: [
          { type: 'gasolina', price: 6.54, updatedAt: '2026-05-28' },
          { type: 'etanol',   price: 4.54, updatedAt: '2026-05-28' },
          { type: 'diesel',   price: 6.24, updatedAt: '2026-05-28' },
          { type: 'gnv',      price: 3.79, updatedAt: '2026-05-28' },
        ],
      },
    ],
  },

  {
    id: 'ubatuba',
    name: 'Ubatuba',
    state: 'SP',
    center: { lat: -23.430, lng: -45.050 },
    zoom: 12,
    beaches: [
      { id: 'enseada',          name: 'Enseada',           waterQuality: 'boa', lat: -23.4957, lng: -45.1098, amenities: { banheiros: true,  quiosques: true,  estacionamento: true  } },
      { id: 'itamambuca',       name: 'Itamambuca',        waterQuality: 'boa', lat: -23.4094, lng: -45.0726, amenities: { banheiros: true,  quiosques: true,  estacionamento: true  } },
      { id: 'felix',            name: 'Praia Félix',       waterQuality: 'boa', lat: -23.4483, lng: -45.0857, amenities: { banheiros: false, quiosques: false, estacionamento: false } },
      { id: 'perequé-acu',      name: 'Perequê-Açú',       waterQuality: 'boa', lat: -23.4653, lng: -45.0975, amenities: { banheiros: true,  quiosques: true,  estacionamento: true  } },
      { id: 'prumirim',         name: 'Prumirim',          waterQuality: 'boa', lat: -23.3854, lng: -44.9998, amenities: { banheiros: false, quiosques: true,  estacionamento: true  } },
      { id: 'lagoinha',         name: 'Lagoinha',          waterQuality: 'boa', lat: -23.3598, lng: -44.9762, amenities: { banheiros: false, quiosques: false, estacionamento: false } },
      { id: 'saco-da-ribeira',  name: 'Saco da Ribeira',   waterQuality: 'boa', lat: -23.4862, lng: -45.0891, amenities: { banheiros: true,  quiosques: true,  estacionamento: true  } },
      { id: 'domingas-dias',    name: 'Domingas Dias',     waterQuality: 'boa', lat: -23.4220, lng: -45.0783, amenities: { banheiros: false, quiosques: true,  estacionamento: false } },
      { id: 'toninhas',         name: 'Toninhas',          waterQuality: 'boa', lat: -23.4413, lng: -45.0835, amenities: { banheiros: true,  quiosques: true,  estacionamento: true  } },
      { id: 'lazaro',           name: 'Praia do Lázaro',   waterQuality: 'boa', lat: -23.4012, lng: -44.9962, amenities: { banheiros: false, quiosques: false, estacionamento: false } },
      { id: 'picinguaba',       name: 'Picinguaba',        waterQuality: 'boa', lat: -23.3701, lng: -44.9401, amenities: { banheiros: true,  quiosques: true,  estacionamento: false } },
    ],
    upas: [
      {
        id: 'upa-ubatuba',
        name: 'UPA Ubatuba',
        city: 'ubatuba',
        region: 'centro',
        address: 'R. Dr. Paulo Virgílio Bastos, 93 - Centro, Ubatuba',
        lat: -23.4336,
        lng: -45.0838,
      },
    ],
    highways: [
      { id: 'rio-santos-uba',  name: 'Rio-Santos (SP-055)',              shortName: 'Rio-Santos',   distance: 30, typicalTravelTime: 40 },
      { id: 'tamoios-norte',   name: 'Rodovia dos Tamoios Norte (SP-099)', shortName: 'Tamoios N',  distance: 45, typicalTravelTime: 50 },
      { id: 'oswaldo-cruz',    name: 'Oswaldo Cruz (SP-125)',             shortName: 'Oswaldo Cruz', distance: 65, typicalTravelTime: 70 },
      { id: 'centro-uba',      name: 'Centro de Ubatuba',                shortName: 'Centro',       distance: 6,  typicalTravelTime: 10 },
    ],
    services: {
      feiraLivre: [
        { day: 'Qua', location: 'Feira Central', hours: '7h–12h' },
        { day: 'Sáb', location: 'Orla do Perequê-Açú', hours: '7h–13h' },
      ],
      trilhasCount: 15,
      trilhasHighlight: 'Picinguaba · Bocaina',
      passeiosBarco: [{ name: 'Ilha Anchieta', departures: '8h e 14h' }],
      temBalsa: false,
    },
    gasStations: [
      {
        id: 'posto-ipiranga-uba-centro',
        name: 'Ipiranga Ubatuba',
        brand: 'Ipiranga',
        address: 'Av. Iperoig, 754 - Centro, Ubatuba',
        lat: -23.4340,
        lng: -45.0842,
        fuels: [
          { type: 'gasolina', price: 6.56, updatedAt: '2026-05-28' },
          { type: 'etanol',   price: 4.56, updatedAt: '2026-05-28' },
          { type: 'diesel',   price: 6.26, updatedAt: '2026-05-28' },
          { type: 'gnv',      price: 3.85, updatedAt: '2026-05-28' },
        ],
      },
      {
        id: 'posto-shell-enseada-uba',
        name: 'Shell Enseada',
        brand: 'Shell',
        address: 'Av. Leovegildo Dias Vieira, 1240 - Enseada, Ubatuba',
        lat: -23.4960,
        lng: -45.1105,
        fuels: [
          { type: 'gasolina', price: 6.66, updatedAt: '2026-05-28' },
          { type: 'etanol',   price: 4.76, updatedAt: '2026-05-28' },
          { type: 'diesel',   price: 6.36, updatedAt: '2026-05-28' },
        ],
      },
      {
        id: 'posto-br-itamambuca',
        name: 'BR Itamambuca',
        brand: 'BR',
        address: 'Rod. Rio-Santos, km 39 - Itamambuca, Ubatuba',
        lat: -23.4097,
        lng: -45.0730,
        fuels: [
          { type: 'gasolina', price: 6.46, updatedAt: '2026-05-28' },
          { type: 'etanol',   price: 4.46, updatedAt: '2026-05-28' },
          { type: 'diesel',   price: 6.16, updatedAt: '2026-05-28' },
        ],
      },
    ],
  },

  {
    id: 'ilhabela',
    name: 'Ilhabela',
    state: 'SP',
    center: { lat: -23.790, lng: -45.365 },
    zoom: 12,
    beaches: [
      { id: 'portinho',      name: 'Portinho',        waterQuality: 'boa', lat: -23.7334, lng: -45.3412, amenities: { banheiros: true,  quiosques: true,  estacionamento: true  } },
      { id: 'jabaquara',     name: 'Jabaquara',        waterQuality: 'boa', lat: -23.7512, lng: -45.3445, amenities: { banheiros: true,  quiosques: true,  estacionamento: true  } },
      { id: 'juliao',        name: 'Praia do Julião',  waterQuality: 'boa', lat: -23.7643, lng: -45.3498, amenities: { banheiros: false, quiosques: false, estacionamento: true  } },
      { id: 'perequê',       name: 'Perequê',          waterQuality: 'boa', lat: -23.7779, lng: -45.3526, amenities: { banheiros: true,  quiosques: true,  estacionamento: true  } },
      { id: 'feiticeira',    name: 'Feiticeira',       waterQuality: 'boa', lat: -23.7891, lng: -45.3623, amenities: { banheiros: true,  quiosques: true,  estacionamento: true  } },
      { id: 'pedras-miudas', name: 'Pedras Miúdas',    waterQuality: 'boa', lat: -23.8013, lng: -45.3572, amenities: { banheiros: false, quiosques: false, estacionamento: false } },
      { id: 'curral',        name: 'Praia do Curral',  waterQuality: 'boa', lat: -23.8237, lng: -45.3681, amenities: { banheiros: true,  quiosques: true,  estacionamento: false } },
      { id: 'viana',         name: 'Praia de Viana',   waterQuality: 'boa', lat: -23.8453, lng: -45.3801, amenities: { banheiros: false, quiosques: false, estacionamento: false } },
    ],
    upas: [
      // Ilhabela não possui UPA própria — referência: UPA São Sebastião (balsa + 30 min)
    ],
    highways: [
      { id: 'balsa',        name: 'Balsa São Sebastião–Ilhabela', shortName: 'Balsa',      distance: 5,  typicalTravelTime: 20 },
      { id: 'perimetral',   name: 'Perimetral Sul (SP-131)',       shortName: 'Perimetral', distance: 12, typicalTravelTime: 18 },
    ],
    services: {
      feiraLivre: [
        { day: 'Sáb', location: 'Mercado Municipal', hours: '7h–13h' },
      ],
      trilhasCount: 12,
      trilhasHighlight: 'Baepi · Cachoeira da Toca',
      passeiosBarco: [{ name: 'Volta à ilha', departures: '9h' }],
      temBalsa: true,
    },
    gasStations: [
      {
        id: 'posto-ipiranga-perequê-ilh',
        name: 'Ipiranga Perequê',
        brand: 'Ipiranga',
        address: 'R. Dom Sebastião Laranjo, 120 - Perequê, Ilhabela',
        lat: -23.7782,
        lng: -45.3530,
        fuels: [
          { type: 'gasolina', price: 6.79, updatedAt: '2026-05-28' },
          { type: 'etanol',   price: 4.89, updatedAt: '2026-05-28' },
          { type: 'diesel',   price: 6.49, updatedAt: '2026-05-28' },
        ],
      },
      {
        id: 'posto-shell-feiticeira-ilh',
        name: 'Shell Feiticeira',
        brand: 'Shell',
        address: 'Av. Princesa Isabel, 580 - Feiticeira, Ilhabela',
        lat: -23.7893,
        lng: -45.3628,
        fuels: [
          { type: 'gasolina', price: 6.89, updatedAt: '2026-05-28' },
          { type: 'etanol',   price: 4.99, updatedAt: '2026-05-28' },
          { type: 'diesel',   price: 6.59, updatedAt: '2026-05-28' },
        ],
      },
      {
        id: 'posto-br-vila-ilh',
        name: 'BR Vila',
        brand: 'BR',
        address: 'Av. Pedro Paulo de Moraes, 1840 - Vila, Ilhabela',
        lat: -23.7760,
        lng: -45.3514,
        fuels: [
          { type: 'gasolina', price: 6.69, updatedAt: '2026-05-28' },
          { type: 'etanol',   price: 4.79, updatedAt: '2026-05-28' },
          { type: 'diesel',   price: 6.39, updatedAt: '2026-05-28' },
          { type: 'gnv',      price: 3.95, updatedAt: '2026-05-28' },
        ],
      },
    ],
  },
];

export const DEFAULT_CITY: City = CITIES[0];
