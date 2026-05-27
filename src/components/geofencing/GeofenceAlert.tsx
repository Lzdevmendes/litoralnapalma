"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, MapPin, AlertTriangle } from "lucide-react";
import { useBeaches } from "@/hooks/useBeaches";
import { useTraffic } from "@/hooks/useTraffic";
import { occupancyColor, trafficLevelColor } from "@/lib/utils";

interface GeoAlert {
  id: string;
  title: string;
  message: string;
  color: string;
  icon: "beach" | "traffic" | "info";
}

// Simulates geofence triggers based on data state changes
export function GeofenceAlert() {
  const [alerts, setAlerts] = useState<GeoAlert[]>([]);
  const { data: beaches } = useBeaches();
  const { data: traffic } = useTraffic();
  const prevBeachesRef = useRef<typeof beaches>(undefined);
  const prevTrafficRef = useRef<typeof traffic>(undefined);

  useEffect(() => {
    const newAlerts: GeoAlert[] = [];

    // Detect newly lotada beaches
    if (beaches && prevBeachesRef.current) {
      beaches.forEach((beach) => {
        const prev = prevBeachesRef.current?.find((b) => b.id === beach.id);
        if (prev && prev.occupancy !== "lotada" && beach.occupancy === "lotada") {
          newAlerts.push({
            id: `beach-${beach.id}-${Date.now()}`,
            title: "Praia Lotada!",
            message: `${beach.name} atingiu capacidade máxima.`,
            color: occupancyColor("lotada"),
            icon: "beach",
          });
        }
      });
    }
    prevBeachesRef.current = beaches;

    // Detect worsened traffic
    if (traffic && prevTrafficRef.current) {
      traffic.forEach((route) => {
        const prev = prevTrafficRef.current?.find((r) => r.id === route.id);
        const order = { livre: 0, moderado: 1, lento: 2, parado: 3 };
        if (
          prev &&
          order[route.level] > order[prev.level] &&
          (route.level === "lento" || route.level === "parado")
        ) {
          newAlerts.push({
            id: `traffic-${route.id}-${Date.now()}`,
            title: "Trânsito Intenso",
            message: `${route.shortName} com tráfego ${route.level}.`,
            color: trafficLevelColor(route.level),
            icon: "traffic",
          });
        }
      });
    }
    prevTrafficRef.current = traffic;

    if (newAlerts.length > 0) {
      setAlerts((prev) => [...newAlerts, ...prev].slice(0, 3));
      // Auto-dismiss after 6s
      setTimeout(() => {
        setAlerts((prev) =>
          prev.filter((a) => !newAlerts.some((na) => na.id === a.id))
        );
      }, 6000);
    }
  }, [beaches, traffic]);

  // Show a demo alert on mount
  useEffect(() => {
    const demo: GeoAlert = {
      id: "demo-welcome",
      title: "Bem-vindo ao Caraguá na Palma!",
      message: "Alertas de área em tempo real ativados.",
      color: "#0077b6",
      icon: "info",
    };
    setAlerts([demo]);
    setTimeout(() => setAlerts((prev) => prev.filter((a) => a.id !== demo.id)), 5000);
  }, []);

  function dismiss(id: string) {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div className="fixed top-20 right-3 z-50 flex flex-col gap-2 max-w-[280px]">
      <AnimatePresence>
        {alerts.map((alert) => (
          <motion.div
            key={alert.id}
            className="glass rounded-2xl px-4 py-3 shadow-lg"
            style={{ borderLeft: `3px solid ${alert.color}` }}
            initial={{ opacity: 0, x: 60, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <div className="flex items-start gap-2">
              <div
                className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ backgroundColor: `${alert.color}20` }}
              >
                {alert.icon === "beach" ? (
                  <MapPin size={13} style={{ color: alert.color }} />
                ) : alert.icon === "traffic" ? (
                  <AlertTriangle size={13} style={{ color: alert.color }} />
                ) : (
                  <Bell size={13} style={{ color: alert.color }} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-800">{alert.title}</p>
                <p className="text-[10px] text-gray-500 leading-tight mt-0.5">
                  {alert.message}
                </p>
              </div>
              <button
                onClick={() => dismiss(alert.id)}
                className="text-gray-300 hover:text-gray-500 flex-shrink-0"
              >
                <X size={12} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
