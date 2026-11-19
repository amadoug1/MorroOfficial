import { useRef, useState } from "react";
import { motion, useScroll, useVelocity, useSpring, useTransform, useMotionValue, useAnimationFrame, useMotionValueEvent } from "framer-motion";
import { Star, useReducedMotion } from "./Star";

const ITEMS = [
  { text: "THE ART OF BECOMING", display: true },
  { text: "DROP 01 OUT NOW", display: false },
  { text: "THE ART OF BECOMING", display: true },
  { text: "YOUR PAST DOESN'T DEFINE YOUR FUTURE", display: false },
];

function TickerContent() {
  return (
    <>
      {ITEMS.map((item, i) => (
        <span key={i} className="flex items-center shrink-0" style={{ color: "#FFFFFF" }}>
          <span
            className={item.display ? "font-display" : "t-mono-md"}
            style={{
              fontSize: item.display ? 20 : 13,
              letterSpacing: item.display ? "-0.01em" : "0.12em",
              padding: "0 30px",
              whiteSpace: "nowrap",
            }}
          >
            {item.text}
          </span>
          <Star size={22} spinning spinDuration={6} />
        </span>
      ))}
    </>
  );
}

export function SloganTicker() {
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const paused = useRef(false);
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smoothVel = useSpring(velocity, { stiffness: 60, damping: 20 });
  const [vel, setVel] = useState(0);
  useMotionValueEvent(smoothVel, "change", (v) => setVel(v));
  const skew = useTransform(smoothVel, [-2000, 0, 2000], [6, 0, -6]);

  useAnimationFrame((_, delta) => {
    if (paused.current || reduced) return;
    const basePct = (100 / 26000) * delta; // one loop per 26s
    const speedFactor = Math.min(3, 1 + Math.abs(smoothVel.get()) / 800);
    const dir = smoothVel.get() < -50 ? -1 : 1;
    let next = x.get() - basePct * speedFactor * dir;
    if (next <= -50) next += 50;
    if (next > 0) next -= 50;
    x.set(next);
  });

  const xPct = useTransform(x, (v) => `${v}%`);

  return (
    <div
      data-testid="slogan-ticker"
      aria-label="The art of becoming"
      className="overflow-hidden flex items-center"
      style={{ background: "var(--black)", height: 56 }}
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
    >
      <motion.div
        aria-hidden
        className="flex items-center w-max"
        style={{ x: xPct, skewX: reduced ? 0 : skew }}
      >
        <div className="flex items-center">
          <TickerContent />
        </div>
        <div className="flex items-center" aria-hidden>
          <TickerContent />
        </div>
      </motion.div>
    </div>
  );
}
