"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
  value: number; // 0-100
  color?: string;
  height?: number;
  className?: string;
}

export function ProgressBar({
  value,
  color = "#0077b6",
  height = 6,
  className,
}: ProgressBarProps) {
  return (
    <div
      className={`w-full rounded-full overflow-hidden bg-black/5 ${className}`}
      style={{ height }}
    >
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, value)}%` }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
    </div>
  );
}
