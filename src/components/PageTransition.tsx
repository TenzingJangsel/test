import { motion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Wraps a page in a subtle fade + slide-up transition. Used inside
 * Routes so each route swap animates instead of snapping.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}
