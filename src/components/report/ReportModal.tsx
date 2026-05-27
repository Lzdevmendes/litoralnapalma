"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, Loader2 } from "lucide-react";
import { useSubmitReport } from "@/hooks/useReports";
import type { ReportType } from "@/lib/types";

const REPORT_OPTIONS: { type: ReportType; label: string; emoji: string }[] = [
  { type: "lotacao_praia", label: "Praia lotada", emoji: "🏖️" },
  { type: "acidente", label: "Acidente", emoji: "🚨" },
  { type: "blitz", label: "Blitz / PRF", emoji: "🚔" },
  { type: "falta_agua", label: "Falta de Água", emoji: "💧" },
  { type: "falta_luz", label: "Falta de Luz", emoji: "⚡" },
  { type: "outro", label: "Outro", emoji: "📍" },
];

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
}

export function ReportModal({ open, onClose }: ReportModalProps) {
  const [selected, setSelected] = useState<ReportType | null>(null);
  const [description, setDescription] = useState("");
  const [done, setDone] = useState(false);
  const { mutate, isPending } = useSubmitReport();

  function handleSubmit() {
    if (!selected) return;
    mutate(
      {
        type: selected,
        description: description || undefined,
        lat: -23.62 + (Math.random() - 0.5) * 0.05,
        lng: -45.41 + (Math.random() - 0.5) * 0.05,
      },
      {
        onSuccess: () => {
          setDone(true);
          setTimeout(() => {
            setDone(false);
            setSelected(null);
            setDescription("");
            onClose();
          }, 1500);
        },
      }
    );
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 350, damping: 35 }}
          >
            <div className="glass rounded-t-3xl px-5 pt-4 pb-8">
              {/* Handle */}
              <div className="w-10 h-1 rounded-full bg-gray-300 mx-auto mb-4" />

              {done ? (
                <motion.div
                  className="flex flex-col items-center justify-center py-8 gap-3"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <CheckCircle size={48} className="text-green-500" />
                  <p className="text-lg font-semibold text-gray-800">
                    Reporte enviado!
                  </p>
                  <p className="text-sm text-gray-500 text-center">
                    Obrigado por ajudar a comunidade.
                  </p>
                </motion.div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900">
                      O que está acontecendo?
                    </h2>
                    <button
                      onClick={onClose}
                      className="w-8 h-8 rounded-full glass flex items-center justify-center text-gray-400"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {REPORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.type}
                        onClick={() => setSelected(opt.type)}
                        className={`rounded-2xl p-3 text-center transition-all duration-200 border-2 ${
                          selected === opt.type
                            ? "border-[#0077b6] bg-[#0077b6]/10"
                            : "border-transparent glass"
                        }`}
                      >
                        <div className="text-2xl mb-1">{opt.emoji}</div>
                        <p className="text-[10px] font-semibold text-gray-700 leading-tight">
                          {opt.label}
                        </p>
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detalhe opcional... (ex: km 178 da Rio-Santos)"
                    className="w-full glass rounded-xl px-3 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 resize-none outline-none border border-transparent focus:border-[#0077b6]/30 transition-colors"
                    rows={2}
                  />

                  <button
                    onClick={handleSubmit}
                    disabled={!selected || isPending}
                    className="mt-3 w-full py-3 rounded-2xl bg-[#0077b6] text-white font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-opacity"
                  >
                    {isPending ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      "Enviar Reporte"
                    )}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
