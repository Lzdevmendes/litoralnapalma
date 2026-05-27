import { useQuery } from "@tanstack/react-query";
import { fetchWeather } from "@/lib/api";
import { DEFAULT_CITY } from "@/data/cities";
import type { City } from "@/data/cities";

export function useWeather(city: City = DEFAULT_CITY) {
  return useQuery({
    queryKey: ["weather", city.id],
    queryFn: () => fetchWeather(city.lat, city.lng),
    refetchInterval: 5 * 60 * 1000, // 5 min
    staleTime: 3 * 60 * 1000,
  });
}
