// Tipos estáticos para configuração de cidade.
// Os tipos completos com campos dinâmicos (Beach, UPA, TrafficRoute) ficam em lib/types.ts.

export interface BeachStatic {
  id: string;
  name: string;
  waterQuality: 'boa' | 'regular' | 'impropia';
  lat: number;
  lng: number;
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

export interface City {
  id: string;
  name: string;
  state: string;
  center: { lat: number; lng: number };
  zoom: number;
  beaches: BeachStatic[];
  upas: UPAStatic[];
  highways: HighwayStatic[];
}

export const CITIES: City[] = [
  {
    id: 'caraguatatuba',
    name: 'Caraguatatuba',
    state: 'SP',
    center: { lat: -23.6201, lng: -45.4129 },
    zoom: 12,
    beaches: [
      { id: 'martim-de-sa',  name: 'Martim de Sá',       waterQuality: 'boa',     lat: -23.5936, lng: -45.3698 },
      { id: 'indaia',        name: 'Praia do Indaiá',     waterQuality: 'boa',     lat: -23.6151, lng: -45.4012 },
      { id: 'cocanha',       name: 'Praia de Cocanha',    waterQuality: 'boa',     lat: -23.6490, lng: -45.4218 },
      { id: 'massaguacu',    name: 'Massaguaçu',          waterQuality: 'boa',     lat: -23.5621, lng: -45.3291 },
      { id: 'porto-novo',    name: 'Porto Novo',          waterQuality: 'regular', lat: -23.6312, lng: -45.4091 },
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
  },

  {
    id: 'sao-sebastiao',
    name: 'São Sebastião',
    state: 'SP',
    center: { lat: -23.7957, lng: -45.4082 },
    zoom: 12,
    beaches: [
      { id: 'boicucanga',        name: 'Boiçucanga',               waterQuality: 'boa',     lat: -23.7780, lng: -45.4931 },
      { id: 'camburi',           name: 'Camburi',                  waterQuality: 'boa',     lat: -23.7165, lng: -45.4560 },
      { id: 'maresias',          name: 'Maresias',                 waterQuality: 'boa',     lat: -23.7950, lng: -45.5280 },
      { id: 'ss-centro',         name: 'Praia de São Sebastião',   waterQuality: 'regular', lat: -23.8090, lng: -45.4080 },
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
      { id: 'rio-santos-norte', name: 'Rio-Santos Norte (SP-055)', shortName: 'Rio-Santos N', distance: 22, typicalTravelTime: 30 },
      { id: 'rio-santos-sul',   name: 'Rio-Santos Sul (SP-055)',   shortName: 'Rio-Santos S', distance: 15, typicalTravelTime: 20 },
      { id: 'centro-ss',        name: 'Centro de São Sebastião',  shortName: 'Centro',       distance: 8,  typicalTravelTime: 12 },
    ],
  },

  {
    id: 'ubatuba',
    name: 'Ubatuba',
    state: 'SP',
    center: { lat: -23.4336, lng: -45.0838 },
    zoom: 12,
    beaches: [
      { id: 'enseada',          name: 'Enseada',           waterQuality: 'boa', lat: -23.3562, lng: -44.9891 },
      { id: 'lazaro',           name: 'Praia do Lázaro',   waterQuality: 'boa', lat: -23.4012, lng: -44.9962 },
      { id: 'domingas-dias',    name: 'Domingas Dias',     waterQuality: 'boa', lat: -23.4180, lng: -45.0421 },
      { id: 'picinguaba',       name: 'Picinguaba',        waterQuality: 'boa', lat: -23.3701, lng: -44.9401 },
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
      { id: 'rio-santos-uba', name: 'Rio-Santos (SP-055)',     shortName: 'Rio-Santos', distance: 30, typicalTravelTime: 40 },
      { id: 'oswaldo-cruz',   name: 'Oswaldo Cruz (SP-125)',   shortName: 'Oswaldo Cruz', distance: 65, typicalTravelTime: 70 },
      { id: 'centro-uba',     name: 'Centro de Ubatuba',       shortName: 'Centro',     distance: 6,  typicalTravelTime: 10 },
    ],
  },

  {
    id: 'ilhabela',
    name: 'Ilhabela',
    state: 'SP',
    center: { lat: -23.7786, lng: -45.3582 },
    zoom: 12,
    beaches: [
      { id: 'perequê',    name: 'Perequê',    waterQuality: 'boa', lat: -23.7779, lng: -45.3526 },
      { id: 'curral',     name: 'Praia do Curral', waterQuality: 'boa', lat: -23.8421, lng: -45.3712 },
      { id: 'viana',      name: 'Praia de Viana',  waterQuality: 'boa', lat: -23.8089, lng: -45.3851 },
      { id: 'jabaquara',  name: 'Jabaquara',        waterQuality: 'boa', lat: -23.7521, lng: -45.3291 },
    ],
    upas: [
      // Ilhabela não possui UPA própria — referência: UPA São Sebastião (balsa + 30 min)
    ],
    highways: [
      { id: 'balsa',        name: 'Balsa São Sebastião–Ilhabela', shortName: 'Balsa',      distance: 5,  typicalTravelTime: 20 },
      { id: 'perimetral',   name: 'Perimetral Sul (SP-131)',       shortName: 'Perimetral', distance: 12, typicalTravelTime: 18 },
    ],
  },
];

export const DEFAULT_CITY: City = CITIES[0];
