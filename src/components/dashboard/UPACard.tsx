"use client";

import { Cross, Clock, Users, MapPin } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { useUPA } from "@/hooks/useUPA";
import { formatWaitTime } from "@/lib/utils";
import type { UPA } from "@/lib/types";

const statusConfig: Record<
  UPA["status"],
  { color: string; label: string }
> = {
  normal: { color: "#22c55e", label: "Normal" },
  alerta: { color: "#f59e0b", label: "Alerta" },
  critico: { color: "#ef4444", label: "Crítico" },
};

export function UPACard() {
  const { data: upas, isLoading } = useUPA();

  if (isLoading || !upas) return <CardSkeleton />;

  const sorted = [...upas].sort((a, b) => a.waitTime - b.waitTime);
  const best = sorted[0];

  return (
    <GlassCard className="bg-gradient-to-br from-rose-50/40 to-white/40">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center">
            <Cross size={14} className="text-rose-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">UPAs</p>
            <p className="text-[10px] text-gray-400">
              Menor espera:{" "}
              <span className="text-green-600 font-semibold">
                {best.name} ({formatWaitTime(best.waitTime)})
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {sorted.map((upa) => {
          const cfg = statusConfig[upa.status];
          return (
            <div key={upa.id} className="glass rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold text-gray-800">
                  {upa.name}
                </p>
                <Badge color={cfg.color} dot>
                  {cfg.label}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock size={11} />
                  <span className="font-semibold" style={{ color: cfg.color }}>
                    {formatWaitTime(upa.waitTime)}
                  </span>
                  &nbsp;de espera
                </span>
                <span className="flex items-center gap-1">
                  <Users size={11} />
                  {upa.patientsWaiting} aguardando
                </span>
              </div>
              <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1 truncate">
                <MapPin size={9} />
                {upa.address}
              </p>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
