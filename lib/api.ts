import {
  getMockWeather,
  getMockTraffic,
  getMockBeaches,
  getMockUPAs,
  getMockReports,
} from "@/data/mock";
import { CITIES } from "@/data/cities";
import { fetchGoogleTraffic } from "@/lib/traffic";
import { isSupabaseConfigured } from "@/lib/supabase";
import { fetchReportsFromSupabase, submitReportToSupabase } from "@/lib/reports";
import type { Report, ReportType, WeatherData } from "./types";

const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const OWM_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_KEY;
const OWM_BASE = "https://api.openweathermap.org/data/2.5";

function mapOWMCondition(id: number): WeatherData["condition"] {
  if (id >= 200 && id < 300) return "trovoada";
  if (id >= 300 && id < 600) return "chuva";
  if (id >= 600 && id < 800) return "nublado";
  if (id === 800) return "ensolarado";
  if (id === 801 || id === 802) return "parcial";
  return "nublado";
}

export async function fetchWeather(lat: number, lng: number): Promise<WeatherData> {
  if (!OWM_KEY) {
    await delay(400);
    return getMockWeather();
  }

  // Usa a API /weather para condição + temperatura.
  // O índice UV vem do campo `uvi` dentro de /onecall (One Call API 3.0).
  // O endpoint legado /uvi foi removido — requer plano pago a partir de jun/2024.
  const [weatherRes, oneCallRes] = await Promise.all([
    fetch(
      `${OWM_BASE}/weather?lat=${lat}&lon=${lng}&appid=${OWM_KEY}&units=metric&lang=pt_br`
    ),
    fetch(
      `${OWM_BASE}/onecall?lat=${lat}&lon=${lng}&appid=${OWM_KEY}&exclude=minutely,hourly,daily,alerts`
    ),
  ]);

  // Fallback para mock se a chave ainda não ativou (OWM leva até 2h após cadastro)
  if (!weatherRes.ok) {
    return getMockWeather();
  }

  const weather = await weatherRes.json() as {
    main: { temp: number; feels_like: number; humidity: number };
    wind: { speed: number };
    weather: [{ id: number }];
  };

  // One Call API 3.0 requer plano pago — UV index opcional, não quebra se falhar
  const uvIndex = oneCallRes.ok
    ? ((await oneCallRes.json() as { current?: { uvi?: number } }).current?.uvi ?? 0)
    : 0;

  return {
    temperature: Math.round(weather.main.temp),
    feelsLike: Math.round(weather.main.feels_like),
    humidity: weather.main.humidity,
    condition: mapOWMCondition(weather.weather[0].id),
    windSpeed: Math.round(weather.wind.speed * 3.6), // m/s → km/h
    uvIndex: Math.round(uvIndex),
    updatedAt: new Date().toISOString(),
  };
}

export async function fetchTraffic(cityId?: string) {
  const city = CITIES.find((c) => c.id === cityId) ?? CITIES[0];

  const realData = await fetchGoogleTraffic(city.highways).catch(
    () => ({}) as Partial<Record<string, never>>
  );
  const hasRealData = Object.keys(realData).length > 0;

  if (!hasRealData) {
    await delay(300 + Math.random() * 400);
    return getMockTraffic(cityId);
  }

  return getMockTraffic(cityId).map((route) => {
    const real = realData[route.id];
    return real ? { ...route, level: real.level, travelTime: real.travelTime } : route;
  });
}

export async function fetchBeaches(cityId?: string) {
  await delay(500 + Math.random() * 300);
  return getMockBeaches(cityId);
}

export async function fetchUPAs(cityId?: string) {
  await delay(350 + Math.random() * 350);
  const upas = getMockUPAs();
  return cityId ? upas.filter((u) => u.city === cityId) : upas;
}

export async function fetchReports(cityId?: string): Promise<Report[]> {
  if (isSupabaseConfigured) {
    return fetchReportsFromSupabase(cityId);
  }
  await delay(200 + Math.random() * 200);
  const mock = getMockReports();
  return cityId ? mock.filter((r) => !r.city || r.city === cityId) : mock;
}

/**
 * Submete um report.
 * `city` é obrigatório — necessário para filtros no dashboard e RLS no Supabase.
 */
export async function submitReport(data: {
  type: ReportType;
  description?: string;
  lat: number;
  lng: number;
  city: string; // obrigatório (era opcional — corrigido)
}): Promise<Report> {
  if (isSupabaseConfigured) {
    return submitReportToSupabase(data);
  }
  await delay(600 + Math.random() * 400);
  return {
    id: `r${Date.now()}`,
    ...data,
    createdAt: new Date().toISOString(),
    upvotes: 0,
  };
}
