/**
 * Testes para lib/traffic.ts — lógica de conversão de ratio em nível de trânsito.
 *
 * `fetchGoogleTraffic` requer fetch real e é testada via integração.
 * Como GOOGLE_KEY é capturado no load-time do módulo, usamos jest.isolateModules
 * para re-importar com ENV diferente em cada grupo de testes.
 */

import type { HighwayStatic } from '@/data/cities';

const MOCK_HIGHWAY: HighwayStatic = {
  id: 'rio-santos',
  name: 'Rio-Santos',
  shortName: 'Rio-Santos',
  distance: 18.5,
  typicalTravelTime: 25,
};

function mockFetch(duration: string, staticDuration: string) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      routes: [{ duration, staticDuration }],
    }),
  }) as unknown as typeof fetch;
}

// ── sem chave configurada ────────────────────────────────────────────────────

describe('fetchGoogleTraffic — sem chave de API', () => {
  it('retorna objeto vazio quando EXPO_PUBLIC_GOOGLE_ROUTES_KEY não está definida', async () => {
    let fetchGoogleTraffic!: (h: HighwayStatic[]) => Promise<unknown>;
    jest.isolateModules(() => {
      delete process.env.EXPO_PUBLIC_GOOGLE_ROUTES_KEY;
      ({ fetchGoogleTraffic } = require('@/lib/traffic'));
    });
    const result = await fetchGoogleTraffic([MOCK_HIGHWAY]);
    expect(result).toEqual({});
  });
});

// ── com chave, fetch mockado ─────────────────────────────────────────────────

describe('fetchGoogleTraffic — classificação de nível de tráfego', () => {
  let fetchGoogleTraffic!: (h: HighwayStatic[]) => Promise<Record<string, { level: string; travelTime: number } | undefined>>;

  beforeAll(() => {
    jest.isolateModules(() => {
      process.env.EXPO_PUBLIC_GOOGLE_ROUTES_KEY = 'test-key';
      ({ fetchGoogleTraffic } = require('@/lib/traffic'));
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('classifica como "livre" quando ratio < 1.1 (1.0)', async () => {
    mockFetch('1000s', '1000s');
    const result = await fetchGoogleTraffic([MOCK_HIGHWAY]);
    expect(result['rio-santos']?.level).toBe('livre');
  });

  it('classifica como "moderado" quando 1.1 ≤ ratio < 1.4 (1.3)', async () => {
    mockFetch('1300s', '1000s');
    const result = await fetchGoogleTraffic([MOCK_HIGHWAY]);
    expect(result['rio-santos']?.level).toBe('moderado');
  });

  it('classifica como "lento" quando 1.4 ≤ ratio < 1.8 (1.6)', async () => {
    mockFetch('1600s', '1000s');
    const result = await fetchGoogleTraffic([MOCK_HIGHWAY]);
    expect(result['rio-santos']?.level).toBe('lento');
  });

  it('classifica como "parado" quando ratio ≥ 1.8 (2.0)', async () => {
    mockFetch('2000s', '1000s');
    const result = await fetchGoogleTraffic([MOCK_HIGHWAY]);
    expect(result['rio-santos']?.level).toBe('parado');
  });

  it('converte duração de segundos para minutos corretamente (1800s → 30 min)', async () => {
    mockFetch('1800s', '1500s');
    const result = await fetchGoogleTraffic([MOCK_HIGHWAY]);
    expect(result['rio-santos']?.travelTime).toBe(30);
  });

  it('ignora rodovias não mapeadas em HIGHWAY_ENDPOINTS', async () => {
    const unknownHighway: HighwayStatic = {
      id: 'unknown-highway',
      name: 'Desconhecida',
      shortName: 'N/A',
      distance: 10,
      typicalTravelTime: 15,
    };
    const result = await fetchGoogleTraffic([unknownHighway]);
    expect(result['unknown-highway']).toBeUndefined();
  });

  it('retorna objeto parcial quando uma rota falha (HTTP error)', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false, status: 429,
    }) as unknown as typeof fetch;
    const result = await fetchGoogleTraffic([MOCK_HIGHWAY]);
    expect(result['rio-santos']).toBeUndefined();
  });

  it('processa múltiplas rodovias em paralelo', async () => {
    mockFetch('1000s', '1000s');
    const highways: HighwayStatic[] = [
      MOCK_HIGHWAY,
      { id: 'tamoios', name: 'Tamoios', shortName: 'Tamoios', distance: 82, typicalTravelTime: 55 },
    ];
    const result = await fetchGoogleTraffic(highways);
    expect(Object.keys(result).length).toBe(2);
  });
});
