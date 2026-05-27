"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  Stethoscope,
  ShoppingBag,
  Sunrise,
  Anchor,
  UtensilsCrossed,
  TreePine,
} from "lucide-react";
import type { UserMode } from "@/lib/types";

interface ServiceItem {
  icon: React.ElementType;
  label: string;
  sub: string;
  color: string;
}

const moradorItems: ServiceItem[] = [
  { icon: Stethoscope, label: "Farmácias de Plantão", sub: "3 abertas agora", color: "#22c55e" },
  { icon: ShoppingBag, label: "Feira Livre", sub: "Sáb • Centro • 6h–12h", color: "#f59e0b" },
  { icon: UtensilsCrossed, label: "Restaurantes Locais", sub: "Desconto morador", color: "#0077b6" },
];

const turistaItems: ServiceItem[] = [
  { icon: Sunrise, label: "Trilhas & Natureza", sub: "7 opções disponíveis", color: "#059669" },
  { icon: Anchor, label: "Passeios de Barco", sub: "Saídas às 8h e 14h", color: "#0077b6" },
  { icon: TreePine, label: "Ecoturismo", sub: "Serra do Mar • Mata Atlântica", color: "#16a34a" },
];

export function ModeContent({ mode }: { mode: UserMode }) {
  const items = mode === "morador" ? moradorItems : turistaItems;
  const title = mode === "morador" ? "Serviços do Morador" : "Para o Turista";
  const subtitle =
    mode === "morador"
      ? "Recursos essenciais da cidade"
      : "Experiências únicas em Caraguá";

  return (
    <motion.div
      key={mode}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
    >
      <GlassCard hover={false}>
        <p className="text-sm font-bold text-gray-800 mb-0.5">{title}</p>
        <p className="text-xs text-gray-400 mb-3">{subtitle}</p>
        <div className="grid grid-cols-3 gap-2">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                className="glass rounded-xl p-2.5 text-center active:scale-95 transition-transform"
              >
                <div
                  className="w-9 h-9 rounded-xl mx-auto mb-2 flex items-center justify-center"
                  style={{ backgroundColor: `${item.color}15` }}
                >
                  <Icon size={18} style={{ color: item.color }} />
                </div>
                <p className="text-[10px] font-semibold text-gray-700 leading-tight">
                  {item.label}
                </p>
                <p className="text-[9px] text-gray-400 mt-0.5 leading-tight">
                  {item.sub}
                </p>
              </button>
            );
          })}
        </div>
      </GlassCard>
    </motion.div>
  );
}
