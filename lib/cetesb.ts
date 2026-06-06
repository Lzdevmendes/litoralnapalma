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

/**
 * Mapeia nome/município do CETESB → ID interno do app.
 *
 * Formatos aceitos como chave:
 *   "PRAIA"              — casamento exato ou por prefixo (ex: "MASSAGUACU" casa com
 *                          "MASSAGUACU - R. M. CARLOTA" retornado pela API)
 *   "MUNICIPIO:PRAIA"    — qualificado por município para nomes ambíguos como "GRANDE"
 *                          (que aparece em Ilhabela, São Sebastião e Ubatuba)
 */
const CETESB_NAME_MAP: Record<string, string> = {
  // ── Caraguatatuba ────────────────────────────────────────────────────────────
  "MARTIM DE SA": "martim-de-sa",
  INDAIA: "indaia",
  COCANHA: "cocanha",
  MASSAGUACU: "massaguacu", // prefixo: "MASSAGUACU - R. M. CARLOTA"
  "PORTO NOVO": "porto-novo",
  "LAGOA AZUL": "lagoa-azul",
  ARUAN: "aruan",
  PALMEIRAS: "palmeiras",
  MOCOCA: "mococa",
  "CARAGUATATUBA:CENTRO": "centro-cara", // qualificado: "CENTRO" é ambíguo
  "CARAGUATATUBA:PRAINHA": "prainha-cara", // qualificado: "PRAINHA" existe em SS também
  TABATINGA: "tabatinga", // prefixo: "TABATINGA - COND. GAIVOTAS" e "TABATINGA - RIO TABATINGA"
  CAPRICORNIO: "capricornio",

  // ── São Sebastião ────────────────────────────────────────────────────────────
  "SAO SEBASTIAO:GRANDE": "praia-grande-ss", // qualificado: "GRANDE" é ambíguo
  "SAO SEBASTIAO:PRAINHA": "prainha-ss", // qualificado: "PRAINHA" é ambíguo
  BOICUCANGA: "boicucanga",
  CAMBURI: "camburi",
  MARESIAS: "maresias", // prefixo: "MARESIAS - TOTEM"
  JUQUEI: "juquei", // prefixo: "JUQUEÍ - R. CRISTIANA" e "JUQUEÍ - TRAV. ..."
  BORACEIA: "boraceia", // prefixo: "BORACEIA - NORTE" e "BORACEIA - RUA CUBATÃO"
  "TOQUE-TOQUE PEQUENO": "toque-toque-pequeno",

  "TOQUE-TOQUE GRANDE": "toque-toque-grande",
  ARRASTAO: "arrastao",
  BALEIA: "baleia",
  BAREQUECABA: "barequeçaba", // CETESB: "BAREQUEÇABA" → normalize → "BAREQUECABA"
  CAMBURIZINHO: "camburizinho",
  CIGARRAS: "cigarras",
  DESERTA: "deserta",
  ENGENHO: "engenho-ss",
  GUAECA: "guaeca",
  "JUREIA DO NORTE": "jureia-norte",
  PAUBA: "pauba",
  "PONTAL DA CRUZ": "pontal-da-cruz",
  "PORTO GRANDE": "porto-grande",
  PRETA: "preta",
  "PRETA DO NORTE": "preta-do-norte",
  SANTIAGO: "santiago",
  SAI: "sai",
  "SAO FRANCISCO": "sao-francisco",
  UNA: "una",

  // ── Ubatuba ──────────────────────────────────────────────────────────────────
  ENSEADA: "enseada",
  LAZARO: "lazaro",
  "DOMINGAS DIAS": "domingas-dias",
  PICINGUABA: "picinguaba",
  FELIX: "felix", // CETESB: "FÉLIX" → normalize → "FELIX"
  ITAMAMBUCA: "itamambuca",
  "PRAIA DO PRUMIRIM": "prumirim",
  "LAGOA PRUMIRIM": "prumirim",
  LAGOINHA: "lagoinha", // prefixo: "LAGOINHA - AV. E. VELHO" e "LAGOINHA - CAMPING"
  "PEREQUE-ACU": "perequé-acu", // CETESB: "PEREQUÊ-AÇU" → normalize → "PEREQUE-ACU"
  "PEREQUE-MIRIM": "perequê-mirim",
  TONINHAS: "toninhas",
  DURA: "dura",
  FORTALEZA: "fortaleza",
  "UBATUBA:GRANDE": "grande-ubatuba", // qualificado: "GRANDE" é ambíguo
  IPEROIG: "iperoig",
  IGUATUA: "itaguá", // CETESB: "ITAGUÁ" → normalize → "IGUATUA"
  MARANDUBA: "maranduba",
  PULSO: "pulso",
  "RIO ITAMAMBUCA": "rio-itamambuca",
  "SANTA RITA": "santa-rita",
  SAPE: "sape", // CETESB: "SAPÉ" → normalize → "SAPE"
  SUNUNGA: "sununga",
  TENORIO: "tenorio", // CETESB: "TENÓRIO" → normalize → "TENORIO"
  VERMELHA: "vermelha",
  "VERMELHA DO NORTE": "vermelha-do-norte",
  // Ilha Anchieta (sufixo "- ILHA ANCHIETA" — casamento exato após normalize)
  "PRAIA DAS PALMAS- ILHA ANCHIETA": "anchieta-palmas",
  "PRAIA DO PRESIDIO- ILHA ANCHIETA": "anchieta-presidio",
  "PRAIA DO SAPATEIRO- ILHA ANCHIETA": "anchieta-sapateiro",
  "PRAIA DO SUL- ILHA ANCHIETA": "anchieta-sul",
  "PRAINHA DE FORA- ILHA ANCHIETA": "anchieta-prainhafora",
  "PRAINHA DO ENGENHO- ILHA ANCHIETA": "anchieta-engenho",
  "PRAINHA DO LESTE- ILHA ANCHIETA": "anchieta-leste",

  // ── Ilhabela ─────────────────────────────────────────────────────────────────
  PEREQUE: "perequê",
  CURRAL: "curral",
  VIANA: "viana",
  PORTINHO: "portinho",
  "PRAIA DO JULIAO": "juliao",
  FEITICEIRA: "feiticeira",
  ARMACAO: "armacao",
  BARREIROS: "barreiros", // prefixo: "BARREIROS NORTE" e "BARREIROS SUL"
  "ENG. D'AGUA": "eng-dagua", // CETESB: "ENG. D'ÁGUA" → normalize → "ENG. D'AGUA"
  "ILHABELA:GRANDE": "grande-ilhab", // qualificado: "GRANDE" é ambíguo
  "ILHA DAS CABRAS": "ilha-cabras",
  ITAGUACU: "itaguacu",
  ITAQUANDUBA: "itaquanduba",
  PINTO: "pinto",
  "SACO DA CAPELA": "saco-da-capela",
  SINO: "sino",
  SIRIUBA: "siriuba", // CETESB: "SIRIÚBA" → normalize → "SIRIUBA"
  VELOSO: "veloso",
};

export function normalize(text: string): string {
  if (!text) return "";
  // ̀-ͯ = Combining Diacritical Marks block (Hermes/V8/JSC compatible)
  return text.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
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

// Pior qualidade vence quando há múltiplos pontos para a mesma praia
const QUALITY_RANK: Record<"boa" | "regular" | "impropia", number> = {
  impropia: 0,
  regular: 1,
  boa: 2,
};

function findBeachId(municipio: string, praia: string): string | undefined {
  const nm = normalize(municipio);
  const np = normalize(praia);

  // 1. Chave qualificada por município ("MUNICIPIO:PRAIA")
  const qualified = CETESB_NAME_MAP[`${nm}:${np}`];
  if (qualified) return qualified;

  // 2. Casamento exato pelo nome da praia
  const exact = CETESB_NAME_MAP[np];
  if (exact) return exact;

  // 3. Casamento por prefixo — trata sufixos como "- R. M. CARLOTA", "- NORTE", etc.
  //    Não testa chaves qualificadas por município nessa etapa.
  for (const [key, beachId] of Object.entries(CETESB_NAME_MAP)) {
    if (key.includes(":")) continue;
    if (np.startsWith(key + " ") || np.startsWith(key + "-")) return beachId;
  }

  return undefined;
}

/**
 * Busca a classificação atual de balneabilidade para todas as praias
 * do Litoral Norte. O resultado é cacheado pelo TanStack Query (staleTime 24h).
 * Quando há múltiplos pontos de coleta por praia, prevalece o pior resultado.
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
    res = await fetch(`${CETESB_URL}?${params.toString()}`, {
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("CETESB: timeout — servidor demorou mais de 10s");
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

  // Acumula pior qualidade por praia quando há múltiplos pontos de coleta
  const beachMap = new Map<string, WaterQualityResult>();

  for (const feature of json.features) {
    const { praia, municipio, classificacao_texto, data_amostra_final } =
      feature.attributes;
    const beachId = findBeachId(municipio, praia);
    if (!beachId) continue;

    const quality = mapQuality(classificacao_texto);
    const existing = beachMap.get(beachId);

    if (!existing || QUALITY_RANK[quality] < QUALITY_RANK[existing.quality]) {
      beachMap.set(beachId, {
        beachId,
        quality,
        collectedAt: new Date(data_amostra_final).toISOString(),
      });
    }
  }

  return Array.from(beachMap.values());
}
