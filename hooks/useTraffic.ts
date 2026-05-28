import { useQuery } from "@tanstack/react-query";
import { fetchTraffic } from "@/lib/api";
import { DEFAULT_CITY } from "@/data/cities";
import type { City } from "@/data/cities";

export function useTraffic(city: City = DEFAULT_CITY) {
  return useQuery({
    queryKey: ["traffic", city.id],
    queryFn: () => fetchTraffic(city.id),
    staleTime: 5 * 60 * 1000,  // 5 min — alinhado com o cache da API de trânsito
    refetchInterval: 5 * 60 * 1000,
  });
}
