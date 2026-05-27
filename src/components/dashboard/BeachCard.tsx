"use client";

import { Waves, Users, Droplets } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useBeaches } from "@/hooks/useBeaches";
import { occupancyColor, occupancyLabel } from "@/lib/utils";

const waterQualityColor: Record<string, string> = {
  boa: "#22c55e",
  regular: "#f59e0b",
  impropia: "#ef4444",
};

export function BeachCard() {
  const { data: beaches, isLoading } = useBeaches();

  if (isLoading || !beaches) return <CardSkeleton />;

  const free = beaches.filter((b) => b.occupancy === "vazia").length;
  const busy = beaches.filter((b) => b.occupancy === "lotada").length;

  return (
    <GlassCard className="bg-gradient-to-br from-sky-50/60 to-teal-50/30">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-sky-100 flex items-center justify-center">
            <Waves size={16} className="text-[#0077b6]" />
          </div>
          <p className="text-sm font-semibold text-gray-800">Praias</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">
            <span className="text-green-500 font-semibold">{free}</span> livres
            ·{" "}
            <span className="text-red-500 font-semibold">{busy}</span> lotadas
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {beaches.map((beach) => {
          const color = occupancyColor(beach.occupancy);
          return (
            <div key={beach.id} className="glass rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {beach.name}
                </p>
                <Badge color={color}>{occupancyLabel(beach.occupancy)}</Badge>
              </div>
              <ProgressBar
                value={beach.occupancyPercent}
                color={color}
                height={5}
              />
              <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Users size={10} />
                  {beach.occupancyPercent}%
                </span>
                <span className="flex items-center gap-1">
                  <Waves size={10} />
                  {beach.wavesHeight.toFixed(1)}m
                </span>
                <span
                  className="flex items-center gap-1"
                  style={{ color: waterQualityColor[beach.waterQuality] }}
                >
                  <Droplets size={10} />
                  Água {beach.waterQuality}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
