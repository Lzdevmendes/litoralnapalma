"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, User, Compass, RefreshCw } from "lucide-react";
import type { UserMode } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

interface HeaderProps {
  mode: UserMode;
  onModeChange: (mode: UserMode) => void;
}

export function Header({ mode, onModeChange }: HeaderProps) {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  async function handleRefresh() {
    setRefreshing(true);
    await queryClient.invalidateQueries();
    setTimeout(() => setRefreshing(false), 1000);
  }

  return (
    <header className="glass sticky top-0 z-40 px-4 py-3 rounded-b-2xl mx-2">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
        {/* Logo */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#0077b6] flex items-center justify-center flex-shrink-0">
            <Compass size={18} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-[#0077b6] font-semibold leading-tight truncate">
              Caraguá na Palma
            </p>
            <div className="flex items-center gap-1">
              <MapPin size={10} className="text-gray-400 flex-shrink-0" />
              <span className="text-[10px] text-gray-400 truncate">
                Caraguatatuba, SP
              </span>
            </div>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="flex items-center gap-1 glass-dark rounded-xl p-0.5 flex-shrink-0">
          {(["morador", "turista"] as UserMode[]).map((m) => (
            <button
              key={m}
              onClick={() => onModeChange(m)}
              className={cn(
                "relative px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-200",
                mode === m ? "text-white" : "text-gray-500"
              )}
            >
              {mode === m && (
                <motion.span
                  layoutId="mode-pill"
                  className="absolute inset-0 bg-[#0077b6] rounded-lg"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative flex items-center gap-1">
                <User size={11} />
                {m === "morador" ? "Morador" : "Turista"}
              </span>
            </button>
          ))}
        </div>

        {/* Refresh */}
        <button
          onClick={handleRefresh}
          className="w-8 h-8 rounded-xl glass flex items-center justify-center text-[#0077b6] active:scale-90 transition-transform flex-shrink-0"
          aria-label="Atualizar dados"
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={refreshing ? "spin" : "still"}
              animate={refreshing ? { rotate: 360 } : { rotate: 0 }}
              transition={
                refreshing
                  ? { duration: 1, repeat: Infinity, ease: "linear" }
                  : {}
              }
            >
              <RefreshCw size={14} />
            </motion.span>
          </AnimatePresence>
        </button>
      </div>
    </header>
  );
}
