import {
  getMockWeather,
  getMockTraffic,
  getMockBeaches,
  getMockUPAs,
  getMockReports,
} from "@/data/mock";
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
    // Fallback para desenvolvimento sem chave configurada
    await delay(400);
    return getMockWeather();
  }

  const [weatherRes, uviRes] = await Promise.all([
    fetch(
      `${OWM_BASE}/weather?lat=${lat}&lon=${lng}&appid=${OWM_KEY}&units=metric&lang=pt_br`
    ),
    fetch(`${OWM_BASE}/uvi?lat=${lat}&lon=${lng}&appid=${OWM_KEY}`),
  ]);

  if (!weatherRes.ok) {
    throw new Error(`OpenWeatherMap error: ${weatherRes.status}`);
  }

  const weather = await weatherRes.json();
  const uvIndex = uviRes.ok ? (await uviRes.json() as { value: number }).value : 0;

  return {
    temperature: Math.round(weather.main.temp as number),
    feelsLike: Math.round(weather.main.feels_like as number),
    humidity: weather.main.humidity as number,
    condition: mapOWMCondition(weather.weather[0].id as number),
    windSpeed: Math.round((weather.wind.speed as number) * 3.6), // m/s → km/h
    uvIndex: Math.round(uvIndex),
    updatedAt: new Date().toISOString(),
  };
}

export async function fetchTraffic(cityId?: string) {
  await delay(300 + Math.random() * 400);
  return getMockTraffic(cityId);
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

export async function fetchReports() {
  await delay(200 + Math.random() * 200);
  return getMockReports();
}

export async function submitReport(data: {
  type: ReportType;
  description?: string;
  lat: number;
  lng: number;
}): Promise<Report> {
  await delay(600 + Math.random() * 400);
  return {
    id: `r${Date.now()}`,
    ...data,
    createdAt: new Date().toISOString(),
    upvotes: 0,
  };
}
