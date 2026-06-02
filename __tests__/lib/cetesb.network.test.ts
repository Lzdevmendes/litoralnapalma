/**
 * Testes de integração (fetch mockado) para lib/cetesb.ts — fetchCETESBWaterQuality.
 */

import { fetchCETESBWaterQuality } from '@/lib/cetesb';

afterEach(() => {
  jest.restoreAllMocks();
});

function mockFetch(features: unknown[]) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ features }),
  }) as unknown as typeof fetch;
}

function feature(praia: string, classificacao_texto: string, data_amostra_final = 1700000000000) {
  return { attributes: { praia, municipio: 'Mock', classificacao_texto, data_amostra_final } };
}

// ── happy path ───────────────────────────────────────────────────────────────

describe('fetchCETESBWaterQuality — happy path', () => {
  it('retorna resultados mapeados para praias conhecidas', async () => {
    mockFetch([
      feature('MARTIM DE SA', 'Própria'),
      feature('ENSEADA', 'Imprópria'),
    ]);

    const results = await fetchCETESBWaterQuality();
    expect(results).toHaveLength(2);

    const martim = results.find((r) => r.beachId === 'martim-de-sa');
    expect(martim?.quality).toBe('boa');

    const enseada = results.find((r) => r.beachId === 'enseada');
    expect(enseada?.quality).toBe('impropia');
  });

  it('ignora praias não mapeadas em CETESB_NAME_MAP', async () => {
    mockFetch([feature('PRAIA DESCONHECIDA', 'Própria')]);
    const results = await fetchCETESBWaterQuality();
    expect(results).toHaveLength(0);
  });

  it('mapeia qualidade "Regular" corretamente', async () => {
    mockFetch([feature('PORTO NOVO', 'Regular')]);
    const results = await fetchCETESBWaterQuality();
    expect(results[0]?.quality).toBe('regular');
  });

  it('converte data_amostra_final (Unix ms) para ISO string', async () => {
    const ts = 1717200000000; // 2024-06-01T00:00:00.000Z
    mockFetch([feature('INDAIA', 'Própria', ts)]);
    const results = await fetchCETESBWaterQuality();
    expect(results[0]?.collectedAt).toBe(new Date(ts).toISOString());
  });

  it('handles accent-insensitive beach names (PEREQUE vs PEREQUÊ)', async () => {
    mockFetch([feature('PEREQUE', 'Própria')]);
    const results = await fetchCETESBWaterQuality();
    expect(results[0]?.beachId).toBe('perequê');
  });
});

// ── error handling ───────────────────────────────────────────────────────────

describe('fetchCETESBWaterQuality — error handling', () => {
  it('lança erro quando a API retorna status não-ok', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 503 }) as unknown as typeof fetch;
    await expect(fetchCETESBWaterQuality()).rejects.toThrow('CETESB FeatureServer error: 503');
  });

  it('lança erro quando features não é um array', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ features: null }),
    }) as unknown as typeof fetch;
    await expect(fetchCETESBWaterQuality()).rejects.toThrow('CETESB: resposta inesperada');
  });

  it('lança erro quando features está ausente', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    }) as unknown as typeof fetch;
    await expect(fetchCETESBWaterQuality()).rejects.toThrow('CETESB: resposta inesperada');
  });

  it('lança erro quando fetch rejeita (sem conexão)', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error')) as unknown as typeof fetch;
    await expect(fetchCETESBWaterQuality()).rejects.toThrow('Network error');
  });
});

// ── resultado vazio ───────────────────────────────────────────────────────────

describe('fetchCETESBWaterQuality — lista vazia', () => {
  it('retorna array vazio quando features é []', async () => {
    mockFetch([]);
    const results = await fetchCETESBWaterQuality();
    expect(results).toEqual([]);
  });
});
