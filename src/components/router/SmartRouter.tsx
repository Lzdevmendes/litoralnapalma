"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Lightbulb,
  Navigation,
  Mountain,
  Waves,
  TreePine,
  Landmark,
  Clock,
  MapPin,
  ChevronRight,
} from "lucide-react";
import { useTraffic } from "@/hooks/useTraffic";
import { useBeaches } from "@/hooks/useBeaches";
import { SIDE_ROUTES } from "@/data/mock";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import type { SideRoute } from "@/lib/types";

const typeConfig: Record<
  SideRoute["type"],
  { icon: React.ElementType; color: string; label: string }
> = {
  praia: { icon: Waves, color: "#0077b6", label: "Praia" },
  trilha: { icon: Mountain, color: "#059669", label: "Trilha" },
  cachoeira: { icon: TreePine, color: "#0891b2", label: "Cachoeira" },
  cultural: { icon: Landmark, color: "#7c3aed", label: "Cultural" },
};

function isCenterCongested(
  traffic: ReturnType<typeof useTraffic>["data"]
): boolean {
  if (!traffic) return false;
  const centro = traffic.find((r) => r.id === "centro-caraguá");
  if (!centro) return false;
  return centro.level === "lento" || centro.level === "parado";
}

function getRecommendedRoutes(
  traffic: ReturnType<typeof useTraffic>["data"],
  beaches: ReturnType<typeof useBeaches>["data"]
): SideRoute[] {
  const congested = isCenterCongested(traffic);
  const busyBeaches =
    beaches
      ?.filter((b) => b.occupancy === "lotada")
      .map((b) => b.id) ?? [];

  if (!congested && busyBeaches.length === 0) return [];

  // If center is congested, suggest inland alternatives
  if (congested) {
    return SIDE_ROUTES.filter(
      (r) => r.type === "trilha" || r.type === "cachoeira"
    );
  }

  // If popular beaches are full, suggest lesser-known ones
  return SIDE_ROUTES.filter((r) => r.type === "praia");
}

export function SmartRouter() {
  const { data: traffic } = useTraffic();
  const { data: beaches } = useBeaches();

  const congested = isCenterCongested(traffic);
  const routes = getRecommendedRoutes(traffic, beaches);

  if (routes.length === 0 && !congested) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <GlassCard
          hover={false}
          className="border-l-4"
          style={{ borderLeftColor: "#0077b6" }}
        >
          <div className="flex items-start gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-[#0077b6]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Lightbulb size={18} className="text-[#0077b6]" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 flex items-center gap-1">
                <Navigation size={13} className="text-[#0077b6]" />
                Roteiro Lado B
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {congested
                  ? "Centro congestionado — explore alternativas incríveis!"
                  : "Praias lotadas — descubra locais mais tranquilos"}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {routes.map((route) => {
              const cfg = typeConfig[route.type];
              const Icon = cfg.icon;
              return (
                <motion.div
                  key={route.id}
                  className="glass rounded-xl p-3 flex items-center gap-3"
                  whileHover={{ x: 2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${cfg.color}15` }}
                  >
                    <Icon size={16} style={{ color: cfg.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {route.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {route.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                        <Clock size={9} />
                        {route.estimatedTime} min
                      </span>
                      <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                        <MapPin size={9} />
                        {route.distance} km
                      </span>
                      {route.difficulty && (
                        <Badge color={cfg.color} className="text-[9px] px-1.5 py-0.5">
                          {route.difficulty}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 flex-shrink-0 items-center">
                    <ChevronRight size={14} className="text-gray-300" />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {routes.length === 0 && congested && (
            <p className="text-xs text-gray-400 text-center py-2">
              Carregando sugestões...
            </p>
          )}
        </GlassCard>
      </motion.div>
    </AnimatePresence>
  );
}
