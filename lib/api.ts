import {
  getMockWeather,
  getMockTraffic,
  getMockBeaches,
  getMockUPAs,
  getMockReports,
} from "@/data/mock";
import type { Report, ReportType } from "./types";

const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchWeather() {
  await delay(400 + Math.random() * 300);
  return getMockWeather();
}

export async function fetchTraffic() {
  await delay(300 + Math.random() * 400);
  return getMockTraffic();
}

export async function fetchBeaches() {
  await delay(500 + Math.random() * 300);
  return getMockBeaches();
}

export async function fetchUPAs() {
  await delay(350 + Math.random() * 350);
  return getMockUPAs();
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
