import { useQuery } from '@tanstack/react-query';
import { getMockFerry } from '@/data/mock';

/**
 * Busca o status atual da balsa São Sebastião ↔ Ilhabela.
 * Refetch a cada 10 min — tempo de espera pode mudar rapidamente em feriados.
 *
 * TODO: substituir getMockFerry por fetchDERFerry() quando a API DER-SP
 * for mapeada (https://www.der.sp.gov.br/website/Balsa/Index.aspx).
 */
export function useFerry() {
  return useQuery({
    queryKey: ['ferry'],
    queryFn: getMockFerry,
    staleTime: 10 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}
