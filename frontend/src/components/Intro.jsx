import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, EASE, useReducedMotion } from "./Star";
import { Wordmark } from "./Logo";

export function Intro() {
  const [show, setShow] = useState(() => {
    try {
      return !sessionStorage.getItem("morro_intro_seen");
    } catch {
      return false;
    }
  });
  const reduced = useReducedMotion();
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (!show) return;
    if (reduced) {
      dismiss();
      return;
    }
    const text = "THE ART OF BECOMING";
    let i = 0;
    const start = setTimeout(() => {
      const t = setInterval(() => {
        i += 1;
        setTyped(text.slice(0, i));
        if (i >= text.length) clearInterval(t);
      }, 1200 / text.length);
    }, 600);

    const end = setTimeout(dismiss, 3400);
    const onKey = () => dismiss();
    const onClick = () => dismiss();
    window.addEventListener("keydown", onKey);
    window.addEventListener("click", onClick);
    return () => {
      clearTimeout(start);
      clearTimeout(end);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("click", onClick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, reduced]);

  function dismiss() {
    try {
      sessionStorage.setItem("morro_intro_seen", "1");
    } catch { /* private mode */ }
    setShow(false);
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          data-testid="intro-overlay"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
          style={{ background: "var(--black)", color: "var(--paper)", cursor: "pointer" }}
          initial={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <motion.div
            initial={{ rotate: -200, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            transition={{ duration: 1.1, ease: EASE }}
          >
            <Star size={48} />
          </motion.div>
          <p className="t-mono-sm mt-[30px]" style={{ color: "var(--paper)", minHeight: 20, letterSpacing: "0.16em" }}>
            {typed}
            <motion.span
              aria-hidden
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.9, repeat: Infinity }}
              style={{ display: "inline-block", width: 7, height: 13, background: "var(--paper)", marginLeft: 4, verticalAlign: "middle" }}
            />
          </p>
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.9, delay: 1.9, ease: EASE }}
            className="mt-[30px]"
          >
            <Wordmark variant="white" plain style={{ width: 220, height: "auto", display: "block" }} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
