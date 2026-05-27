import { useQuery } from "@tanstack/react-query";
import { fetchTraffic } from "@/lib/api";
import { DEFAULT_CITY } from "@/data/cities";
import type { City } from "@/data/cities";

export function useTraffic(city: City = DEFAULT_CITY) {
  return useQuery({
    queryKey: ["traffic", city.id],
    queryFn: () => fetchTraffic(city.id),
    refetchInterval: 2 * 60 * 1000,
    staleTime: 60 * 1000,
  });
}
