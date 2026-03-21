"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";

export function HoverCardMotion({ children }: { children: ReactNode }) {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="h-full"
    >
      {children}
    </motion.div>
  );
}
