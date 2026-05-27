import { useQuery } from "@tanstack/react-query";
import { fetchTraffic } from "@/lib/api";

export function useTraffic() {
  return useQuery({
    queryKey: ["traffic"],
    queryFn: fetchTraffic,
    refetchInterval: 2 * 60 * 1000, // 2 min
    staleTime: 60 * 1000,
  });
}
