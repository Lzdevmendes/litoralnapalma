import { translations } from '@/lib/i18n';

const pt = translations.pt;
const en = translations.en;

/**
 * Recursively collects all leaf-key paths from an object.
 * e.g. { a: { b: 'x' } } → ['a.b']
 */
function collectKeys(obj: object, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) => {
    const path = prefix ? `${prefix}.${k}` : k;
    return typeof v === 'object' && v !== null ? collectKeys(v as object, path) : [path];
  });
}

// ── structural parity ────────────────────────────────────────────────────────

describe('i18n — PT and EN have the same keys', () => {
  const ptKeys = collectKeys(pt).sort();
  const enKeys = collectKeys(en).sort();

  it('EN has all keys that PT has', () => {
    const missingInEn = ptKeys.filter((k) => !enKeys.includes(k));
    expect(missingInEn).toEqual([]);
  });

  it('PT has all keys that EN has', () => {
    const missingInPt = enKeys.filter((k) => !ptKeys.includes(k));
    expect(missingInPt).toEqual([]);
  });
});

// ── no empty strings ─────────────────────────────────────────────────────────

describe('i18n — no translation is an empty string', () => {
  function findEmpty(obj: object, prefix = ''): string[] {
    return Object.entries(obj).flatMap(([k, v]) => {
      const path = prefix ? `${prefix}.${k}` : k;
      if (typeof v === 'string') return v === '' ? [path] : [];
      if (typeof v === 'object' && v !== null) return findEmpty(v as object, path);
      return [];
    });
  }

  it('PT has no empty strings', () => {
    expect(findEmpty(pt)).toEqual([]);
  });

  it('EN has no empty strings', () => {
    expect(findEmpty(en)).toEqual([]);
  });
});

// ── key spot-checks ───────────────────────────────────────────────────────────

describe('i18n — spot checks on critical keys', () => {
  it('PT traffic levels are defined', () => {
    expect(pt.traffic.levels.livre).toBeTruthy();
    expect(pt.traffic.levels.moderado).toBeTruthy();
    expect(pt.traffic.levels.lento).toBeTruthy();
    expect(pt.traffic.levels.parado).toBeTruthy();
  });

  it('EN traffic levels are defined', () => {
    expect(en.traffic.levels.livre).toBeTruthy();
    expect(en.traffic.levels.parado).toBeTruthy();
  });

  it('PT beach occupancy labels are defined', () => {
    expect(pt.beach.occupancy.vazia).toBeTruthy();
    expect(pt.beach.occupancy.moderada).toBeTruthy();
    expect(pt.beach.occupancy.lotada).toBeTruthy();
  });

  it('EN beach water quality labels are defined', () => {
    expect(en.beach.water.boa).toBeTruthy();
    expect(en.beach.water.regular).toBeTruthy();
    expect(en.beach.water.impropia).toBeTruthy();
  });

  it('PT UPA status labels are defined', () => {
    expect(pt.upa.status.normal).toBeTruthy();
    expect(pt.upa.status.alerta).toBeTruthy();
    expect(pt.upa.status.critico).toBeTruthy();
  });

  it('EN error messages are defined', () => {
    expect(en.error.noConnection).toBeTruthy();
    expect(en.error.retry).toBeTruthy();
  });

  it('PT and EN have different resident labels (sanity check)', () => {
    expect(pt.header.resident).not.toBe(en.header.resident);
  });
});
