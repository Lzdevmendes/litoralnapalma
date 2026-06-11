/**
 * Testes para lib/traffic.ts — fetchGoogleTraffic via Edge Function proxy.
 *
 * A lógica de classificação ratio→nível foi para o servidor (routes-proxy Edge Function).
 * Aqui testamos: delegação correta ao Supabase, passagem de resultado e fallback em erro.
 */

import type { HighwayStatic } from '@/data/cities';

const MOCK_HIGHWAY: HighwayStatic = {
  id: 'rio-santos',
  name: 'Rio-Santos',
  shortName: 'Rio-Santos',
  distance: 18.5,
  typicalTravelTime: 25,
};

const mockInvoke = jest.fn();

jest.mock('@/lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: (...args: unknown[]) => mockInvoke(...args),
    },
  },
  isSupabaseConfigured: true,
}));

import { fetchGoogleTraffic } from '@/lib/traffic';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('fetchGoogleTraffic — sem Supabase configurado', () => {
  it('retorna objeto vazio quando highways está vazio', async () => {
    const result = await fetchGoogleTraffic([]);
    expect(result).toEqual({});
    expect(mockInvoke).not.toHaveBeenCalled();
  });
});

describe('fetchGoogleTraffic — via Edge Function proxy', () => {
  it('chama routes-proxy com os IDs das rodovias', async () => {
    mockInvoke.mockResolvedValue({ data: {}, error: null });

    await fetchGoogleTraffic([MOCK_HIGHWAY]);

    expect(mockInvoke).toHaveBeenCalledWith('routes-proxy', {
      body: { highwayIds: ['rio-santos'] },
    });
  });

  it('retorna o resultado da Edge Function diretamente', async () => {
    const edgeResult = {
      'rio-santos': { level: 'livre', travelTime: 25 },
    };
    mockInvoke.mockResolvedValue({ data: edgeResult, error: null });

    const result = await fetchGoogleTraffic([MOCK_HIGHWAY]);

    expect(result).toEqual(edgeResult);
  });

  it('retorna objeto vazio quando a Edge Function retorna erro', async () => {
    mockInvoke.mockResolvedValue({ data: null, error: new Error('invoke failed') });

    const result = await fetchGoogleTraffic([MOCK_HIGHWAY]);

    expect(result).toEqual({});
  });

  it('retorna objeto vazio quando data é null sem erro', async () => {
    mockInvoke.mockResolvedValue({ data: null, error: null });

    const result = await fetchGoogleTraffic([MOCK_HIGHWAY]);

    expect(result).toEqual({});
  });

  it('passa múltiplas rodovias corretamente', async () => {
    const highways: HighwayStatic[] = [
      MOCK_HIGHWAY,
      { id: 'tamoios', name: 'Tamoios', shortName: 'Tamoios', distance: 82, typicalTravelTime: 55 },
    ];
    const edgeResult = {
      'rio-santos': { level: 'livre', travelTime: 25 },
      'tamoios': { level: 'moderado', travelTime: 60 },
    };
    mockInvoke.mockResolvedValue({ data: edgeResult, error: null });

    const result = await fetchGoogleTraffic(highways);

    expect(mockInvoke).toHaveBeenCalledWith('routes-proxy', {
      body: { highwayIds: ['rio-santos', 'tamoios'] },
    });
    expect(Object.keys(result).length).toBe(2);
  });
});
