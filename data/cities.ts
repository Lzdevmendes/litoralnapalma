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
    center: { lat: -23.780, lng: -45.490 },
    zoom: 11,
    beaches: [
      { id: 'praia-grande-ss',       name: 'Praia Grande',            waterQuality: 'boa',     lat: -23.8198, lng: -45.4072 },
      { id: 'maresias',              name: 'Maresias',                waterQuality: 'boa',     lat: -23.8004, lng: -45.5313 },
      { id: 'boicucanga',            name: 'Boiçucanga',              waterQuality: 'boa',     lat: -23.8133, lng: -45.5706 },
      { id: 'camburi',               name: 'Camburi',                 waterQuality: 'boa',     lat: -23.7672, lng: -45.5879 },
      { id: 'juquei',                name: 'Juqueí',                  waterQuality: 'boa',     lat: -23.7712, lng: -45.4891 },
      { id: 'barra-do-sahy',         name: 'Barra do Sahy',           waterQuality: 'boa',     lat: -23.7915, lng: -45.5102 },
      { id: 'boraceia',              name: 'Boracéia',                waterQuality: 'boa',     lat: -23.7127, lng: -45.4451 },
      { id: 'toque-toque-pequeno',   name: 'Toque-Toque Pequeno',     waterQuality: 'boa',     lat: -23.7826, lng: -45.5197 },
      { id: 'ss-centro',             name: 'Praia de São Sebastião',  waterQuality: 'regular', lat: -23.8090, lng: -45.4080 },
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
  },

  {
    id: 'ubatuba',
    name: 'Ubatuba',
    state: 'SP',
    center: { lat: -23.430, lng: -45.050 },
    zoom: 12,
    beaches: [
      { id: 'enseada',          name: 'Enseada',           waterQuality: 'boa', lat: -23.4957, lng: -45.1098 },
      { id: 'itamambuca',       name: 'Itamambuca',        waterQuality: 'boa', lat: -23.4094, lng: -45.0726 },
      { id: 'felix',            name: 'Praia Félix',       waterQuality: 'boa', lat: -23.4483, lng: -45.0857 },
      { id: 'perequé-acu',      name: 'Perequê-Açú',       waterQuality: 'boa', lat: -23.4653, lng: -45.0975 },
      { id: 'prumirim',         name: 'Prumirim',          waterQuality: 'boa', lat: -23.3854, lng: -44.9998 },
      { id: 'lagoinha',         name: 'Lagoinha',          waterQuality: 'boa', lat: -23.3598, lng: -44.9762 },
      { id: 'saco-da-ribeira',  name: 'Saco da Ribeira',   waterQuality: 'boa', lat: -23.4862, lng: -45.0891 },
      { id: 'domingas-dias',    name: 'Domingas Dias',     waterQuality: 'boa', lat: -23.4220, lng: -45.0783 },
      { id: 'toninhas',         name: 'Toninhas',          waterQuality: 'boa', lat: -23.4413, lng: -45.0835 },
      { id: 'lazaro',           name: 'Praia do Lázaro',   waterQuality: 'boa', lat: -23.4012, lng: -44.9962 },
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
      { id: 'rio-santos-uba',  name: 'Rio-Santos (SP-055)',              shortName: 'Rio-Santos',   distance: 30, typicalTravelTime: 40 },
      { id: 'tamoios-norte',   name: 'Rodovia dos Tamoios Norte (SP-099)', shortName: 'Tamoios N',  distance: 45, typicalTravelTime: 50 },
      { id: 'oswaldo-cruz',    name: 'Oswaldo Cruz (SP-125)',             shortName: 'Oswaldo Cruz', distance: 65, typicalTravelTime: 70 },
      { id: 'centro-uba',      name: 'Centro de Ubatuba',                shortName: 'Centro',       distance: 6,  typicalTravelTime: 10 },
    ],
  },

  {
    id: 'ilhabela',
    name: 'Ilhabela',
    state: 'SP',
    center: { lat: -23.790, lng: -45.365 },
    zoom: 12,
    beaches: [
      { id: 'portinho',      name: 'Portinho',        waterQuality: 'boa', lat: -23.7334, lng: -45.3412 },
      { id: 'jabaquara',     name: 'Jabaquara',        waterQuality: 'boa', lat: -23.7512, lng: -45.3445 },
      { id: 'juliao',        name: 'Praia do Julião',  waterQuality: 'boa', lat: -23.7643, lng: -45.3498 },
      { id: 'perequê',       name: 'Perequê',          waterQuality: 'boa', lat: -23.7779, lng: -45.3526 },
      { id: 'feiticeira',    name: 'Feiticeira',       waterQuality: 'boa', lat: -23.7891, lng: -45.3623 },
      { id: 'pedras-miudas', name: 'Pedras Miúdas',    waterQuality: 'boa', lat: -23.8013, lng: -45.3572 },
      { id: 'curral',        name: 'Praia do Curral',  waterQuality: 'boa', lat: -23.8237, lng: -45.3681 },
      { id: 'viana',         name: 'Praia de Viana',   waterQuality: 'boa', lat: -23.8453, lng: -45.3801 },
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
