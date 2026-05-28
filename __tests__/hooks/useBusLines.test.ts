import { computeTimes } from '@/hooks/useBusLines';
import type { BusLine } from '@/data/cities';

const BASE_LINE: BusLine = {
  id: 'test-line',
  number: '100',
  name: 'Test Line',
  company: 'Test Co',
  type: 'municipal',
  firstDeparture: '06:00',
  lastDeparture: '22:00',
  frequency: 30, // every 30 min
  route: ['Terminal A', 'Parada B', 'Terminal C'],
  garageAddress: 'Rua Teste, 1',
};

/** Fakes the current time to a specific HH:MM for testing (local time). */
function mockTime(hh: number, mm: number) {
  const d = new Date();
  d.setHours(hh, mm, 0, 0);
  jest.useFakeTimers();
  jest.setSystemTime(d);
}

afterEach(() => {
  jest.useRealTimers();
});

// ── before operating hours ───────────────────────────────────────────────────

describe('computeTimes — before first departure', () => {
  it('returns null times when current time is before firstDeparture', () => {
    mockTime(5, 30); // 05:30, before 06:00
    const result = computeTimes(BASE_LINE);
    expect(result.nextDepartureIn).toBeNull();
    expect(result.nextDepartureTime).toBeNull();
    expect(result.lastDepartureFromGarage).toBeNull();
  });
});

// ── after operating hours ────────────────────────────────────────────────────

describe('computeTimes — after last departure', () => {
  it('returns null times when current time is after lastDeparture', () => {
    mockTime(22, 30); // 22:30, after 22:00
    const result = computeTimes(BASE_LINE);
    expect(result.nextDepartureIn).toBeNull();
    expect(result.nextDepartureTime).toBeNull();
    expect(result.lastDepartureFromGarage).toBeNull();
  });
});

// ── exactly on a departure ───────────────────────────────────────────────────

describe('computeTimes — at departure time', () => {
  it('returns nextDepartureIn = 0 when on the exact departure minute', () => {
    mockTime(6, 0); // exactly at firstDeparture
    const result = computeTimes(BASE_LINE);
    expect(result.nextDepartureIn).toBe(0);
    expect(result.nextDepartureTime).toBe('06:00');
  });

  it('returns nextDepartureIn = 0 at 06:30 (second departure)', () => {
    mockTime(6, 30);
    const result = computeTimes(BASE_LINE);
    expect(result.nextDepartureIn).toBe(0);
    expect(result.nextDepartureTime).toBe('06:30');
  });
});

// ── between departures ───────────────────────────────────────────────────────

describe('computeTimes — between departures', () => {
  it('calculates minutes until next departure', () => {
    mockTime(6, 10); // 10 min after 06:00, next at 06:30
    const result = computeTimes(BASE_LINE);
    expect(result.nextDepartureIn).toBe(20);
    expect(result.nextDepartureTime).toBe('06:30');
  });

  it('tracks last departure from garage', () => {
    mockTime(6, 10); // last departure was at 06:00
    const result = computeTimes(BASE_LINE);
    expect(result.lastDepartureFromGarage).toBe('06:00');
  });

  it('calculates correctly in the middle of the day', () => {
    mockTime(12, 15); // 15 min after 12:00, next at 12:30
    const result = computeTimes(BASE_LINE);
    expect(result.nextDepartureIn).toBe(15);
    expect(result.nextDepartureTime).toBe('12:30');
    expect(result.lastDepartureFromGarage).toBe('12:00');
  });
});

// ── edge: frequency boundary ─────────────────────────────────────────────────

describe('computeTimes — 1-minute before departure', () => {
  it('returns 1 minute until next', () => {
    mockTime(6, 29); // 1 minute before 06:30
    const result = computeTimes(BASE_LINE);
    expect(result.nextDepartureIn).toBe(1);
    expect(result.nextDepartureTime).toBe('06:30');
  });
});

// ── preserves all BusLine fields ─────────────────────────────────────────────

describe('computeTimes — field preservation', () => {
  it('includes all original BusLine fields in result', () => {
    mockTime(10, 0);
    const result = computeTimes(BASE_LINE);
    expect(result.id).toBe(BASE_LINE.id);
    expect(result.number).toBe(BASE_LINE.number);
    expect(result.name).toBe(BASE_LINE.name);
    expect(result.company).toBe(BASE_LINE.company);
    expect(result.type).toBe(BASE_LINE.type);
    expect(result.route).toEqual(BASE_LINE.route);
    expect(result.frequency).toBe(BASE_LINE.frequency);
  });
});
