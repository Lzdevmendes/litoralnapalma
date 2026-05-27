"use client";

import { Car, Clock, TrendingUp } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { useTraffic } from "@/hooks/useTraffic";
import {
  trafficLevelColor,
  trafficLevelLabel,
  timeAgo,
} from "@/lib/utils";

export function TrafficCard() {
  const { data: routes, isLoading } = useTraffic();

  if (isLoading || !routes) return <CardSkeleton />;

  const worst = routes.reduce((a, b) => {
    const order = { livre: 0, moderado: 1, lento: 2, parado: 3 };
    return order[b.level] > order[a.level] ? b : a;
  });

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#0077b6]/10 flex items-center justify-center">
            <Car size={16} className="text-[#0077b6]" />
          </div>
          <p className="text-sm font-semibold text-gray-800">Trânsito</p>
        </div>
        <Badge color={trafficLevelColor(worst.level)} dot>
          {trafficLevelLabel(worst.level)} no geral
        </Badge>
      </div>

      <div className="space-y-2.5">
        {routes.map((route) => {
          const color = trafficLevelColor(route.level);
          return (
            <div key={route.id} className="glass rounded-xl p-3">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {route.shortName}
                </p>
                <Badge color={color}>{trafficLevelLabel(route.level)}</Badge>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock size={11} />
                  {route.travelTime} min
                </span>
                <span className="flex items-center gap-1">
                  <TrendingUp size={11} />
                  {route.distance} km
                </span>
                <span className="ml-auto">{timeAgo(route.updatedAt)}</span>
              </div>
              {/* Level bar */}
              <div className="mt-2 h-1 rounded-full bg-black/5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${({ livre: 15, moderado: 45, lento: 70, parado: 100 }[route.level])}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
