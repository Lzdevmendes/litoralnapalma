/**
 * Testes para lib/reports.ts — funções puras e utilitárias.
 * AsyncStorage é mockado via jest para evitar dependência do módulo nativo.
 */

// Mock AsyncStorage antes de qualquer import que o use
const mockStorage: Record<string, string> = {};

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn((key: string) => Promise.resolve(mockStorage[key] ?? null)),
  setItem: jest.fn((key: string, value: string) => {
    mockStorage[key] = value;
    return Promise.resolve();
  }),
  removeItem: jest.fn((key: string) => {
    delete mockStorage[key];
    return Promise.resolve();
  }),
  clear: jest.fn(() => {
    Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
    return Promise.resolve();
  }),
}));

jest.mock('expo-crypto', () => ({
  randomUUID: jest.fn(() => 'test-uuid-1234-5678-9abc'),
}));

// ── Supabase mock — chainable query builder ─────────────────────────────────
// Mimics the thenable chain shape of @supabase/supabase-js's PostgrestFilterBuilder
// (.select/.insert/.gt/.eq/.order/.single, awaitable to { data, error }) so the
// real Supabase-calling code in lib/reports.ts (fetchReportsFromSupabase,
// submitReportToSupabase, upvoteReport) can be exercised, not just the
// AsyncStorage-backed helpers above.

const mockQueryResult: { data: unknown; error: unknown } = { data: [], error: null };
const mockSingleResult: { data: unknown; error: unknown } = { data: null, error: null };
const mockRpcResult: { data: unknown; error: unknown } = { data: null, error: null };
const mockBuilders: any[] = [];

function mockMakeBuilder(): any {
  const builder: any = {};
  builder.select = jest.fn(() => builder);
  builder.insert = jest.fn(() => builder);
  builder.gt = jest.fn(() => builder);
  builder.eq = jest.fn(() => builder);
  builder.order = jest.fn(() => builder);
  builder.single = jest.fn(() => Promise.resolve(mockSingleResult));
  builder.then = (resolve: (v: unknown) => unknown, reject?: (e: unknown) => unknown) =>
    Promise.resolve(mockQueryResult).then(resolve, reject);
  return builder;
}

const mockFrom = jest.fn(() => {
  const builder = mockMakeBuilder();
  mockBuilders.push(builder);
  return builder;
});
const mockRpc = jest.fn(() => Promise.resolve(mockRpcResult));

jest.mock('@/lib/supabase', () => ({
  // `from`/`rpc` are wrapped in closures (rather than passed directly) because
  // jest.mock factories run before the `const mockFrom`/`mockRpc` bindings below
  // are assigned — a direct reference would freeze in `undefined`. The wrappers
  // defer the lookup of `mockFrom`/`mockRpc` to call time, when they're defined.
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
    rpc: (...args: unknown[]) => mockRpc(...args),
  },
  isSupabaseConfigured: true,
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getDeviceId,
  hasUpvoted,
  fetchReportsFromSupabase,
  submitReportToSupabase,
  upvoteReport,
} from '@/lib/reports';

beforeEach(() => {
  Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
  jest.clearAllMocks();
  mockQueryResult.data = [];
  mockQueryResult.error = null;
  mockSingleResult.data = null;
  mockSingleResult.error = null;
  mockRpcResult.data = null;
  mockRpcResult.error = null;
  mockBuilders.length = 0;
});

// ── getDeviceId ───────────────────────────────────────────────────────────────

describe('getDeviceId', () => {
  it('gera novo UUID quando nenhum está armazenado', async () => {
    const id = await getDeviceId();
    expect(id).toBe('test-uuid-1234-5678-9abc');
  });

  it('retorna o mesmo UUID em chamadas subsequentes', async () => {
    const first = await getDeviceId();
    const second = await getDeviceId();
    expect(first).toBe(second);
  });

  it('persiste o UUID no AsyncStorage', async () => {
    await getDeviceId();
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      '@litoral_na_palma:device_id',
      'test-uuid-1234-5678-9abc',
    );
  });

  it('reutiliza UUID existente sem gerar um novo', async () => {
    mockStorage['@litoral_na_palma:device_id'] = 'existing-id';
    const id = await getDeviceId();
    expect(id).toBe('existing-id');
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });
});

// ── hasUpvoted ────────────────────────────────────────────────────────────────

describe('hasUpvoted', () => {
  it('retorna false para report nunca upvotado', async () => {
    const result = await hasUpvoted('report-abc');
    expect(result).toBe(false);
  });

  it('retorna true quando o id está na lista armazenada', async () => {
    mockStorage['@litoral_na_palma:upvoted_reports'] = JSON.stringify(['report-abc', 'report-xyz']);
    expect(await hasUpvoted('report-abc')).toBe(true);
    expect(await hasUpvoted('report-xyz')).toBe(true);
  });

  it('retorna false para id não presente na lista', async () => {
    mockStorage['@litoral_na_palma:upvoted_reports'] = JSON.stringify(['report-abc']);
    expect(await hasUpvoted('report-other')).toBe(false);
  });

  it('trata AsyncStorage null (vazio) sem erro', async () => {
    const result = await hasUpvoted('anything');
    expect(result).toBe(false);
  });
});

// ── fetchReportsFromSupabase ─────────────────────────────────────────────────

describe('fetchReportsFromSupabase', () => {
  const rawRow = {
    id: 'report-1',
    type: 'acidente',
    description: 'Colisão na pista',
    lat: -23.5,
    lng: -45.4,
    city: 'caraguatatuba',
    created_at: '2026-06-01T10:00:00.000Z',
    expires_at: '2026-06-01T22:00:00.000Z',
    upvotes: 3,
  };

  it('mapeia linhas snake_case do Supabase (rowToReport) para o formato Report camelCase', async () => {
    mockQueryResult.data = [rawRow];

    const reports = await fetchReportsFromSupabase();

    expect(reports).toEqual([
      {
        id: 'report-1',
        type: 'acidente',
        description: 'Colisão na pista',
        lat: -23.5,
        lng: -45.4,
        city: 'caraguatatuba',
        createdAt: '2026-06-01T10:00:00.000Z',
        expiresAt: '2026-06-01T22:00:00.000Z',
        upvotes: 3,
      },
    ]);
  });

  it('filtra por expires_at > agora, ordena por mais recente, e NÃO filtra por cidade quando cityId não é informado', async () => {
    await fetchReportsFromSupabase();

    const builder = mockBuilders[0];
    expect(builder.gt).toHaveBeenCalledWith('expires_at', expect.any(String));
    expect(builder.order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(builder.eq).not.toHaveBeenCalled();
  });

  it('aplica filtro de cidade via .eq no cliente quando cityId é informado — a policy RLS de "reports: public read" não filtra por cidade', async () => {
    await fetchReportsFromSupabase('caraguatatuba');

    const builder = mockBuilders[0];
    expect(builder.eq).toHaveBeenCalledWith('city', 'caraguatatuba');
  });

  it('propaga erro retornado pelo Supabase', async () => {
    mockQueryResult.data = null;
    mockQueryResult.error = new Error('network down');

    await expect(fetchReportsFromSupabase()).rejects.toThrow('network down');
  });
});

// ── submitReportToSupabase ───────────────────────────────────────────────────

describe('submitReportToSupabase', () => {
  const input = {
    type: 'lotacao_praia' as const,
    description: 'Praia cheia',
    lat: -23.6,
    lng: -45.3,
    city: 'ubatuba',
  };

  const insertedRow = {
    id: 'report-new',
    type: 'lotacao_praia',
    description: 'Praia cheia',
    lat: -23.6,
    lng: -45.3,
    city: 'ubatuba',
    created_at: '2026-06-07T12:00:00.000Z',
    expires_at: '2026-06-07T18:00:00.000Z',
    upvotes: 0,
  };

  it('insere o payload (description quando informada) e retorna o Report mapeado da linha criada', async () => {
    mockSingleResult.data = insertedRow;

    const result = await submitReportToSupabase(input);

    const builder = mockBuilders[0];
    expect(builder.insert).toHaveBeenCalledWith({
      type: 'lotacao_praia',
      description: 'Praia cheia',
      lat: -23.6,
      lng: -45.3,
      city: 'ubatuba',
    });
    expect(result).toEqual({
      id: 'report-new',
      type: 'lotacao_praia',
      description: 'Praia cheia',
      lat: -23.6,
      lng: -45.3,
      city: 'ubatuba',
      createdAt: '2026-06-07T12:00:00.000Z',
      expiresAt: '2026-06-07T18:00:00.000Z',
      upvotes: 0,
    });
  });

  it('usa null no payload quando description não é informada', async () => {
    mockSingleResult.data = { ...insertedRow, description: null };

    await submitReportToSupabase({ ...input, description: undefined });

    const builder = mockBuilders[0];
    expect(builder.insert).toHaveBeenCalledWith(
      expect.objectContaining({ description: null }),
    );
  });

  it('propaga erro retornado pelo Supabase ao inserir', async () => {
    mockSingleResult.error = new Error('insert failed');

    await expect(submitReportToSupabase(input)).rejects.toThrow('insert failed');
  });
});

// ── upvoteReport ─────────────────────────────────────────────────────────────
// upvoteReport + hasUpvoted/markUpvoted são, hoje, a ÚNICA proteção contra duplo-voto
// que existe de ponta a ponta — a RPC `increment_report_upvote` chamada aqui não usa
// `report_upvotes` (PK composta + RLS prontas no banco, mas desconectadas do caminho
// real). Ou seja: esta camada puramente client-side (AsyncStorage) é tudo o que impede
// o duplo-voto local — daí a importância de testá-la a fundo.

describe('upvoteReport', () => {
  it('lança erro e NÃO chama a RPC quando o device já votou neste report', async () => {
    mockStorage['@litoral_na_palma:upvoted_reports'] = JSON.stringify(['report-abc']);

    await expect(upvoteReport('report-abc')).rejects.toThrow('Você já votou neste reporte');
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it('chama increment_report_upvote via RPC e marca o report como votado localmente', async () => {
    await upvoteReport('report-xyz');

    expect(mockRpc).toHaveBeenCalledWith('increment_report_upvote', { report_id: 'report-xyz' });
    expect(await hasUpvoted('report-xyz')).toBe(true);
  });

  it('propaga erro da RPC e NÃO marca o report como votado — evita estado client-side inconsistente com o servidor', async () => {
    mockRpcResult.error = new Error('rpc failed');

    await expect(upvoteReport('report-err')).rejects.toThrow('rpc failed');
    expect(await hasUpvoted('report-err')).toBe(false);
  });
});
