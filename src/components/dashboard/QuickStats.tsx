"use client";

import { Waves, Car, Cross, Thermometer } from "lucide-react";
import { useWeather } from "@/hooks/useWeather";
import { useTraffic } from "@/hooks/useTraffic";
import { useBeaches } from "@/hooks/useBeaches";
import { useUPA } from "@/hooks/useUPA";
import { trafficLevelColor, trafficLevelLabel, occupancyColor, formatWaitTime } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";

interface StatChipProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}

function StatChip({ icon, label, value, color }: StatChipProps) {
  return (
    <div className="glass rounded-2xl px-3 py-2.5 flex items-center gap-2 min-w-0">
      <div
        className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${color}20` }}
      >
        <span style={{ color }}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-gray-400 leading-tight">{label}</p>
        <p className="text-xs font-bold text-gray-800 truncate">{value}</p>
      </div>
    </div>
  );
}

export function QuickStats() {
  const { data: weather, isLoading: wLoading } = useWeather();
  const { data: traffic, isLoading: tLoading } = useTraffic();
  const { data: beaches, isLoading: bLoading } = useBeaches();
  const { data: upas, isLoading: uLoading } = useUPA();

  if (wLoading || tLoading || bLoading || uLoading) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-14" />
        ))}
      </div>
    );
  }

  const worstTraffic = traffic?.reduce((a, b) => {
    const order = { livre: 0, moderado: 1, lento: 2, parado: 3 };
    return order[b.level] > order[a.level] ? b : a;
  });

  const busiestBeach = beaches?.reduce((a, b) =>
    b.occupancyPercent > a.occupancyPercent ? b : a
  );

  const bestUPA = upas?.reduce((a, b) =>
    a.waitTime < b.waitTime ? a : b
  );

  return (
    <div className="grid grid-cols-2 gap-2">
      {weather && (
        <StatChip
          icon={<Thermometer size={14} />}
          label="Temperatura"
          value={`${weather.temperature}°C`}
          color="#f59e0b"
        />
      )}
      {worstTraffic && (
        <StatChip
          icon={<Car size={14} />}
          label="Trânsito"
          value={trafficLevelLabel(worstTraffic.level)}
          color={trafficLevelColor(worstTraffic.level)}
        />
      )}
      {busiestBeach && (
        <StatChip
          icon={<Waves size={14} />}
          label="Praia mais cheia"
          value={busiestBeach.name}
          color={occupancyColor(busiestBeach.occupancy)}
        />
      )}
      {bestUPA && (
        <StatChip
          icon={<Cross size={14} />}
          label="Menor espera UPA"
          value={`${bestUPA.name} · ${formatWaitTime(bestUPA.waitTime)}`}
          color="#22c55e"
        />
      )}
    </div>
  );
}
