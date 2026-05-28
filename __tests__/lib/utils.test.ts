import {
  trafficLevelColor,
  occupancyColor,
  formatWaitTime,
  timeAgo,
  haversineDistance,
  formatDistance,
} from '@/lib/utils';

// ── trafficLevelColor ────────────────────────────────────────────────────────

describe('trafficLevelColor', () => {
  it('returns green for livre', () => {
    expect(trafficLevelColor('livre')).toBe('#22c55e');
  });
  it('returns amber for moderado', () => {
    expect(trafficLevelColor('moderado')).toBe('#f59e0b');
  });
  it('returns orange for lento', () => {
    expect(trafficLevelColor('lento')).toBe('#f97316');
  });
  it('returns red for parado', () => {
    expect(trafficLevelColor('parado')).toBe('#ef4444');
  });
});

// ── occupancyColor ───────────────────────────────────────────────────────────

describe('occupancyColor', () => {
  it('returns green for vazia', () => {
    expect(occupancyColor('vazia')).toBe('#22c55e');
  });
  it('returns amber for moderada', () => {
    expect(occupancyColor('moderada')).toBe('#f59e0b');
  });
  it('returns red for lotada', () => {
    expect(occupancyColor('lotada')).toBe('#ef4444');
  });
});

// ── formatWaitTime ───────────────────────────────────────────────────────────

describe('formatWaitTime', () => {
  it('formats minutes under 60 as "X min"', () => {
    expect(formatWaitTime(0)).toBe('0 min');
    expect(formatWaitTime(30)).toBe('30 min');
    expect(formatWaitTime(59)).toBe('59 min');
  });
  it('formats exactly 60 minutes as "1h"', () => {
    expect(formatWaitTime(60)).toBe('1h');
  });
  it('formats 90 minutes as "1h 30min"', () => {
    expect(formatWaitTime(90)).toBe('1h 30min');
  });
  it('formats 120 minutes as "2h"', () => {
    expect(formatWaitTime(120)).toBe('2h');
  });
  it('formats 150 minutes as "2h 30min"', () => {
    expect(formatWaitTime(150)).toBe('2h 30min');
  });
});

// ── timeAgo ──────────────────────────────────────────────────────────────────

describe('timeAgo', () => {
  const fakeNow = new Date('2025-07-01T12:00:00.000Z').getTime();

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(fakeNow);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns "agora" (PT) when under 1 minute', () => {
    const iso = new Date(fakeNow - 30_000).toISOString();
    expect(timeAgo(iso, 'pt')).toBe('agora');
  });

  it('returns "just now" (EN) when under 1 minute', () => {
    const iso = new Date(fakeNow - 30_000).toISOString();
    expect(timeAgo(iso, 'en')).toBe('just now');
  });

  it('returns "há 5 min" (PT) for 5 minutes ago', () => {
    const iso = new Date(fakeNow - 5 * 60_000).toISOString();
    expect(timeAgo(iso, 'pt')).toBe('há 5 min');
  });

  it('returns "5 min ago" (EN) for 5 minutes ago', () => {
    const iso = new Date(fakeNow - 5 * 60_000).toISOString();
    expect(timeAgo(iso, 'en')).toBe('5 min ago');
  });

  it('returns "há 2h" (PT) for 2 hours ago', () => {
    const iso = new Date(fakeNow - 2 * 3_600_000).toISOString();
    expect(timeAgo(iso, 'pt')).toBe('há 2h');
  });

  it('returns "2h ago" (EN) for 2 hours ago', () => {
    const iso = new Date(fakeNow - 2 * 3_600_000).toISOString();
    expect(timeAgo(iso, 'en')).toBe('2h ago');
  });

  it('defaults to PT locale', () => {
    const iso = new Date(fakeNow - 5 * 60_000).toISOString();
    expect(timeAgo(iso)).toBe('há 5 min');
  });
});

// ── haversineDistance ────────────────────────────────────────────────────────

describe('haversineDistance', () => {
  it('returns 0 for identical coordinates', () => {
    expect(haversineDistance(-23.5, -45.0, -23.5, -45.0)).toBeCloseTo(0, 5);
  });

  it('returns ~111 km per degree of latitude', () => {
    // 1 degree latitude ≈ 111.2 km
    const d = haversineDistance(0, 0, 1, 0);
    expect(d).toBeGreaterThan(110);
    expect(d).toBeLessThan(112);
  });

  it('calculates distance between Caraguatatuba and São Sebastião (≈40 km)', () => {
    // Approximate coordinates
    const d = haversineDistance(-23.617, -45.412, -23.796, -45.859);
    expect(d).toBeGreaterThan(35);
    expect(d).toBeLessThan(55);
  });
});

// ── formatDistance ───────────────────────────────────────────────────────────

describe('formatDistance', () => {
  it('formats distances under 1 km in metres', () => {
    expect(formatDistance(0.5)).toBe('500m');
    expect(formatDistance(0.1)).toBe('100m');
  });

  it('formats distances of 1 km and above with 1 decimal', () => {
    expect(formatDistance(1)).toBe('1.0km');
    expect(formatDistance(2.5)).toBe('2.5km');
    expect(formatDistance(10)).toBe('10.0km');
  });
});
