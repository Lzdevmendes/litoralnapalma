"use client";

import { useEffect, useRef } from "react";
import { useBeaches } from "@/hooks/useBeaches";
import { useUPA } from "@/hooks/useUPA";
import { useReports } from "@/hooks/useReports";
import { occupancyColor } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";

// Caraguatatuba center
const CENTER: [number, number] = [-23.62, -45.41];
const ZOOM = 12;

export function MapView() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);

  const { data: beaches } = useBeaches();
  const { data: upas } = useUPA();
  const { data: reports } = useReports();

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    let isMounted = true;

    import("leaflet").then((L) => {
      if (!isMounted || !mapRef.current) return;

      // Prevent double init
      if (mapInstanceRef.current) return;

      // Fix default icons
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current, {
        center: CENTER,
        zoom: ZOOM,
        zoomControl: false,
        attributionControl: true,
      });

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://carto.com/">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 19,
        }
      ).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      mapInstanceRef.current = map;

      // Add beach markers
      if (beaches) {
        beaches.forEach((beach) => {
          const color = occupancyColor(beach.occupancy);
          const icon = L.divIcon({
            className: "",
            html: `<div style="
              width:32px;height:32px;border-radius:50%;
              background:${color}30;border:2.5px solid ${color};
              display:flex;align-items:center;justify-content:center;
              font-size:14px;box-shadow:0 2px 8px ${color}40
            ">🏖️</div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });

          L.marker([beach.lat, beach.lng], { icon })
            .bindPopup(
              `<strong>${beach.name}</strong><br>
               Lotação: <span style="color:${color}">${beach.occupancy}</span><br>
               ${beach.occupancyPercent}% ocupada`
            )
            .addTo(map);
        });
      }

      // Add UPA markers
      if (upas) {
        upas.forEach((upa) => {
          const statusColor = { normal: "#22c55e", alerta: "#f59e0b", critico: "#ef4444" }[upa.status];
          const icon = L.divIcon({
            className: "",
            html: `<div style="
              width:32px;height:32px;border-radius:8px;
              background:${statusColor}20;border:2.5px solid ${statusColor};
              display:flex;align-items:center;justify-content:center;
              font-size:14px;box-shadow:0 2px 8px ${statusColor}40
            ">🏥</div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });

          L.marker([upa.lat, upa.lng], { icon })
            .bindPopup(
              `<strong>${upa.name}</strong><br>
               Espera: <span style="color:${statusColor}">${upa.waitTime} min</span><br>
               ${upa.patientsWaiting} pacientes aguardando`
            )
            .addTo(map);
        });
      }

      // Add report markers
      if (reports) {
        const reportEmoji: Record<string, string> = {
          lotacao_praia: "🏖️",
          acidente: "🚨",
          blitz: "🚔",
          falta_agua: "💧",
          falta_luz: "⚡",
          outro: "📍",
        };

        reports.forEach((report) => {
          const icon = L.divIcon({
            className: "",
            html: `<div style="
              width:28px;height:28px;border-radius:50%;
              background:rgba(239,68,68,0.15);border:2px solid #ef4444;
              display:flex;align-items:center;justify-content:center;
              font-size:12px
            ">${reportEmoji[report.type] ?? "📍"}</div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          });

          L.marker([report.lat, report.lng], { icon })
            .bindPopup(
              `<strong>Reporte da comunidade</strong><br>
               ${report.description ?? report.type}<br>
               <small>👍 ${report.upvotes} confirmações</small>`
            )
            .addTo(map);
        });
      }
    });

    return () => {
      isMounted = false;
    };
  }, [beaches, upas, reports]);

  return (
    <div className="relative">
      <div
        ref={mapRef}
        className="w-full rounded-2xl overflow-hidden"
        style={{ height: 340 }}
      />
      {!mapRef.current && <Skeleton className="h-[340px]" />}

      {/* Legend */}
      <div className="absolute bottom-3 left-3 glass rounded-xl px-3 py-2 text-[10px] space-y-1 z-[500]">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
          <span className="text-gray-600">Vazia</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span className="text-gray-600">Moderada</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <span className="text-gray-600">Lotada</span>
        </div>
      </div>
    </div>
  );
}
