"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { ReportModal } from "./ReportModal";

export function ReportButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-5 z-40 w-14 h-14 rounded-full bg-[#0077b6] text-white shadow-lg shadow-[#0077b6]/40 flex items-center justify-center"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        aria-label="Reportar ocorrência"
      >
        <AlertTriangle size={22} />
        {/* Ripple */}
        <AnimatePresence>
          <motion.span
            key="ripple"
            className="absolute inset-0 rounded-full border-2 border-[#0077b6]"
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 1.8, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
          />
        </AnimatePresence>
      </motion.button>

      <ReportModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
