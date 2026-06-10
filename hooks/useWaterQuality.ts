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
    // CETESB publica semanalmente (5ª-feira), mas refresca diariamente
    // para capturar atualizações fora do ciclo regular e mantê-las frescas
    refetchInterval: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
