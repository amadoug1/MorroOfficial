import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { srcSet } from "@/lib/img";

export const EASE = [0.16, 1, 0.3, 1];

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const fn = (e) => setReduced(e.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  return reduced;
}

const STAR_PATH =
  "M147.0 391.4 L142.0 391.0 L138.7 387.0 L130.9 346.0 L124.9 295.0 L124.2 248.0 L38.0 197.8 L33.7 191.0 L35.7 184.0 L46.0 176.7 L129.7 132.0 L143.5 18.0 L145.9 11.0 L150.0 7.8 L156.0 7.6 L162.0 10.9 L238.0 86.5 L333.0 55.5 L339.0 54.8 L344.9 57.0 L349.2 63.0 L348.2 72.0 L303.9 161.0 L364.4 248.0 L365.6 253.0 L364.3 257.0 L360.0 260.4 L355.0 261.2 L291.1 254.0 L286.7 249.0 L271.0 207.1 L261.2 233.0 L257.0 237.5 L253.0 238.3 L250.0 237.3 L232.0 224.6 L240.2 241.0 L239.4 247.0 L202.0 276.2 L189.6 289.0 L179.8 302.0 L170.6 318.0 L163.6 335.0 L151.2 386.0 L147.0 391.4 Z";

export function Star({ size = 16, spinning = false, spinDuration = 10, className = "", style = {} }) {
  const reduced = useReducedMotion();
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 400"
      width={size}
      height={size}
      aria-hidden
      className={className}
      data-testid="star"
      style={{
        display: "inline-block",
        flexShrink: 0,
        animation: spinning && !reduced ? `starSpin ${spinDuration}s linear infinite` : "none",
        ...style,
      }}
    >
      <path fill="currentColor" d={STAR_PATH} />
    </svg>
  );
}

export function StarPatch({ size = 140, className = "" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 400"
      width={size}
      height={size}
      aria-hidden
      className={className}
      data-testid="star-patch"
      style={{ display: "block" }}
    >
      <path fill="#1A1A1A" d={STAR_PATH} />
      <g transform="translate(200,200) scale(0.9) translate(-200,-200)">
        <path fill="none" stroke="#6B6B6B" strokeWidth={4} strokeDasharray="10 8" d={STAR_PATH} />
      </g>
    </svg>
  );
}

/* C1: "Becoming" headline — font-stretch grows 62% → 125% once in view */
export function BecomingHeadline({ as: Tag = "span", children, className = "", style = {}, delay = 0, playOnLoad = false, nowrap = false }) {
  const reduced = useReducedMotion();
  if (reduced) {
    return (
      <Tag className={`font-display ${className}`} style={style} data-testid="becoming-headline">
        {children}
      </Tag>
    );
  }
  return (
    <motion.span
      data-testid="becoming-headline"
      className={`font-display ${className}`}
      style={{ display: Tag === "span" ? "inline-block" : "block", whiteSpace: nowrap ? "nowrap" : undefined, ...style }}
      initial={{ fontStretch: "62%", fontWeight: 300, letterSpacing: "0.02em", opacity: 0 }}
      whileInView={{ fontStretch: "125%", fontWeight: 800, letterSpacing: "-0.015em", opacity: 1 }}
      viewport={playOnLoad ? undefined : { once: true, amount: 0.3 }}
      {...(playOnLoad ? { animate: { fontStretch: "125%", fontWeight: 800, letterSpacing: "-0.015em", opacity: 1 }, initial: { fontStretch: "62%", fontWeight: 300, letterSpacing: "0.02em", opacity: 0 } } : {})}
      transition={{ duration: 1.6, delay, ease: EASE }}
    >
      {children}
    </motion.span>
  );
}

/* C3: photo comes into focus on scroll-in */
export function FocusImage({ src, alt = "", className = "", style = {}, imgStyle = {}, eager = false, playOnLoad = false }) {
  const reduced = useReducedMotion();
  const from = reduced ? {} : { filter: "grayscale(1) blur(10px)", scale: 1.06, opacity: 0.4 };
  const to = { filter: "grayscale(0) blur(0px)", scale: 1, opacity: 1 };
  return (
    <motion.div
      className={className}
      style={{ overflow: "hidden", ...style }}
      initial={from}
      whileInView={playOnLoad ? undefined : to}
      animate={playOnLoad ? to : undefined}
      viewport={playOnLoad ? undefined : { once: true, amount: 0.2 }}
      transition={{ duration: 1.4, ease: EASE }}
    >
      <img src={src} srcSet={srcSet(src)} sizes="(min-width: 768px) 50vw, 100vw" alt={alt} loading={eager ? "eager" : "lazy"} className="w-full h-full object-cover" style={imgStyle} />
    </motion.div>
  );
}

/* C9: section rule draws left to right */
export function DrawRule({ style = {} }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      aria-hidden
      style={{ height: 1, background: "var(--ink)", transformOrigin: "left", ...style }}
      initial={reduced ? {} : { scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 1, ease: EASE }}
    />
  );
}
