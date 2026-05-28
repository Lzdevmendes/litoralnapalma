import { useQuery } from '@tanstack/react-query';
import { DEFAULT_CITY } from '@/data/cities';
import type { City, BusLine } from '@/data/cities';

export interface BusLineWithTimes extends BusLine {
  nextDepartureIn: number | null;   // minutos até próxima partida (null = fora do horário)
  nextDepartureTime: string | null; // "14:35"
  lastDepartureFromGarage: string | null; // "14:05"
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function computeTimes(line: BusLine): BusLineWithTimes {
  const now = new Date();
  const currentMin = now.getHours() * 60 + now.getMinutes();

  const firstMin = timeToMinutes(line.firstDeparture);
  const lastMin = timeToMinutes(line.lastDeparture);

  if (currentMin < firstMin || currentMin > lastMin) {
    return {
      ...line,
      nextDepartureIn: null,
      nextDepartureTime: null,
      lastDepartureFromGarage: null,
    };
  }

  const elapsed = currentMin - firstMin;
  const cyclePos = elapsed % line.frequency;
  const minutesUntilNext = cyclePos === 0 ? 0 : line.frequency - cyclePos;
  const nextMin = currentMin + minutesUntilNext;

  const lastDepMin = currentMin - cyclePos;

  return {
    ...line,
    nextDepartureIn: minutesUntilNext,
    nextDepartureTime: nextMin <= lastMin ? minutesToTime(nextMin) : null,
    lastDepartureFromGarage: lastDepMin >= firstMin ? minutesToTime(lastDepMin) : null,
  };
}

export function useBusLines(city: City = DEFAULT_CITY) {
  return useQuery<BusLineWithTimes[]>({
    queryKey: ['bus', city.id],
    queryFn: () => Promise.resolve(city.busLines.map(computeTimes)),
    staleTime: 0,           // sempre re-calcula ao refetch
    refetchInterval: 60 * 1000, // atualiza contagem a cada 1 min
  });
}
