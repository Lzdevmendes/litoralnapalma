import { useQuery } from '@tanstack/react-query';
import { DEFAULT_CITY } from '@/data/cities';
import type { City, GasStation } from '@/data/cities';

export function useGasStations(city: City = DEFAULT_CITY) {
  return useQuery<GasStation[]>({
    queryKey: ['gas', city.id],
    queryFn: () => Promise.resolve(city.gasStations),
    staleTime: 6 * 60 * 60 * 1000, // 6h
    gcTime: 8 * 60 * 60 * 1000,
  });
}
