"use client";

import { cn } from "@/lib/utils";
import { motion, type MotionProps } from "framer-motion";

interface GlassCardProps extends MotionProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({
  children,
  className,
  hover = true,
  ...motionProps
}: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        "glass rounded-2xl p-4 relative overflow-hidden",
        hover && "cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5",
        className
      )}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
}
