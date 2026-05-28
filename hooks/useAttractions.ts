import { useQuery } from '@tanstack/react-query';
import { DEFAULT_CITY } from '@/data/cities';
import type { City, Attraction } from '@/data/cities';

export function useAttractions(city: City = DEFAULT_CITY) {
  return useQuery<Attraction[]>({
    queryKey: ['attractions', city.id],
    queryFn: () => Promise.resolve(city.attractions),
    staleTime: Infinity,
  });
}
