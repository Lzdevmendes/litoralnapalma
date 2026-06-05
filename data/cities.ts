// Tipos estáticos para configuração de cidade.
// Os tipos completos com campos dinâmicos (Beach, UPA, TrafficRoute) ficam em lib/types.ts.

export type RestaurantCategory = 'frutos_do_mar' | 'pizza' | 'churrasco' | 'variado' | 'cafe' | 'bar';

export interface Restaurant {
  id: string;
  name: string;
  category: RestaurantCategory;
  priceRange: 1 | 2 | 3 | 4; // $ $$ $$$ $$$$
  averageTicket: number;      // R$ por pessoa
  rating: number;             // 1–5
  address: string;
  lat: number;
  lng: number;
  highlights: string[];
  mapsUrl: string;
}

export type AttractionType = 'praia' | 'trilha' | 'cachoeira' | 'historico' | 'mirante' | 'parque';

export interface Attraction {
  id: string;
  name: string;
  type: AttractionType;
  description: string;
  entryFee: number | null; // null = gratuito
  rating: number;
  lat: number;
  lng: number;
  tips: string[];
  mapsUrl: string;
}

export interface BusLine {
  id: string;
  number: string;         // ex: "201"
  name: string;           // ex: "Centro x Martim de Sá"
  company: string;        // ex: "EMTU", "Litorânea"
  type: 'municipal' | 'intermunicipal';
  route: string[];        // lista ordenada de paradas
  firstDeparture: string; // "05:30"
  lastDeparture: string;  // "22:45"
  frequency: number;      // minutos entre partidas
  garageAddress: string;
}

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
  phone?: string;  // número de contato — verificar antes de exibir
  hours: string;   // ex: '24h', 'Seg–Sex 7h–19h'
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

export interface SideRoute {
  id: string;
  name: string;
  description: string;
  type: 'praia' | 'trilha' | 'cachoeira' | 'cultural';
  distance: number;
  estimatedTime: number;
  difficulty?: 'fácil' | 'moderado' | 'difícil';
  tags: string[];
  lat: number;
  lng: number;
  mapsUrl: string;
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
  busLines: BusLine[];
  restaurants: Restaurant[];
  attractions: Attraction[];
  sideRoutes: SideRoute[];
}

export const CITIES: City[] = [
  {
    id: 'caraguatatuba',
    name: 'Caraguatatuba',
    state: 'SP',
    center: { lat: -23.6201, lng: -45.4129 },
    zoom: 12,
    beaches: [
      { id: 'massaguacu',    name: 'Massaguaçu',          waterQuality: 'boa',     lat: -23.5621, lng: -45.3291, amenities: { banheiros: true,  quiosques: false, estacionamento: true  } },
      { id: 'lagoa-azul',    name: 'Lagoa Azul',          waterQuality: 'boa',     lat: -23.5650, lng: -45.3320, amenities: { banheiros: false, quiosques: false, estacionamento: true  } },
      { id: 'aruan',         name: 'Aruan',               waterQuality: 'boa',     lat: -23.5830, lng: -45.3600, amenities: { banheiros: false, quiosques: false, estacionamento: true  } },
      { id: 'martim-de-sa',  name: 'Martim de Sá',        waterQuality: 'boa',     lat: -23.5936, lng: -45.3698, amenities: { banheiros: true,  quiosques: true,  estacionamento: true  } },
      { id: 'palmeiras',     name: 'Palmeiras',           waterQuality: 'boa',     lat: -23.6010, lng: -45.3840, amenities: { banheiros: false, quiosques: true,  estacionamento: true  } },
      { id: 'mococa',        name: 'Mocóca',              waterQuality: 'boa',     lat: -23.6220, lng: -45.4055, amenities: { banheiros: false, quiosques: true,  estacionamento: true  } },
      { id: 'indaia',        name: 'Praia do Indaiá',     waterQuality: 'boa',     lat: -23.6151, lng: -45.4012, amenities: { banheiros: true,  quiosques: true,  estacionamento: true  } },
      { id: 'prainha-cara',  name: 'Prainha',             waterQuality: 'boa',     lat: -23.6175, lng: -45.4110, amenities: { banheiros: false, quiosques: true,  estacionamento: false } },
      { id: 'centro-cara',   name: 'Centro',              waterQuality: 'boa',     lat: -23.6192, lng: -45.4140, amenities: { banheiros: true,  quiosques: true,  estacionamento: true  } },
      { id: 'porto-novo',    name: 'Porto Novo',          waterQuality: 'boa',     lat: -23.6312, lng: -45.4091, amenities: { banheiros: true,  quiosques: true,  estacionamento: true  } },
      { id: 'capricornio',   name: 'Capricórnio',         waterQuality: 'boa',     lat: -23.6350, lng: -45.4155, amenities: { banheiros: false, quiosques: true,  estacionamento: true  } },
      { id: 'tabatinga',     name: 'Tabatinga',           waterQuality: 'boa',     lat: -23.6415, lng: -45.4200, amenities: { banheiros: true,  quiosques: true,  estacionamento: true  } },
      { id: 'cocanha',       name: 'Praia de Cocanha',    waterQuality: 'boa',     lat: -23.6490, lng: -45.4218, amenities: { banheiros: true,  quiosques: true,  estacionamento: true  } },
    ],
    upas: [
      {
        id: 'upa-caraguatatuba',
        name: 'UPA 24h Caraguatatuba',
        city: 'caraguatatuba',
        region: 'centro',
        address: 'Av. Adhemar de Barros, 1289 - Centro, Caraguatatuba',
        lat: -23.6181,
        lng: -45.4105,
        phone: '(12) 3897-6400',
        hours: '24h',
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
    busLines: [
      {
        id: 'cara-201',
        number: '201',
        name: 'Centro x Martim de Sá',
        company: 'EMTU',
        type: 'municipal',
        route: ['Terminal Caraguatatuba', 'Praça da Matriz', 'Av. Adhemar de Barros', 'Indaiá', 'Cocanha', 'Martim de Sá'],
        firstDeparture: '05:30',
        lastDeparture: '22:00',
        frequency: 30,
        garageAddress: 'Terminal Urbano de Caraguatatuba — Av. Presidente Kennedy, s/n',
      },
      {
        id: 'cara-202',
        number: '202',
        name: 'Centro x Porto Novo x Massaguaçu',
        company: 'EMTU',
        type: 'municipal',
        route: ['Terminal Caraguatatuba', 'Centro', 'Porto Novo', 'Pegorelli', 'Massaguaçu'],
        firstDeparture: '05:00',
        lastDeparture: '23:00',
        frequency: 20,
        garageAddress: 'Terminal Urbano de Caraguatatuba — Av. Presidente Kennedy, s/n',
      },
      {
        id: 'cara-301',
        number: '301',
        name: 'Caraguatatuba x São Sebastião',
        company: 'Litorânea',
        type: 'intermunicipal',
        route: ['Terminal Caraguatatuba', 'Entrada de Caraguatatuba', 'Boracéia', 'São Sebastião Centro'],
        firstDeparture: '06:00',
        lastDeparture: '20:00',
        frequency: 60,
        garageAddress: 'Garagem Litorânea — Caraguatatuba',
      },
      {
        id: 'cara-401',
        number: '401',
        name: 'Caraguatatuba x São Paulo (Tietê)',
        company: 'Litorânea',
        type: 'intermunicipal',
        route: ['Terminal Caraguatatuba', 'Rodovia dos Tamoios', 'São José dos Campos', 'Guarulhos', 'Terminal Tietê (SP)'],
        firstDeparture: '07:00',
        lastDeparture: '19:00',
        frequency: 120,
        garageAddress: 'Garagem Litorânea — Caraguatatuba',
      },
    ],
    restaurants: [
      { id: 'cara-r1', name: 'Amanhecer do Mar', category: 'frutos_do_mar', priceRange: 3, averageTicket: 80, rating: 4.5, address: 'Av. da Praia, 520 - Porto Novo, Caraguatatuba', lat: -23.6310, lng: -45.4088, highlights: ['Moqueca premiada', 'Vista pro mar', 'Frutos do mar frescos'], mapsUrl: 'https://maps.google.com/?q=-23.6310,-45.4088' },
      { id: 'cara-r2', name: 'Pizzaria Central', category: 'pizza', priceRange: 2, averageTicket: 45, rating: 4.2, address: 'R. Santos Dumont, 210 - Centro, Caraguatatuba', lat: -23.6195, lng: -45.4130, highlights: ['Pizza de camarão', 'Rodízio às sextas', 'Delivery rápido'], mapsUrl: 'https://maps.google.com/?q=-23.6195,-45.4130' },
      { id: 'cara-r3', name: 'Churrascaria Gaúcha', category: 'churrasco', priceRange: 2, averageTicket: 58, rating: 4.0, address: 'Av. Presidente Kennedy, 1100 - Martim, Caraguatatuba', lat: -23.5940, lng: -45.3700, highlights: ['Rodízio completo', 'Buffet de frios', 'Caipirinha artesanal'], mapsUrl: 'https://maps.google.com/?q=-23.5940,-45.3700' },
      { id: 'cara-r4', name: 'Café da Orla', category: 'cafe', priceRange: 1, averageTicket: 25, rating: 4.3, address: 'Av. da Praia, 180 - Martim de Sá, Caraguatatuba', lat: -23.5938, lng: -45.3695, highlights: ['Açaí artesanal', 'Vista pro mar', 'Brunch aos fins de semana'], mapsUrl: 'https://maps.google.com/?q=-23.5938,-45.3695' },
      { id: 'cara-r5', name: 'Bar do Pescador', category: 'bar', priceRange: 1, averageTicket: 30, rating: 4.1, address: 'R. dos Pescadores, 45 - Porto Novo, Caraguatatuba', lat: -23.6318, lng: -45.4095, highlights: ['Peixe do dia', 'Cerveja gelada', 'Ambiente praiano'], mapsUrl: 'https://maps.google.com/?q=-23.6318,-45.4095' },
      { id: 'cara-r6', name: 'Cantina da Família', category: 'variado', priceRange: 2, averageTicket: 42, rating: 4.4, address: 'Av. Adhemar de Barros, 654 - Centro, Caraguatatuba', lat: -23.6200, lng: -45.4120, highlights: ['Prato feito generoso', 'Comida caseira', 'Cardápio rotativo'], mapsUrl: 'https://maps.google.com/?q=-23.6200,-45.4120' },
    ],
    attractions: [
      { id: 'cara-a1', name: 'Cachoeira do Paraibuna', type: 'cachoeira', description: 'Cachoeira de água cristalina no sopé da Serra do Mar, com piscinas naturais e mata preservada.', entryFee: null, rating: 4.6, lat: -23.5200, lng: -45.4500, tips: ['Leve repelente', 'Melhor de manhã cedo', 'Água fria — leve agasalho'], mapsUrl: 'https://maps.google.com/?q=-23.5200,-45.4500' },
      { id: 'cara-a2', name: 'Mirante do Morro São João', type: 'mirante', description: 'Vista panorâmica de 360° do litoral norte, do centro de Caraguatatuba às ilhas ao horizonte.', entryFee: null, rating: 4.4, lat: -23.6050, lng: -45.4300, tips: ['Melhor ao entardecer', 'Trilha de 40 min', 'Leve lanterna se for à noite'], mapsUrl: 'https://maps.google.com/?q=-23.6050,-45.4300' },
      { id: 'cara-a3', name: 'Parque Estadual da Serra do Mar', type: 'parque', description: 'Maior remanescente de Mata Atlântica do estado, com trilhas, cachoeiras e fauna exuberante.', entryFee: 10, rating: 4.7, lat: -23.5500, lng: -45.5000, tips: ['Reserva obrigatória no site', 'Proibido entrar com comida', 'Guia é obrigatório para trilhas longas'], mapsUrl: 'https://maps.google.com/?q=-23.5500,-45.5000' },
      { id: 'cara-a4', name: 'Igreja Matriz N. Sra. da Ajuda', type: 'historico', description: 'Igreja do século XVIII, um dos símbolos históricos de Caraguatatuba, reconstruída após o deslizamento de 1967.', entryFee: null, rating: 4.0, lat: -23.6201, lng: -45.4129, tips: ['Visitas guiadas às quintas', 'Museu no interior', 'Evento junino imperdível'], mapsUrl: 'https://maps.google.com/?q=-23.6201,-45.4129' },
    ],
    sideRoutes: [
      { id: 'cara-sr1', name: 'Cachoeira do Paraibuna', description: 'Cachoeira de água cristalina no sopé da Serra do Mar — alternativa fresca ao calor da praia.', type: 'cachoeira', distance: 22, estimatedTime: 35, difficulty: 'moderado', tags: ['cachoeira', 'natureza', 'frescor'], lat: -23.5200, lng: -45.4500, mapsUrl: 'https://maps.google.com/?q=-23.5200,-45.4500' },
      { id: 'cara-sr2', name: 'Mirante do Morro São João', description: 'Vista panorâmica de 360° do litoral norte — ideal quando a Rio-Santos está travada.', type: 'trilha', distance: 8, estimatedTime: 15, difficulty: 'fácil', tags: ['mirante', 'trilha', 'pôr do sol'], lat: -23.6050, lng: -45.4300, mapsUrl: 'https://maps.google.com/?q=-23.6050,-45.4300' },
      { id: 'cara-sr3', name: 'Praia de Tabatinga', description: 'Praia calma no sul da cidade, bem menos frequentada que o Centro.', type: 'praia', distance: 8, estimatedTime: 12, tags: ['praia', 'tranquilo', 'sul'], lat: -23.6415, lng: -45.4200, mapsUrl: 'https://maps.google.com/?q=-23.6415,-45.4200' },
      { id: 'cara-sr4', name: 'Praia de Massaguaçu', description: 'Praia extensa ao norte, geralmente mais vazia que o centro mesmo nos fins de semana.', type: 'praia', distance: 7, estimatedTime: 12, tags: ['praia', 'surf', 'norte'], lat: -23.5621, lng: -45.3291, mapsUrl: 'https://maps.google.com/?q=-23.5621,-45.3291' },
    ],
  },

  {
    id: 'sao-sebastiao',
    name: 'São Sebastião',
    state: 'SP',
    center: { lat: -23.780, lng: -45.490 },
    zoom: 11,
    beaches: [
      { id: 'boraceia',              name: 'Boracéia',                waterQuality: 'boa',     lat: -23.7127, lng: -45.4451, amenities: { banheiros: true,  quiosques: true,  estacionamento: true  } },
      { id: 'guaeca',                name: 'Guaecá',                  waterQuality: 'boa',     lat: -23.7295, lng: -45.4540, amenities: { banheiros: false, quiosques: true,  estacionamento: true  } },
      { id: 'baleia',                name: 'Baleia',                  waterQuality: 'boa',     lat: -23.7518, lng: -45.6092, amenities: { banheiros: false, quiosques: false, estacionamento: false } },
      { id: 'deserta',               name: 'Deserta',                 waterQuality: 'boa',     lat: -23.7545, lng: -45.5735, amenities: { banheiros: false, quiosques: false, estacionamento: false } },
      { id: 'cigarras',              name: 'Cigarras',                waterQuality: 'boa',     lat: -23.7570, lng: -45.5782, amenities: { banheiros: false, quiosques: true,  estacionamento: true  } },
      { id: 'camburizinho',          name: 'Camburizinho',            waterQuality: 'boa',     lat: -23.7625, lng: -45.5915, amenities: { banheiros: false, quiosques: true,  estacionamento: false } },
      { id: 'camburi',               name: 'Camburi',                 waterQuality: 'boa',     lat: -23.7672, lng: -45.5879, amenities: { banheiros: true,  quiosques: true,  estacionamento: false } },
      { id: 'juquei',                name: 'Juqueí',                  waterQuality: 'boa',     lat: -23.7712, lng: -45.4891, amenities: { banheiros: false, quiosques: true,  estacionamento: true  } },
      { id: 'jureia-norte',          name: 'Jureia do Norte',         waterQuality: 'boa',     lat: -23.7785, lng: -45.4870, amenities: { banheiros: false, quiosques: false, estacionamento: false } },
      { id: 'pauba',                 name: 'Paúba',                   waterQuality: 'boa',     lat: -23.7783, lng: -45.5045, amenities: { banheiros: false, quiosques: true,  estacionamento: true  } },
      { id: 'engenho-ss',            name: 'Engenho',                 waterQuality: 'boa',     lat: -23.7825, lng: -45.5495, amenities: { banheiros: false, quiosques: true,  estacionamento: true  } },
      { id: 'toque-toque-grande',    name: 'Toque-Toque Grande',      waterQuality: 'boa',     lat: -23.7840, lng: -45.5158, amenities: { banheiros: false, quiosques: true,  estacionamento: false } },
      { id: 'toque-toque-pequeno',   name: 'Toque-Toque Pequeno',     waterQuality: 'boa',     lat: -23.7826, lng: -45.5197, amenities: { banheiros: false, quiosques: true,  estacionamento: false } },
      { id: 'barra-do-sahy',         name: 'Barra do Sahy',           waterQuality: 'boa',     lat: -23.7915, lng: -45.5102, amenities: { banheiros: false, quiosques: false, estacionamento: true  } },
      { id: 'arrastao',              name: 'Arrastão',                waterQuality: 'boa',     lat: -23.7990, lng: -45.3975, amenities: { banheiros: false, quiosques: true,  estacionamento: true  } },
      { id: 'porto-grande',          name: 'Porto Grande',            waterQuality: 'boa',     lat: -23.7993, lng: -45.4040, amenities: { banheiros: true,  quiosques: true,  estacionamento: true  } },
      { id: 'prainha-ss',            name: 'Prainha',                 waterQuality: 'boa',     lat: -23.8005, lng: -45.5275, amenities: { banheiros: false, quiosques: true,  estacionamento: false } },
      { id: 'maresias',              name: 'Maresias',                waterQuality: 'boa',     lat: -23.8004, lng: -45.5313, amenities: { banheiros: true,  quiosques: true,  estacionamento: true  } },
      { id: 'ss-centro',             name: 'Praia de São Sebastião',  waterQuality: 'regular', lat: -23.8090, lng: -45.4080, amenities: { banheiros: true,  quiosques: true,  estacionamento: true  } },
      { id: 'sao-francisco',         name: 'São Francisco',           waterQuality: 'boa',     lat: -23.8035, lng: -45.4065, amenities: { banheiros: true,  quiosques: true,  estacionamento: true  } },
      { id: 'pontal-da-cruz',        name: 'Pontal da Cruz',          waterQuality: 'boa',     lat: -23.7970, lng: -45.4200, amenities: { banheiros: true,  quiosques: true,  estacionamento: true  } },
      { id: 'praia-grande-ss',       name: 'Praia Grande',            waterQuality: 'boa',     lat: -23.8198, lng: -45.4072, amenities: { banheiros: true,  quiosques: true,  estacionamento: true  } },
      { id: 'barequeçaba',           name: 'Barequeçaba',             waterQuality: 'boa',     lat: -23.8145, lng: -45.4187, amenities: { banheiros: true,  quiosques: true,  estacionamento: true  } },
      { id: 'una',                   name: 'Una',                     waterQuality: 'boa',     lat: -23.8040, lng: -45.5363, amenities: { banheiros: false, quiosques: true,  estacionamento: false } },
      { id: 'preta-do-norte',        name: 'Preta do Norte',          waterQuality: 'boa',     lat: -23.8048, lng: -45.5430, amenities: { banheiros: false, quiosques: false, estacionamento: false } },
      { id: 'preta',                 name: 'Preta',                   waterQuality: 'boa',     lat: -23.8072, lng: -45.5470, amenities: { banheiros: false, quiosques: true,  estacionamento: false } },
      { id: 'boicucanga',            name: 'Boiçucanga',              waterQuality: 'boa',     lat: -23.8133, lng: -45.5706, amenities: { banheiros: true,  quiosques: true,  estacionamento: true  } },
      { id: 'santiago',              name: 'Santiago',                waterQuality: 'boa',     lat: -23.7950, lng: -45.5593, amenities: { banheiros: false, quiosques: false, estacionamento: false } },
      { id: 'sai',                   name: 'Saí',                     waterQuality: 'boa',     lat: -23.8078, lng: -45.5710, amenities: { banheiros: false, quiosques: false, estacionamento: false } },
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
        phone: '(12) 3892-6600',
        hours: '24h',
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
    busLines: [
      {
        id: 'ss-101',
        number: '101',
        name: 'Centro x Maresias x Boiçucanga',
        company: 'EMTU',
        type: 'municipal',
        route: ['Terminal São Sebastião', 'Centro', 'Juqueí', 'Barra do Sahy', 'Toque-Toque', 'Maresias', 'Boiçucanga'],
        firstDeparture: '06:00',
        lastDeparture: '22:00',
        frequency: 40,
        garageAddress: 'Terminal Urbano de São Sebastião — R. João Lino da Silva, 180',
      },
      {
        id: 'ss-102',
        number: '102',
        name: 'Centro x Porto x Boracéia',
        company: 'EMTU',
        type: 'municipal',
        route: ['Terminal São Sebastião', 'Centro', 'Porto de São Sebastião', 'Topolândia', 'Boracéia'],
        firstDeparture: '05:30',
        lastDeparture: '22:30',
        frequency: 30,
        garageAddress: 'Terminal Urbano de São Sebastião — R. João Lino da Silva, 180',
      },
      {
        id: 'ss-301',
        number: '301',
        name: 'São Sebastião x Caraguatatuba',
        company: 'Litorânea',
        type: 'intermunicipal',
        route: ['Terminal São Sebastião', 'Boracéia', 'Entrada de Caraguatatuba', 'Terminal Caraguatatuba'],
        firstDeparture: '06:00',
        lastDeparture: '20:00',
        frequency: 60,
        garageAddress: 'Garagem Litorânea — São Sebastião',
      },
      {
        id: 'ss-402',
        number: '402',
        name: 'São Sebastião x São Paulo (Tietê)',
        company: 'Litorânea',
        type: 'intermunicipal',
        route: ['Terminal São Sebastião', 'Caraguatatuba', 'Rodovia dos Tamoios', 'São José dos Campos', 'Terminal Tietê (SP)'],
        firstDeparture: '07:00',
        lastDeparture: '18:00',
        frequency: 120,
        garageAddress: 'Garagem Litorânea — São Sebastião',
      },
    ],
    restaurants: [
      { id: 'ss-r1', name: 'Porto das Ostras', category: 'frutos_do_mar', priceRange: 3, averageTicket: 85, rating: 4.6, address: 'Av. Guarda Mor Lobo Viana, 880 - Centro, São Sebastião', lat: -23.8095, lng: -45.4085, highlights: ['Ostras frescas da região', 'Vista pro porto', 'Camarão na moranga premiado'], mapsUrl: 'https://maps.google.com/?q=-23.8095,-45.4085' },
      { id: 'ss-r2', name: 'Maresias Burger', category: 'variado', priceRange: 2, averageTicket: 40, rating: 4.4, address: 'R. Francisco Loup, 90 - Maresias, São Sebastião', lat: -23.8005, lng: -45.5315, highlights: ['Burger artesanal', 'Batata frita rústica', 'Ótimo pós-surf'], mapsUrl: 'https://maps.google.com/?q=-23.8005,-45.5315' },
      { id: 'ss-r3', name: 'Cantinho do Samba', category: 'bar', priceRange: 1, averageTicket: 28, rating: 4.2, address: 'R. da Praia, 55 - Boiçucanga, São Sebastião', lat: -23.8135, lng: -45.5710, highlights: ['Samba ao vivo aos sábados', 'Tira-gosto farto', 'Caipirinha da casa'], mapsUrl: 'https://maps.google.com/?q=-23.8135,-45.5710' },
      { id: 'ss-r4', name: 'Pizzaria Mangueiral', category: 'pizza', priceRange: 2, averageTicket: 48, rating: 4.1, address: 'Av. Mangueiral, 320 - Juqueí, São Sebastião', lat: -23.7715, lng: -45.4895, highlights: ['Pizza de frutos do mar', 'Opções veganas', 'Vista pro mangue'], mapsUrl: 'https://maps.google.com/?q=-23.7715,-45.4895' },
      { id: 'ss-r5', name: 'Camburi Grill', category: 'churrasco', priceRange: 3, averageTicket: 75, rating: 4.3, address: 'Estr. do Camburi, 410 - Camburi, São Sebastião', lat: -23.7675, lng: -45.5882, highlights: ['Picanha na brasa', 'Cardápio de peixes', 'Varanda com vista'], mapsUrl: 'https://maps.google.com/?q=-23.7675,-45.5882' },
      { id: 'ss-r6', name: 'Café Topolândia', category: 'cafe', priceRange: 1, averageTicket: 22, rating: 4.0, address: 'R. João Lino da Silva, 120 - Topolândia, São Sebastião', lat: -23.7958, lng: -45.4083, highlights: ['Café especial da Serra', 'Tapioca recheada', 'Ambiente acolhedor'], mapsUrl: 'https://maps.google.com/?q=-23.7958,-45.4083' },
    ],
    attractions: [
      { id: 'ss-a1', name: 'Praia de Camburi', type: 'praia', description: 'Uma das praias mais preservadas do litoral paulista, rodeada de Mata Atlântica e com águas calmas.', entryFee: null, rating: 4.8, lat: -23.7672, lng: -45.5879, tips: ['Proibido barracas de som', 'Estacionamento pago na entrada', 'Chegar cedo para pegar vaga'], mapsUrl: 'https://maps.google.com/?q=-23.7672,-45.5879' },
      { id: 'ss-a2', name: 'Museu de Arte Sacra', type: 'historico', description: 'Acervo com peças do século XVII ao XIX, na casa histórica do Porto — uma das mais antigas do litoral.', entryFee: 5, rating: 4.2, lat: -23.8092, lng: -45.4082, tips: ['Fechado às segundas', 'Visita guiada inclusa', 'Loja de artesanato na saída'], mapsUrl: 'https://maps.google.com/?q=-23.8092,-45.4082' },
      { id: 'ss-a3', name: 'Trilha do Costão', type: 'trilha', description: 'Trilha de nível moderado entre costões rochosos com vista espetacular para as ilhas de São Sebastião.', entryFee: null, rating: 4.5, lat: -23.8100, lng: -45.4100, tips: ['Leve água e protetor solar', 'Boa forma física recomendada', 'Saída às 7h para evitar sol forte'], mapsUrl: 'https://maps.google.com/?q=-23.8100,-45.4100' },
      { id: 'ss-a4', name: 'Lagoa dos Bambus', type: 'parque', description: 'Lagoa de água doce cercada de bambuzal exótico, ótima para stand-up paddle e contemplação.', entryFee: null, rating: 4.3, lat: -23.7900, lng: -45.5050, tips: ['Aluguel de SUP no local', 'Mosquitos ao entardecer — leve repelente', 'Ótima para fotos'], mapsUrl: 'https://maps.google.com/?q=-23.7900,-45.5050' },
    ],
    sideRoutes: [
      { id: 'ss-sr1', name: 'Praia de Camburi', description: 'Uma das mais preservadas do litoral paulista — proibida música alta, ideal para quem foge da multidão.', type: 'praia', distance: 28, estimatedTime: 40, tags: ['praia', 'natureza', 'preservada'], lat: -23.7672, lng: -45.5879, mapsUrl: 'https://maps.google.com/?q=-23.7672,-45.5879' },
      { id: 'ss-sr2', name: 'Trilha do Costão', description: 'Trilha moderada entre costões rochosos com vistas espetaculares para as ilhas de São Sebastião.', type: 'trilha', distance: 5, estimatedTime: 20, difficulty: 'moderado', tags: ['trilha', 'costão', 'vista'], lat: -23.8100, lng: -45.4100, mapsUrl: 'https://maps.google.com/?q=-23.8100,-45.4100' },
      { id: 'ss-sr3', name: 'Lagoa dos Bambus', description: 'Lagoa de água doce cercada de bambuzal — aluguel de SUP no local, longe do barulho da praia.', type: 'cachoeira', distance: 25, estimatedTime: 35, tags: ['lagoa', 'paddle', 'tranquilo'], lat: -23.7900, lng: -45.5050, mapsUrl: 'https://maps.google.com/?q=-23.7900,-45.5050' },
      { id: 'ss-sr4', name: 'Centro Histórico de São Sebastião', description: 'Casarões coloniais do século XVII ao redor do porto mais antigo do litoral paulista.', type: 'cultural', distance: 2, estimatedTime: 5, tags: ['história', 'colonial', 'museu'], lat: -23.8090, lng: -45.4080, mapsUrl: 'https://maps.google.com/?q=-23.8090,-45.4080' },
    ],
  },

  {
    id: 'ubatuba',
    name: 'Ubatuba',
    state: 'SP',
    center: { lat: -23.430, lng: -45.050 },
    zoom: 12,
    beaches: [
      { id: 'picinguaba',          name: 'Picinguaba',                    waterQuality: 'boa',      lat: -23.3701, lng: -44.9401, amenities: { banheiros: true,  quiosques: true,  estacionamento: false } },
      { id: 'lagoinha',            name: 'Lagoinha',                      waterQuality: 'boa',      lat: -23.3598, lng: -44.9762, amenities: { banheiros: false, quiosques: false, estacionamento: false } },
      { id: 'prumirim',            name: 'Prumirim',                      waterQuality: 'boa',      lat: -23.3854, lng: -44.9998, amenities: { banheiros: false, quiosques: true,  estacionamento: true  } },
      { id: 'lazaro',              name: 'Praia do Lázaro',               waterQuality: 'boa',      lat: -23.4012, lng: -44.9962, amenities: { banheiros: false, quiosques: false, estacionamento: false } },
      { id: 'vermelha-do-norte',   name: 'Vermelha do Norte',             waterQuality: 'boa',      lat: -23.4020, lng: -45.0680, amenities: { banheiros: false, quiosques: false, estacionamento: false } },
      { id: 'rio-itamambuca',      name: 'Rio Itamambuca',                waterQuality: 'impropia', lat: -23.4060, lng: -45.0690, amenities: { banheiros: false, quiosques: false, estacionamento: false } },
      { id: 'itamambuca',          name: 'Itamambuca',                    waterQuality: 'boa',      lat: -23.4094, lng: -45.0726, amenities: { banheiros: true,  quiosques: true,  estacionamento: true  } },
      { id: 'vermelha',            name: 'Vermelha',                      waterQuality: 'boa',      lat: -23.4185, lng: -45.0675, amenities: { banheiros: false, quiosques: true,  estacionamento: true  } },
      { id: 'domingas-dias',       name: 'Domingas Dias',                 waterQuality: 'boa',      lat: -23.4220, lng: -45.0783, amenities: { banheiros: false, quiosques: true,  estacionamento: false } },
      { id: 'sape',                name: 'Sapé',                          waterQuality: 'boa',      lat: -23.4240, lng: -45.0672, amenities: { banheiros: false, quiosques: false, estacionamento: false } },
      { id: 'grande-ubatuba',      name: 'Praia Grande',                  waterQuality: 'boa',      lat: -23.4390, lng: -45.0740, amenities: { banheiros: true,  quiosques: true,  estacionamento: true  } },
      { id: 'iperoig',             name: 'Iperoig',                       waterQuality: 'boa',      lat: -23.4395, lng: -45.0725, amenities: { banheiros: true,  quiosques: true,  estacionamento: true  } },
      { id: 'itaguá',              name: 'Itaguá',                        waterQuality: 'regular',  lat: -23.4410, lng: -45.0740, amenities: { banheiros: true,  quiosques: true,  estacionamento: true  } },
      { id: 'dura',                name: 'Dura',                          waterQuality: 'boa',      lat: -23.4435, lng: -45.0795, amenities: { banheiros: false, quiosques: false, estacionamento: false } },
      { id: 'toninhas',            name: 'Toninhas',                      waterQuality: 'boa',      lat: -23.4413, lng: -45.0835, amenities: { banheiros: true,  quiosques: true,  estacionamento: true  } },
      { id: 'felix',               name: 'Praia Félix',                   waterQuality: 'boa',      lat: -23.4483, lng: -45.0857, amenities: { banheiros: false, quiosques: false, estacionamento: false } },
      { id: 'pulso',               name: 'Pulso',                         waterQuality: 'boa',      lat: -23.4525, lng: -45.0820, amenities: { banheiros: false, quiosques: false, estacionamento: false } },
      { id: 'santa-rita',          name: 'Santa Rita',                    waterQuality: 'boa',      lat: -23.4570, lng: -45.0845, amenities: { banheiros: false, quiosques: false, estacionamento: false } },
      { id: 'sununga',             name: 'Sununga',                       waterQuality: 'boa',      lat: -23.4660, lng: -45.0912, amenities: { banheiros: false, quiosques: true,  estacionamento: true  } },
      { id: 'maranduba',           name: 'Maranduba',                     waterQuality: 'boa',      lat: -23.4688, lng: -45.0960, amenities: { banheiros: true,  quiosques: true,  estacionamento: true  } },
      { id: 'tenorio',             name: 'Tenório',                       waterQuality: 'boa',      lat: -23.4740, lng: -45.1030, amenities: { banheiros: false, quiosques: true,  estacionamento: true  } },
      { id: 'perequê-mirim',       name: 'Perequê-Mirim',                 waterQuality: 'boa',      lat: -23.4958, lng: -45.1168, amenities: { banheiros: false, quiosques: true,  estacionamento: true  } },
      { id: 'perequé-acu',         name: 'Perequê-Açú',                   waterQuality: 'boa',      lat: -23.4653, lng: -45.0975, amenities: { banheiros: true,  quiosques: true,  estacionamento: true  } },
      { id: 'saco-da-ribeira',     name: 'Saco da Ribeira',               waterQuality: 'boa',      lat: -23.4862, lng: -45.0891, amenities: { banheiros: true,  quiosques: true,  estacionamento: true  } },
      { id: 'enseada',             name: 'Enseada',                       waterQuality: 'boa',      lat: -23.4957, lng: -45.1098, amenities: { banheiros: true,  quiosques: true,  estacionamento: true  } },
      { id: 'fortaleza',           name: 'Fortaleza',                     waterQuality: 'boa',      lat: -23.5230, lng: -45.1825, amenities: { banheiros: false, quiosques: true,  estacionamento: true  } },
      { id: 'anchieta-palmas',     name: 'Praia das Palmas (Anchieta)',   waterQuality: 'boa',      lat: -23.5270, lng: -45.0630, amenities: { banheiros: false, quiosques: false, estacionamento: false } },
      { id: 'anchieta-prainhafora',name: 'Prainha de Fora (Anchieta)',    waterQuality: 'boa',      lat: -23.5250, lng: -45.0600, amenities: { banheiros: false, quiosques: false, estacionamento: false } },
      { id: 'anchieta-leste',      name: 'Prainha do Leste (Anchieta)',   waterQuality: 'boa',      lat: -23.5350, lng: -45.0670, amenities: { banheiros: false, quiosques: false, estacionamento: false } },
      { id: 'anchieta-sapateiro',  name: 'Praia do Sapateiro (Anchieta)',waterQuality: 'boa',      lat: -23.5340, lng: -45.0685, amenities: { banheiros: false, quiosques: false, estacionamento: false } },
      { id: 'anchieta-engenho',    name: 'Prainha do Engenho (Anchieta)',waterQuality: 'boa',      lat: -23.5360, lng: -45.0710, amenities: { banheiros: false, quiosques: false, estacionamento: false } },
      { id: 'anchieta-presidio',   name: 'Praia do Presídio (Anchieta)', waterQuality: 'boa',      lat: -23.5390, lng: -45.0700, amenities: { banheiros: false, quiosques: false, estacionamento: false } },
      { id: 'anchieta-sul',        name: 'Praia do Sul (Anchieta)',       waterQuality: 'boa',      lat: -23.5430, lng: -45.0750, amenities: { banheiros: false, quiosques: false, estacionamento: false } },
    ],
    upas: [
      {
        id: 'upa-ubatuba',
        name: 'UPA Ubatuba',
        city: 'ubatuba',
        region: 'centro',
        address: 'R. Dr. Paulo Virgílio Bastos, 93 - Centro, Ubatuba',
        lat: -23.4332,
        lng: -45.0740,
        phone: '(12) 3833-7000',
        hours: '24h',
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
    busLines: [
      {
        id: 'uba-501',
        number: '501',
        name: 'Centro x Enseada',
        company: 'Mantiqueira',
        type: 'municipal',
        route: ['Terminal Ubatuba', 'Centro', 'Perequê-Açú', 'Saco da Ribeira', 'Enseada'],
        firstDeparture: '05:30',
        lastDeparture: '22:00',
        frequency: 30,
        garageAddress: 'Garagem Mantiqueira — Av. Iperoig, 400, Ubatuba',
      },
      {
        id: 'uba-502',
        number: '502',
        name: 'Centro x Itamambuca x Picinguaba',
        company: 'Mantiqueira',
        type: 'municipal',
        route: ['Terminal Ubatuba', 'Centro', 'Prumirim', 'Lagoinha', 'Itamambuca', 'Picinguaba'],
        firstDeparture: '06:00',
        lastDeparture: '20:00',
        frequency: 60,
        garageAddress: 'Garagem Mantiqueira — Av. Iperoig, 400, Ubatuba',
      },
      {
        id: 'uba-503',
        number: '503',
        name: 'Centro x Domingas Dias x Lázaro',
        company: 'Mantiqueira',
        type: 'municipal',
        route: ['Terminal Ubatuba', 'Centro', 'Toninhas', 'Félix', 'Domingas Dias', 'Lázaro'],
        firstDeparture: '06:30',
        lastDeparture: '21:00',
        frequency: 45,
        garageAddress: 'Garagem Mantiqueira — Av. Iperoig, 400, Ubatuba',
      },
      {
        id: 'uba-401',
        number: '401',
        name: 'Ubatuba x São José dos Campos',
        company: 'Litorânea',
        type: 'intermunicipal',
        route: ['Terminal Ubatuba', 'Rodovia Oswaldo Cruz (SP-125)', 'Taubaté', 'São José dos Campos'],
        firstDeparture: '07:00',
        lastDeparture: '19:00',
        frequency: 120,
        garageAddress: 'Garagem Litorânea — Ubatuba',
      },
    ],
    restaurants: [
      { id: 'uba-r1', name: 'Siri Mole', category: 'frutos_do_mar', priceRange: 3, averageTicket: 90, rating: 4.7, address: 'Av. Leovegildo Dias Vieira, 540 - Centro, Ubatuba', lat: -23.4338, lng: -45.0840, highlights: ['Siri mole frito exclusivo', 'Lagosta ao alho e óleo', 'Vista para o mar'], mapsUrl: 'https://maps.google.com/?q=-23.4338,-45.0840' },
      { id: 'uba-r2', name: 'Cantina do Ubatuba', category: 'variado', priceRange: 2, averageTicket: 45, rating: 4.3, address: 'R. Gula, 78 - Centro, Ubatuba', lat: -23.4330, lng: -45.0835, highlights: ['Comida regional', 'Porções fartas', 'Ambiente familiar'], mapsUrl: 'https://maps.google.com/?q=-23.4330,-45.0835' },
      { id: 'uba-r3', name: 'Bar da Enseada', category: 'bar', priceRange: 1, averageTicket: 25, rating: 4.0, address: 'Av. Leovegildo Dias Vieira, 1000 - Enseada, Ubatuba', lat: -23.4958, lng: -45.1100, highlights: ['Pastel de siri', 'Chope gelado', 'Vôlei de praia ao lado'], mapsUrl: 'https://maps.google.com/?q=-23.4958,-45.1100' },
      { id: 'uba-r4', name: 'Churrascaria Serrana', category: 'churrasco', priceRange: 2, averageTicket: 58, rating: 4.2, address: 'Av. Iperoig, 1200 - Centro, Ubatuba', lat: -23.4342, lng: -45.0845, highlights: ['Costela de boi na brasa', 'Buffet de saladas frescas', 'Rodízio completo'], mapsUrl: 'https://maps.google.com/?q=-23.4342,-45.0845' },
      { id: 'uba-r5', name: 'Café Trincheira', category: 'cafe', priceRange: 1, averageTicket: 22, rating: 4.4, address: 'R. Felix Guisard, 160 - Centro, Ubatuba', lat: -23.4335, lng: -45.0838, highlights: ['Café especial caiçara', 'Pão de queijo artesanal', 'Wi-Fi gratuito'], mapsUrl: 'https://maps.google.com/?q=-23.4335,-45.0838' },
      { id: 'uba-r6', name: 'Pizzaria Picinguaba', category: 'pizza', priceRange: 2, averageTicket: 52, rating: 4.5, address: 'Estr. da Picinguaba, 300 - Picinguaba, Ubatuba', lat: -23.3705, lng: -44.9405, highlights: ['Pizza de pupunha', 'Ingredientes orgânicos', 'Vista incrível da baía'], mapsUrl: 'https://maps.google.com/?q=-23.3705,-44.9405' },
    ],
    attractions: [
      { id: 'uba-a1', name: 'Ilha Anchieta', type: 'praia', description: 'Ilha paradisíaca com praias de águas cristalinas, ruínas de presídio histórico e trilhas na mata.', entryFee: null, rating: 4.9, lat: -23.5350, lng: -45.0760, tips: ['Barco sai do Saco da Ribeira', 'Leve lanche — sem comércio na ilha', 'Snorkel obrigatório!'], mapsUrl: 'https://maps.google.com/?q=-23.5350,-45.0760' },
      { id: 'uba-a2', name: 'Parque Estadual Serra do Mar — Picinguaba', type: 'parque', description: 'Núcleo de preservação com praias selvagens, comunidade caiçara e trilhas com vista para o Atlântico.', entryFee: 12, rating: 4.8, lat: -23.3701, lng: -44.9401, tips: ['Reserva prévia obrigatória', 'Guia credenciado recomendado', 'Proibido acampar sem autorização'], mapsUrl: 'https://maps.google.com/?q=-23.3701,-44.9401' },
      { id: 'uba-a3', name: 'Cachoeira da Toca', type: 'cachoeira', description: 'Cachoeira de 12 m de queda com poço natural para banho, dentro da Mata Atlântica preservada.', entryFee: null, rating: 4.6, lat: -23.4150, lng: -45.0620, tips: ['Trilha de 20 min pelo mato', 'Água gelada mesmo no verão', 'Levar calçado fechado'], mapsUrl: 'https://maps.google.com/?q=-23.4150,-45.0620' },
      { id: 'uba-a4', name: 'Mirante do Félix', type: 'mirante', description: 'Ponto mais alto da região urbana de Ubatuba, com vista de 180° do litoral e das ilhas vizinhas.', entryFee: null, rating: 4.5, lat: -23.4485, lng: -45.0860, tips: ['Subida íngreme de moto táxi disponível', 'Melhor vista ao pôr do sol', 'Leve agasalho — ventoso'], mapsUrl: 'https://maps.google.com/?q=-23.4485,-45.0860' },
    ],
    sideRoutes: [
      { id: 'uba-sr1', name: 'Praia do Félix', description: 'Praia escondida de acesso difícil, raramente lotada — ideal quando as centrais estiverem cheias.', type: 'praia', distance: 14, estimatedTime: 22, tags: ['praia', 'escondida', 'tranquilo'], lat: -23.4850, lng: -45.0850, mapsUrl: 'https://maps.google.com/?q=-23.4850,-45.0850' },
      { id: 'uba-sr2', name: 'Cachoeira da Toca', description: 'Cachoeira de 12m com poço natural de água gelada, trilha de 20 min pela mata fechada.', type: 'cachoeira', distance: 6, estimatedTime: 20, difficulty: 'fácil', tags: ['cachoeira', 'trilha', 'frescor'], lat: -23.4150, lng: -45.0620, mapsUrl: 'https://maps.google.com/?q=-23.4150,-45.0620' },
      { id: 'uba-sr3', name: 'Núcleo Picinguaba — Serra do Mar', description: 'Trilha com comunidade caiçara, praias selvagens quase intocadas e matas de Mata Atlântica.', type: 'trilha', distance: 38, estimatedTime: 55, difficulty: 'moderado', tags: ['parque', 'trilha', 'caiçara'], lat: -23.3701, lng: -44.9401, mapsUrl: 'https://maps.google.com/?q=-23.3701,-44.9401' },
      { id: 'uba-sr4', name: 'Ilha Anchieta', description: 'Ilha com ruínas históricas, praias cristalinas e snorkel incrível — barco sai do Saco da Ribeira.', type: 'praia', distance: 20, estimatedTime: 40, tags: ['ilha', 'snorkel', 'histórico'], lat: -23.5350, lng: -45.0760, mapsUrl: 'https://maps.google.com/?q=-23.5350,-45.0760' },
    ],
  },

  {
    id: 'ilhabela',
    name: 'Ilhabela',
    state: 'SP',
    center: { lat: -23.790, lng: -45.365 },
    zoom: 12,
    beaches: [
      { id: 'portinho',        name: 'Portinho',              waterQuality: 'boa',      lat: -23.7334, lng: -45.3412, amenities: { banheiros: true,  quiosques: true,  estacionamento: true  } },
      { id: 'jabaquara',       name: 'Jabaquara',             waterQuality: 'boa',      lat: -23.7512, lng: -45.3445, amenities: { banheiros: true,  quiosques: true,  estacionamento: true  } },
      { id: 'saco-da-capela',  name: 'Saco da Capela',        waterQuality: 'boa',      lat: -23.7600, lng: -45.3430, amenities: { banheiros: false, quiosques: true,  estacionamento: true  } },
      { id: 'armacao',         name: 'Armação',               waterQuality: 'impropia', lat: -23.7480, lng: -45.3340, amenities: { banheiros: false, quiosques: true,  estacionamento: true  } },
      { id: 'juliao',          name: 'Praia do Julião',       waterQuality: 'boa',      lat: -23.7643, lng: -45.3498, amenities: { banheiros: false, quiosques: false, estacionamento: true  } },
      { id: 'eng-dagua',       name: 'Engenho d\'Água',       waterQuality: 'boa',      lat: -23.7630, lng: -45.3430, amenities: { banheiros: false, quiosques: true,  estacionamento: true  } },
      { id: 'barreiros',       name: 'Barreiros',             waterQuality: 'boa',      lat: -23.7800, lng: -45.3520, amenities: { banheiros: false, quiosques: true,  estacionamento: true  } },
      { id: 'perequê',         name: 'Perequê',               waterQuality: 'boa',      lat: -23.7779, lng: -45.3526, amenities: { banheiros: true,  quiosques: true,  estacionamento: true  } },
      { id: 'itaguacu',        name: 'Itaguaçu',              waterQuality: 'boa',      lat: -23.7870, lng: -45.3560, amenities: { banheiros: false, quiosques: true,  estacionamento: true  } },
      { id: 'siriuba',         name: 'Siriúba',               waterQuality: 'boa',      lat: -23.7900, lng: -45.3585, amenities: { banheiros: false, quiosques: true,  estacionamento: true  } },
      { id: 'pinto',           name: 'Pinto',                 waterQuality: 'boa',      lat: -23.7935, lng: -45.3610, amenities: { banheiros: false, quiosques: true,  estacionamento: false } },
      { id: 'sino',            name: 'Sino',                  waterQuality: 'boa',      lat: -23.7955, lng: -45.3620, amenities: { banheiros: false, quiosques: false, estacionamento: false } },
      { id: 'feiticeira',      name: 'Feiticeira',            waterQuality: 'boa',      lat: -23.7891, lng: -45.3623, amenities: { banheiros: true,  quiosques: true,  estacionamento: true  } },
      { id: 'pedras-miudas',   name: 'Pedras Miúdas',         waterQuality: 'boa',      lat: -23.8013, lng: -45.3572, amenities: { banheiros: false, quiosques: false, estacionamento: false } },
      { id: 'ilha-cabras',     name: 'Ilha das Cabras',       waterQuality: 'boa',      lat: -23.8100, lng: -45.3580, amenities: { banheiros: false, quiosques: false, estacionamento: false } },
      { id: 'itaquanduba',     name: 'Itaquanduba',           waterQuality: 'boa',      lat: -23.8220, lng: -45.3730, amenities: { banheiros: false, quiosques: false, estacionamento: false } },
      { id: 'curral',          name: 'Praia do Curral',       waterQuality: 'boa',      lat: -23.8237, lng: -45.3681, amenities: { banheiros: true,  quiosques: true,  estacionamento: false } },
      { id: 'veloso',          name: 'Veloso',                waterQuality: 'boa',      lat: -23.8240, lng: -45.3250, amenities: { banheiros: false, quiosques: true,  estacionamento: false } },
      { id: 'viana',           name: 'Praia de Viana',        waterQuality: 'boa',      lat: -23.8453, lng: -45.3801, amenities: { banheiros: false, quiosques: false, estacionamento: false } },
      { id: 'grande-ilhab',    name: 'Grande (Ilhabela)',     waterQuality: 'boa',      lat: -23.8475, lng: -45.3860, amenities: { banheiros: false, quiosques: true,  estacionamento: false } },
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
    busLines: [
      {
        id: 'ilh-601',
        number: '601',
        name: 'Perequê x Feiticeira x Curral',
        company: 'Transporte Ilhabela',
        type: 'municipal',
        route: ['Terminal Perequê', 'Portinho', 'Jabaquara', 'Julião', 'Perequê', 'Feiticeira', 'Pedras Miúdas', 'Curral'],
        firstDeparture: '06:00',
        lastDeparture: '22:00',
        frequency: 40,
        garageAddress: 'Garagem Municipal — Av. Pedro Paulo de Moraes, 1500, Ilhabela',
      },
      {
        id: 'ilh-602',
        number: '602',
        name: 'Vila x Jabaquara x Viana',
        company: 'Transporte Ilhabela',
        type: 'municipal',
        route: ['Terminal Perequê', 'Vila', 'Portinho', 'Jabaquara', 'Viana'],
        firstDeparture: '07:00',
        lastDeparture: '21:00',
        frequency: 60,
        garageAddress: 'Garagem Municipal — Av. Pedro Paulo de Moraes, 1500, Ilhabela',
      },
      {
        id: 'ilh-701',
        number: '701',
        name: 'Ilhabela x São Sebastião (via Balsa)',
        company: 'Litorânea',
        type: 'intermunicipal',
        route: ['Terminal Perequê', 'Terminal Balsa Ilhabela', 'Terminal Balsa São Sebastião', 'Terminal São Sebastião'],
        firstDeparture: '06:30',
        lastDeparture: '20:30',
        frequency: 90,
        garageAddress: 'Garagem Litorânea — São Sebastião',
      },
    ],
    restaurants: [
      { id: 'ilh-r1', name: 'Viana Beach Restaurant', category: 'frutos_do_mar', priceRange: 3, averageTicket: 95, rating: 4.6, address: 'Estr. da Viana, s/n - Praia de Viana, Ilhabela', lat: -23.8455, lng: -45.3803, highlights: ['Polvo grelhado na brasa', 'Frutos do mar locais', 'Mesa com vista pro mar'], mapsUrl: 'https://maps.google.com/?q=-23.8455,-45.3803' },
      { id: 'ilh-r2', name: 'Pizzaria do Porto', category: 'pizza', priceRange: 2, averageTicket: 50, rating: 4.3, address: 'Av. Pedro Paulo de Moraes, 1250 - Vila, Ilhabela', lat: -23.7762, lng: -45.3516, highlights: ['Pizza com ingredientes da ilha', 'Cardápio especial de mariscos', 'Vista pro cais da balsa'], mapsUrl: 'https://maps.google.com/?q=-23.7762,-45.3516' },
      { id: 'ilh-r3', name: 'Deck Bar Perequê', category: 'bar', priceRange: 2, averageTicket: 38, rating: 4.4, address: 'Av. Pedro Paulo de Moraes, 890 - Perequê, Ilhabela', lat: -23.7780, lng: -45.3528, highlights: ['Deck sobre o mar', 'Drink de frutas tropicais', 'Musica ao vivo nas sextas'], mapsUrl: 'https://maps.google.com/?q=-23.7780,-45.3528' },
      { id: 'ilh-r4', name: 'Cantina da Vila', category: 'variado', priceRange: 1, averageTicket: 35, rating: 4.1, address: 'R. Dr. Carvalho, 88 - Centro, Ilhabela', lat: -23.7758, lng: -45.3510, highlights: ['Marmita caiçara', 'Comida do dia no almoço', 'Preço justo'], mapsUrl: 'https://maps.google.com/?q=-23.7758,-45.3510' },
      { id: 'ilh-r5', name: 'Churrascaria Ilha Verde', category: 'churrasco', priceRange: 3, averageTicket: 80, rating: 4.5, address: 'Estr. da Feiticeira, 520 - Feiticeira, Ilhabela', lat: -23.7893, lng: -45.3625, highlights: ['Corte especial da ilha', 'Cardápio de peixes misturado', 'Ambiente entre a mata'], mapsUrl: 'https://maps.google.com/?q=-23.7893,-45.3625' },
      { id: 'ilh-r6', name: 'Café da Balsa', category: 'cafe', priceRange: 1, averageTicket: 20, rating: 3.9, address: 'Terminal da Balsa - Perequê, Ilhabela', lat: -23.7779, lng: -45.3526, highlights: ['Café e tapioca esperando a balsa', 'Rápido e prático', 'Pão artesanal'], mapsUrl: 'https://maps.google.com/?q=-23.7779,-45.3526' },
    ],
    attractions: [
      { id: 'ilh-a1', name: 'Praia dos Castelhanos', type: 'praia', description: 'A mais famosa de Ilhabela, de difícil acesso (4x4) e das mais belas do Brasil, com ondas para surf.', entryFee: null, rating: 4.9, lat: -23.8580, lng: -45.2850, tips: ['Acesso só de 4x4 — contratar excursão', 'Leve comida própria', 'Temporada de surf (abr–ago)'], mapsUrl: 'https://maps.google.com/?q=-23.8580,-45.2850' },
      { id: 'ilh-a2', name: 'Pico do Baepi', type: 'trilha', description: 'Trilha até o ponto mais alto acessível da ilha (640m), com vista de 360° do arquipélago.', entryFee: null, rating: 4.8, lat: -23.7800, lng: -45.3200, tips: ['Saída às 6h para evitar chuva da tarde', 'Guia obrigatório em temporada', 'Nível difícil — prepare-se bem'], mapsUrl: 'https://maps.google.com/?q=-23.7800,-45.3200' },
      { id: 'ilh-a3', name: 'Cachoeira da Laje', type: 'cachoeira', description: 'Queda d\'água de 30m com piscina natural esmeralda, acessível por trilha de 1h pela mata.', entryFee: null, rating: 4.7, lat: -23.8100, lng: -45.3400, tips: ['Leve roupas para molhar', 'Trilha moderada — tênis fechado', 'Evitar no verão chuvoso'], mapsUrl: 'https://maps.google.com/?q=-23.8100,-45.3400' },
      { id: 'ilh-a4', name: 'Museu Histórico de Ilhabela', type: 'historico', description: 'Sede colonial do século XVIII com acervo sobre piratas, naufrácios e a cultura caiçara da ilha.', entryFee: 8, rating: 4.2, lat: -23.7760, lng: -45.3514, tips: ['Fechado às terças', 'Visita guiada inclusa no ingresso', 'Loja de artesanato caiçara'], mapsUrl: 'https://maps.google.com/?q=-23.7760,-45.3514' },
    ],
    sideRoutes: [
      { id: 'ilh-sr1', name: 'Praia dos Castelhanos', description: 'A mais bela de Ilhabela — acesso via 4x4 ou barco, ondas incríveis e quase nenhum turismo de massa.', type: 'praia', distance: 30, estimatedTime: 60, difficulty: 'difícil', tags: ['praia', 'surf', 'selvagem'], lat: -23.8580, lng: -45.2850, mapsUrl: 'https://maps.google.com/?q=-23.8580,-45.2850' },
      { id: 'ilh-sr2', name: 'Cachoeira da Laje', description: 'Queda de 30m com piscina natural esmeralda — trilha de 1h pela mata atlântica preservada.', type: 'cachoeira', distance: 12, estimatedTime: 25, difficulty: 'moderado', tags: ['cachoeira', 'trilha', 'natureza'], lat: -23.8100, lng: -45.3400, mapsUrl: 'https://maps.google.com/?q=-23.8100,-45.3400' },
      { id: 'ilh-sr3', name: 'Pico do Baepi', description: 'Trilha até 640m com vista de 360° do arquipélago — saída às 6h para evitar chuva da tarde.', type: 'trilha', distance: 8, estimatedTime: 30, difficulty: 'difícil', tags: ['trilha', 'altitude', 'vista 360°'], lat: -23.7800, lng: -45.3200, mapsUrl: 'https://maps.google.com/?q=-23.7800,-45.3200' },
      { id: 'ilh-sr4', name: 'Praia do Jabaquara', description: 'Praia de baía com águas calmas e rasas, ideal para famílias com crianças — bem menos movimentada.', type: 'praia', distance: 4, estimatedTime: 8, tags: ['praia', 'família', 'calmo'], lat: -23.7600, lng: -45.3500, mapsUrl: 'https://maps.google.com/?q=-23.7600,-45.3500' },
    ],
  },
];

export const DEFAULT_CITY: City = CITIES[0];
