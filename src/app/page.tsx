"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import type { UserMode } from "@/lib/types";

import { Header } from "@/components/dashboard/Header";
import { QuickStats } from "@/components/dashboard/QuickStats";
import { WeatherCard } from "@/components/dashboard/WeatherCard";
import { TrafficCard } from "@/components/dashboard/TrafficCard";
import { BeachCard } from "@/components/dashboard/BeachCard";
import { UPACard } from "@/components/dashboard/UPACard";
import { ModeContent } from "@/components/dashboard/ModeContent";
import { MapView } from "@/components/map/MapView";
import { SmartRouter } from "@/components/router/SmartRouter";
import { ReportButton } from "@/components/report/ReportButton";
import { GeofenceAlert } from "@/components/geofencing/GeofenceAlert";

export default function DashboardPage() {
  const [mode, setMode] = useState<UserMode>("morador");

  return (
    <div className="min-h-screen pb-28">
      {/* Sticky header */}
      <Header mode={mode} onModeChange={setMode} />

      {/* Geofence alerts */}
      <GeofenceAlert />

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-3 pt-4 space-y-4">
        {/* Quick stats strip */}
        <section>
          <QuickStats />
        </section>

        {/* Smart router — only shows when triggered */}
        <SmartRouter />

        {/* Mode-specific content */}
        <section>
          <AnimatePresence mode="wait">
            <ModeContent key={mode} mode={mode} />
          </AnimatePresence>
        </section>

        {/* Map */}
        <section>
          <div className="flex items-center justify-between mb-2 px-1">
            <p className="text-sm font-bold text-gray-800">Mapa ao Vivo</p>
            <p className="text-[10px] text-gray-400">
              Praias · UPAs · Reportes
            </p>
          </div>
          <MapView />
        </section>

        {/* Weather */}
        <section>
          <SectionTitle>Clima</SectionTitle>
          <WeatherCard />
        </section>

        {/* Traffic */}
        <section>
          <SectionTitle>Trânsito</SectionTitle>
          <TrafficCard />
        </section>

        {/* Beaches */}
        <section>
          <SectionTitle>Praias</SectionTitle>
          <BeachCard />
        </section>

        {/* UPAs */}
        <section>
          <SectionTitle>Saúde · UPAs</SectionTitle>
          <UPACard />
        </section>

        {/* Footer */}
        <footer className="text-center pt-2 pb-4">
          <p className="text-[10px] text-gray-400">
            Caraguá na Palma · Dados atualizados em tempo real · Caraguatatuba, SP
          </p>
        </footer>
      </main>

      {/* Floating report button */}
      <ReportButton />
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm font-bold text-gray-700 mb-2 px-1">{children}</p>
  );
}
