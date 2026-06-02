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

jest.mock('@/lib/supabase', () => ({
  supabase: null,
  isSupabaseConfigured: false,
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDeviceId, hasUpvoted } from '@/lib/reports';

beforeEach(() => {
  Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
  jest.clearAllMocks();
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
