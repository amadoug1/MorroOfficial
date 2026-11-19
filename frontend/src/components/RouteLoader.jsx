import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Star, useReducedMotion, EASE } from "./Star";

/* B8: route-change loading star */
export function RouteLoader() {
  const { pathname } = useLocation();
  const [loading, setLoading] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, [pathname, reduced]);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          data-testid="route-loader"
          className="fixed inset-0 z-[90] flex items-center justify-center bg-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Star size={24} spinning spinDuration={1.2} style={{ color: "var(--ink)" }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* C9: 300ms fade between routes */
export function PageFade({ children }) {
  const { pathname } = useLocation();
  const reduced = useReducedMotion();
  if (reduced) return children;
  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
