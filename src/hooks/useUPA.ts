import { useQuery } from "@tanstack/react-query";
import { fetchUPAs } from "@/lib/api";

export function useUPA() {
  return useQuery({
    queryKey: ["upas"],
    queryFn: fetchUPAs,
    refetchInterval: 3 * 60 * 1000,
    staleTime: 2 * 60 * 1000,
  });
}
