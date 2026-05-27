"use client";

import { Sun, Cloud, CloudRain, Wind, Droplets, Zap } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { useWeather } from "@/hooks/useWeather";
import type { WeatherData } from "@/lib/types";

const conditionConfig: Record<
  WeatherData["condition"],
  { icon: React.ElementType; label: string; color: string }
> = {
  ensolarado: { icon: Sun, label: "Ensolarado", color: "#f59e0b" },
  parcial: { icon: Cloud, label: "Parcialmente Nublado", color: "#94a3b8" },
  nublado: { icon: Cloud, label: "Nublado", color: "#64748b" },
  chuva: { icon: CloudRain, label: "Chuva", color: "#3b82f6" },
  trovoada: { icon: Zap, label: "Trovoada", color: "#8b5cf6" },
};

function uvLabel(uv: number): { label: string; color: string } {
  if (uv <= 2) return { label: "Baixo", color: "#22c55e" };
  if (uv <= 5) return { label: "Moderado", color: "#f59e0b" };
  if (uv <= 7) return { label: "Alto", color: "#f97316" };
  if (uv <= 10) return { label: "Muito Alto", color: "#ef4444" };
  return { label: "Extremo", color: "#7c3aed" };
}

export function WeatherCard() {
  const { data, isLoading } = useWeather();

  if (isLoading || !data) return <CardSkeleton />;

  const config = conditionConfig[data.condition];
  const Icon = config.icon;
  const uv = uvLabel(data.uvIndex);

  return (
    <GlassCard className="bg-gradient-to-br from-amber-50/60 to-sky-50/40">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
            Clima Agora
          </p>
          <p className="text-4xl font-bold text-gray-900 mt-1 leading-none">
            {data.temperature}°
          </p>
          <p className="text-sm text-gray-500 mt-0.5">
            Sensação {data.feelsLike}°
          </p>
        </div>
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: `${config.color}20` }}
        >
          <Icon size={28} style={{ color: config.color }} />
        </div>
      </div>

      <p className="text-sm font-medium text-gray-700 mb-3">{config.label}</p>

      <div className="grid grid-cols-3 gap-2">
        <Stat
          icon={<Droplets size={13} className="text-blue-400" />}
          label="Umidade"
          value={`${data.humidity}%`}
        />
        <Stat
          icon={<Wind size={13} className="text-gray-400" />}
          label="Vento"
          value={`${data.windSpeed} km/h`}
        />
        <Stat
          icon={
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: uv.color }}
            />
          }
          label="UV"
          value={uv.label}
          valueStyle={{ color: uv.color }}
        />
      </div>
    </GlassCard>
  );
}

function Stat({
  icon,
  label,
  value,
  valueStyle,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueStyle?: React.CSSProperties;
}) {
  return (
    <div className="glass rounded-xl p-2 text-center">
      <div className="flex items-center justify-center mb-1">{icon}</div>
      <p className="text-[10px] text-gray-400 leading-tight">{label}</p>
      <p
        className="text-xs font-bold text-gray-700 leading-tight"
        style={valueStyle}
      >
        {value}
      </p>
    </div>
  );
}
