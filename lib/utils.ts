import type { TrafficLevel, BeachOccupancy } from "./types";

export function trafficLevelColor(level: TrafficLevel): string {
  const map: Record<TrafficLevel, string> = {
    livre: "#22c55e",
    moderado: "#f59e0b",
    lento: "#f97316",
    parado: "#ef4444",
  };
  return map[level];
}

export function trafficLevelLabel(level: TrafficLevel): string {
  const map: Record<TrafficLevel, string> = {
    livre: "Livre",
    moderado: "Moderado",
    lento: "Lento",
    parado: "Parado",
  };
  return map[level];
}

export function occupancyColor(occupancy: BeachOccupancy): string {
  const map: Record<BeachOccupancy, string> = {
    vazia: "#22c55e",
    moderada: "#f59e0b",
    lotada: "#ef4444",
  };
  return map[occupancy];
}

export function occupancyLabel(occupancy: BeachOccupancy): string {
  const map: Record<BeachOccupancy, string> = {
    vazia: "Vazia",
    moderada: "Moderada",
    lotada: "Lotada",
  };
  return map[occupancy];
}

export function formatWaitTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `há ${mins} min`;
  return `há ${Math.floor(mins / 60)}h`;
}
