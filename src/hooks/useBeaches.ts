import { useQuery } from "@tanstack/react-query";
import { fetchBeaches } from "@/lib/api";

export function useBeaches() {
  return useQuery({
    queryKey: ["beaches"],
    queryFn: fetchBeaches,
    refetchInterval: 3 * 60 * 1000,
    staleTime: 2 * 60 * 1000,
  });
}
