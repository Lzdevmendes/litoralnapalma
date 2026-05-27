import { useQuery } from "@tanstack/react-query";
import { fetchCETESBWaterQuality } from "@/lib/cetesb";

/**
 * Busca a classificação de balneabilidade atual da CETESB.
 * Cache de 24h — dados são publicados semanalmente (5ª-feira).
 * Falha silenciosamente: erro na API não impede o app de funcionar.
 */
export function useWaterQuality() {
  return useQuery({
    queryKey: ["water-quality"],
    queryFn: fetchCETESBWaterQuality,
    staleTime: 24 * 60 * 60 * 1000, // 24h
    retry: 1,
    // não re-buscar automaticamente — dado é semanal
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });
}
