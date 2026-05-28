import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchReports, submitReport } from "@/lib/api";
import { upvoteReport } from "@/lib/reports";
import { DEFAULT_CITY } from "@/data/cities";
import type { City } from "@/data/cities";
import type { ReportType } from "@/lib/types";

export function useReports(city: City = DEFAULT_CITY) {
  return useQuery({
    queryKey: ["reports", city.id],
    queryFn: () => fetchReports(city.id),
    refetchInterval: 60 * 1000,
    staleTime: 30 * 1000,
  });
}

export function useSubmitReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      type: ReportType;
      description?: string;
      lat: number;
      lng: number;
      city: string;
    }) => submitReport(data),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["reports", vars.city] });
    },
  });
}

export function useUpvoteReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reportId: string) => upvoteReport(reportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}
