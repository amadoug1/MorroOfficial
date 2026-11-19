import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform, useMotionValueEvent, useInView } from "framer-motion";
import { Star, useReducedMotion, EASE } from "./Star";

const NOISE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E";

/* 1a: film grain overlay */
export function FilmGrain() {
  return <div aria-hidden className="film-grain" style={{ backgroundImage: `url("${NOISE}")` }} />;
}

/* 1c: scroll progress star */
export function ScrollStar() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const rotateRaw = useTransform(scrollYProgress, [0, 1], [0, 720]);
  const rotate = useSpring(rotateRaw, { stiffness: 60, damping: 20 });
  const [pct, setPct] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => setPct(Math.round(v * 100)));

  const toTop = () => {
    if (window.__lenis) window.__lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <motion.button
      data-testid="scroll-star"
      aria-label="Scroll to top"
      onClick={toTop}
      className="fixed flex flex-col items-center"
      style={{
        right: 24,
        bottom: 24,
        zIndex: 38,
        mixBlendMode: "difference",
        color: "#FFFFFF",
        background: "none",
        border: "none",
      }}
      animate={{ opacity: pct > 10 ? 1 : 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.span style={{ rotate: reduced ? 0 : rotate, display: "inline-flex" }}>
        <span className="hidden md:inline-flex"><Star size={28} /></span>
        <span className="md:hidden inline-flex"><Star size={22} /></span>
      </motion.span>
      <span className="t-mono-xs mt-[5px] hidden md:block" style={{ color: "#FFFFFF" }}>{pct}%</span>
    </motion.button>
  );
}

/* 1e: magnetic buttons — global effect for all button classes */
export function MagneticButtons() {
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    let current = null;
    const reset = (el) => {
      el.style.transition = "transform 300ms cubic-bezier(.16,1,.3,1)";
      el.style.transform = "";
    };
    const onMove = (e) => {
      const el = e.target.closest?.(".btn-primary,.btn-secondary,.btn-outline-white");
      if (current && current !== el) {
        reset(current);
        current = null;
      }
      if (!el) return;
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const dist = Math.hypot(dx, dy) || 1;
      const range = 80 + Math.max(r.width, r.height) / 2;
      if (dist < range) {
        el.style.transition = "transform 150ms cubic-bezier(.16,1,.3,1)";
        el.style.transform = `translate(${(dx / dist) * 6}px, ${(dy / dist) * 6}px)`;
        current = el;
      } else if (current === el) {
        reset(el);
        current = null;
      }
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);
  return null;
}

/* 1d: text scramble on hover (attach to parent) */
const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export function Scramble({ text, className = "", style = {} }) {
  const [display, setDisplay] = useState(text);
  const ref = useRef(null);
  const timer = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    const trigger = el.closest("a,button,[role='button'],.teaser-tile") || el.parentElement;
    const run = () => {
      let frame = 0;
      const total = 12;
      clearInterval(timer.current);
      timer.current = setInterval(() => {
        frame += 1;
        setDisplay(
          text
            .split("")
            .map((c, i) => {
              if (c === " " || c === "·") return c;
              const resolveAt = (i / text.length) * total;
              return frame >= resolveAt ? c : SCRAMBLE_CHARS[(Math.random() * 36) | 0];
            })
            .join("")
        );
        if (frame >= total) {
          clearInterval(timer.current);
          setDisplay(text);
        }
      }, 30);
    };
    trigger?.addEventListener("mouseenter", run);
    return () => {
      trigger?.removeEventListener("mouseenter", run);
      clearInterval(timer.current);
    };
  }, [text, reduced]);

  return (
    <span ref={ref} className={className} style={style}>
      {display}
    </span>
  );
}

/* 4d: fly-to-bag animation (listens for 'morro:fly' events) */
export function FlyToBag() {
  const [fly, setFly] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      const bag = document.querySelector('[data-testid="nav-bag-button"]');
      if (!bag) return;
      const b = bag.getBoundingClientRect();
      setFly({ from: e.detail.rect, to: { x: b.left + b.width / 2, y: b.top + b.height / 2 }, img: e.detail.img, id: Date.now() });
      setTimeout(() => setFly(null), 800);
    };
    window.addEventListener("morro:fly", handler);
    return () => window.removeEventListener("morro:fly", handler);
  }, []);

  if (!fly) return null;
  const { from, to } = fly;
  const dx = to.x - (from.left + from.width / 2);
  const dy = to.y - (from.top + from.height / 2);

  return (
    <motion.img
      key={fly.id}
      src={fly.img}
      alt=""
      aria-hidden
      data-testid="fly-to-bag"
      className="fixed pointer-events-none object-cover"
      style={{ left: from.left, top: from.top, width: from.width, height: from.height, zIndex: 98 }}
      initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
      animate={{
        x: [0, dx * 0.5 - 40, dx],
        y: [0, dy * 0.5 - 80, dy],
        scale: [1, 0.5, 0.15],
        opacity: [1, 1, 0.9],
      }}
      transition={{ duration: 0.7, ease: EASE, times: [0, 0.5, 1] }}
    />
  );
}

/* caption typing effect (types once when in view) */
export function TypeText({ text, className = "", style = {} }) {
  const reduced = useReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView || reduced) {
      if (inView) setN(text.length);
      return;
    }
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setN(i);
      if (i >= text.length) clearInterval(id);
    }, 24);
    return () => clearInterval(id);
  }, [inView, text, reduced]);

  return (
    <span ref={ref} className={className} style={style}>
      {reduced ? text : text.slice(0, n)}
    </span>
  );
}

/* 8d: live local clock */
export function LiveClock({ className = "", style = {} }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const pad = (v) => String(v).padStart(2, "0");
  return (
    <span className={className} style={style} data-testid="live-clock">
      LOCAL TIME {pad(now.getHours())}:{pad(now.getMinutes())}:{pad(now.getSeconds())}
    </span>
  );
}
