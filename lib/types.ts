export type TrafficLevel = "livre" | "moderado" | "lento" | "parado";
export type BeachOccupancy = "vazia" | "moderada" | "lotada";
export type ReportType =
  | "lotacao_praia"
  | "acidente"
  | "blitz"
  | "falta_agua"
  | "falta_luz"
  | "outro";
export type UserMode = "morador" | "turista";

export interface TrafficRoute {
  id: string;
  name: string;
  shortName: string;
  level: TrafficLevel;
  travelTime: number; // minutes
  distance: number; // km
  updatedAt: string;
}

export interface Beach {
  id: string;
  name: string;
  occupancy: BeachOccupancy;
  occupancyPercent: number;
  waterQuality: "boa" | "regular" | "impropia";
  wavesHeight: number; // meters
  lat: number;
  lng: number;
  updatedAt: string;
}

export interface UPA {
  id: string;
  name: string;
  region: "centro" | "sul" | "norte";
  waitTime: number; // minutes
  patientsWaiting: number;
  status: "normal" | "alerta" | "critico";
  address: string;
  lat: number;
  lng: number;
}

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  condition: "ensolarado" | "nublado" | "chuva" | "trovoada" | "parcial";
  windSpeed: number;
  uvIndex: number;
  updatedAt: string;
}

export interface SideRoute {
  id: string;
  name: string;
  description: string;
  type: "praia" | "trilha" | "cachoeira" | "cultural";
  distance: number; // km from center
  estimatedTime: number; // minutes
  difficulty?: "fácil" | "moderado" | "difícil";
  tags: string[];
  lat: number;
  lng: number;
}

export interface Report {
  id: string;
  type: ReportType;
  description?: string;
  lat: number;
  lng: number;
  createdAt: string;
  upvotes: number;
}

export interface DashboardData {
  weather: WeatherData;
  traffic: TrafficRoute[];
  beaches: Beach[];
  upas: UPA[];
  reports: Report[];
}
