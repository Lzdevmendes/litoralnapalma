/**
 * Integração com os dados de balneabilidade da CETESB.
 *
 * Fonte: ArcGIS FeatureServer hospedado em arcgis.cetesb.sp.gov.br
 * Camada: Praias (FeatureServer/0) — Litoral Norte do Estado de SP
 * Publicação: semanal (toda 5ª-feira)
 *
 * Nota: em React Native, fetch() é HTTP nativo — sem restrições de CORS.
 */

const CETESB_URL =
  "https://arcgis.cetesb.sp.gov.br/server/rest/services/Hosted/Praias/FeatureServer/0/query";

// Mapeia nome da praia no CETESB (sem acento, uppercase) → ID interno do app
const CETESB_NAME_MAP: Record<string, string> = {
  // caraguatatuba
  "MARTIM DE SA": "martim-de-sa",
  INDAIA: "indaia",
  COCANHA: "cocanha",
  MASSAGUACU: "massaguaçu",
  "PORTO NOVO": "porto-novo",
  // São Sebastião
  BOICUCANGA: "boicucanga",
  CAMBURI: "camburi",
  MARESIAS: "maresias",
  // Ubatuba
  ENSEADA: "enseada",
  LAZARO: "lazaro",
  "DOMINGAS DIAS": "domingas-dias",
  PICINGUABA: "picinguaba",
  // Ilhabela
  PEREQUÊ: "perequê",
  PEREQUE: "perequê",
  CURRAL: "curral",
  VIANA: "viana",
  JABAQUARA: "jabaquara",
};

export function normalize(text: string): string {
  return text.toUpperCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
}

export function mapQuality(text: string): "boa" | "regular" | "impropia" {
  const n = normalize(text);
  if (n === "PROPRIA") return "boa";
  if (n === "REGULAR") return "regular";
  return "impropia";
}

export interface WaterQualityResult {
  beachId: string;
  quality: "boa" | "regular" | "impropia";
  collectedAt: string; // ISO string da data_amostra_final
}

interface CETESBFeature {
  attributes: {
    praia: string;
    municipio: string;
    classificacao_texto: string;
    data_amostra_final: number; // Unix ms
  };
}

interface CETESBResponse {
  features: CETESBFeature[];
}

/**
 * Busca a classificação atual de balneabilidade para todas as praias
 * do Litoral Norte. O resultado é cacheado pelo TanStack Query (staleTime 24h).
 */
export async function fetchCETESBWaterQuality(): Promise<WaterQualityResult[]> {
  const params = new URLSearchParams({
    where: "ugrhi='Litoral Norte'",
    outFields: "praia,municipio,classificacao_texto,data_amostra_final",
    returnGeometry: "false",
    f: "json",
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10_000);

  let res: Response;
  try {
    res = await fetch(`${CETESB_URL}?${params.toString()}`, { signal: controller.signal });
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('CETESB: timeout — servidor demorou mais de 10s');
    }
    throw err;
  }
  clearTimeout(timeoutId);

  if (!res.ok) {
    throw new Error(`CETESB FeatureServer error: ${res.status}`);
  }

  const json = (await res.json()) as CETESBResponse;

  if (!Array.isArray(json.features)) {
    throw new Error("CETESB: resposta inesperada");
  }

  const results: WaterQualityResult[] = [];

  for (const feature of json.features) {
    const { praia, classificacao_texto, data_amostra_final } =
      feature.attributes;
    const beachId = CETESB_NAME_MAP[normalize(praia)];
    if (!beachId) continue; // praia não mapeada — ignorar

    results.push({
      beachId,
      quality: mapQuality(classificacao_texto),
      collectedAt: new Date(data_amostra_final).toISOString(),
    });
  }

  return results;
}
