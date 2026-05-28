import { normalize, mapQuality } from '@/lib/cetesb';

// ── normalize ────────────────────────────────────────────────────────────────

describe('normalize', () => {
  it('converts to uppercase', () => {
    expect(normalize('praia')).toBe('PRAIA');
  });

  it('removes diacritics', () => {
    expect(normalize('Própria')).toBe('PROPRIA');
    expect(normalize('Imprópria')).toBe('IMPROPRIA');
    expect(normalize('Perequê')).toBe('PEREQUÊ'.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toUpperCase());
  });

  it('trims surrounding whitespace', () => {
    expect(normalize('  PRAIA  ')).toBe('PRAIA');
  });

  it('handles already-normalized strings', () => {
    expect(normalize('PROPRIA')).toBe('PROPRIA');
    expect(normalize('REGULAR')).toBe('REGULAR');
  });
});

// ── mapQuality ───────────────────────────────────────────────────────────────

describe('mapQuality', () => {
  it('maps "Propria" (case-insensitive) to "boa"', () => {
    expect(mapQuality('Propria')).toBe('boa');
    expect(mapQuality('PROPRIA')).toBe('boa');
    expect(mapQuality('propria')).toBe('boa');
  });

  it('maps "Própria" (with accent) to "boa"', () => {
    expect(mapQuality('Própria')).toBe('boa');
  });

  it('maps "Regular" to "regular"', () => {
    expect(mapQuality('Regular')).toBe('regular');
    expect(mapQuality('REGULAR')).toBe('regular');
  });

  it('maps any other value to "impropia"', () => {
    expect(mapQuality('Imprópria')).toBe('impropia');
    expect(mapQuality('IMPROPRIA')).toBe('impropia');
    expect(mapQuality('')).toBe('impropia');
    expect(mapQuality('unknown')).toBe('impropia');
  });
});
