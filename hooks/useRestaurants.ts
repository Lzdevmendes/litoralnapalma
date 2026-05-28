import { useQuery } from '@tanstack/react-query';
import { DEFAULT_CITY } from '@/data/cities';
import type { City, Restaurant } from '@/data/cities';

export function useRestaurants(city: City = DEFAULT_CITY) {
  return useQuery<Restaurant[]>({
    queryKey: ['restaurants', city.id],
    queryFn: () => Promise.resolve(city.restaurants),
    staleTime: Infinity,
  });
}
