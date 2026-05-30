import { useQuery } from "@tanstack/react-query";
import { fetchBeaches } from "@/lib/api";
import { DEFAULT_CITY } from "@/data/cities";
import type { City } from "@/data/cities";

export function useBeaches(city: City = DEFAULT_CITY) {
  return useQuery({
    queryKey: ["beaches", city.id],
    queryFn: () => fetchBeaches(city.id),
    refetchInterval: 3 * 60 * 1000,
    staleTime: 3 * 60 * 1000,
  });
}
