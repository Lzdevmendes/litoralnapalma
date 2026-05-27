import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchReports, submitReport } from "@/lib/api";
import type { ReportType } from "@/lib/types";

export function useReports() {
  return useQuery({
    queryKey: ["reports"],
    queryFn: fetchReports,
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
    }) => submitReport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}
