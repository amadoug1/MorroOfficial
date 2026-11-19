import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring, useVelocity, useMotionValueEvent } from "framer-motion";
import { BecomingHeadline, DrawRule, useReducedMotion } from "./Star";

const LOOKS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => `/brand/lookbook-${String(n).padStart(2, "0")}.jpg`);

function useDesktop() {
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setDesktop(mq.matches);
    const fn = (e) => setDesktop(e.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  return desktop;
}

export function LookbookStrip() {
  const reduced = useReducedMotion();
  const desktop = useDesktop();
  const wrapRef = useRef(null);
  const rowRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ["start start", "end end"] });
  const xRaw = useTransform(scrollYProgress, [0, 1], ["0%", "-78%"]);
  const x = useSpring(xRaw, { stiffness: 90, damping: 25 });
  const vel = useVelocity(scrollYProgress);
  const skew = useTransform(vel, [-2, 0, 2], [-3, 0, 3]);
  const progressW = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const [current, setCurrent] = useState(1);
  useMotionValueEvent(scrollYProgress, "change", (v) => setCurrent(Math.min(10, Math.max(1, Math.round(v * 9) + 1))));

  const [mobCurrent, setMobCurrent] = useState(1);
  const onMobScroll = (e) => {
    const w = e.target.firstChild?.getBoundingClientRect().width || 1;
    setMobCurrent(Math.min(10, Math.max(1, Math.round(e.target.scrollLeft / (w + 12)) + 1)));
  };

  const counter = desktop && !reduced ? current : mobCurrent;

  return (
    <section data-testid="lookbook-strip-section">
      {desktop && !reduced ? (
        <div ref={wrapRef} style={{ height: "420vh", position: "relative" }}>
          <div className="sticky top-0 flex flex-col justify-center" style={{ height: "100vh", overflow: "hidden" }}>
            <div className="flex items-baseline justify-between px-[40px] mb-[15px]">
              <h2><BecomingHeadline nowrap style={{ fontSize: 32 }}>LOOKBOOK</BecomingHeadline></h2>
              <span className="t-mono-sm" data-testid="look-counter">{String(counter).padStart(2, "0")} / 10</span>
            </div>
            <div className="px-[40px] mb-[25px]">
              <div style={{ height: 1, background: "var(--hairline)", position: "relative" }}>
                <motion.div style={{ position: "absolute", left: 0, top: 0, height: 1, background: "var(--ink)", width: progressW }} />
              </div>
            </div>
            <motion.div ref={rowRef} className="flex px-[40px]" style={{ x, gap: 15 }} data-cursor="DRAG ← →">
              {LOOKS.map((src, i) => {
                const active = current === i + 1;
                return (
                  <Link key={i} to="/lookbook" data-testid={`strip-look-${i + 1}`} className="shrink-0" style={{ width: "32vw" }}>
                    <motion.div
                      style={{ aspectRatio: "4/5", background: "var(--flatlay)", overflow: "hidden" }}
                      animate={{ scale: active ? 1 : 0.94, opacity: active ? 1 : 0.7 }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <motion.img src={src} alt={`Look ${i + 1}`} className="w-full h-full object-cover" style={{ skewX: skew }} loading="lazy" />
                    </motion.div>
                    <p className="t-mono-xs mt-[10px]" style={{ color: "var(--muted)" }}>LOOK {String(i + 1).padStart(2, "0")}</p>
                  </Link>
                );
              })}
            </motion.div>
          </div>
        </div>
      ) : (
        <div className="py-[60px]">
          <div className="flex items-baseline justify-between px-[20px] mb-[15px]">
            <h2><BecomingHeadline nowrap style={{ fontSize: 32 }}>LOOKBOOK</BecomingHeadline></h2>
            <span className="t-mono-sm" data-testid="look-counter">{String(counter).padStart(2, "0")} / 10</span>
          </div>
          <div className="px-[20px] mb-[25px]"><DrawRule /></div>
          <div
            className="scroll-row px-[20px]"
            style={{ scrollSnapType: "x mandatory" }}
            onScroll={onMobScroll}
            data-lenis-prevent
            data-cursor="DRAG ← →"
          >
            {LOOKS.map((src, i) => (
              <Link key={i} to="/lookbook" data-testid={`strip-look-${i + 1}`} className="shrink-0" style={{ width: 280, scrollSnapAlign: "center" }}>
                <div style={{ aspectRatio: "4/5", background: "var(--flatlay)", overflow: "hidden" }}>
                  <img src={src} alt={`Look ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <p className="t-mono-xs mt-[10px]" style={{ color: "var(--muted)" }}>LOOK {String(i + 1).padStart(2, "0")}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
