import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Star, useReducedMotion } from "./Star";

function Line({ words, direction, progress }) {
  const reduced = useReducedMotion();
  const x = useTransform(progress, [0, 1], direction === "left" ? ["0%", "-30%"] : ["-30%", "0%"]);

  // repeat enough words so a single word crosses center multiple times
  const reps = [];
  for (let i = 0; i < 6; i += 1) reps.push(...words);

  return (
    <motion.div
      className="flex items-center whitespace-nowrap"
      style={{ x: reduced ? 0 : x, fontSize: "clamp(64px, 13vw, 180px)", lineHeight: 1.05 }}
    >
      {reps.map((w, i) => {
        // word roughly centered when its index in the moving strip passes middle
        const centerWord = Math.floor(reps.length / 2) + (direction === "left" ? -1 : 1);
        const filled = i === centerWord;
        return (
          <span key={i} className="flex items-center">
            <span
              className="font-display uppercase"
              style={{
                color: filled ? "var(--ink)" : "transparent",
                WebkitTextStroke: "1px #111",
                transition: "color 600ms cubic-bezier(.16,1,.3,1)",
              }}
            >
              {w}
            </span>
            <Star size={42} style={{ margin: "0 28px", color: "var(--ink)" }} />
          </span>
        );
      })}
    </motion.div>
  );
}

export function Movement() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  return (
    <section
      ref={ref}
      className="overflow-hidden flex flex-col justify-center"
      style={{ background: "var(--paper)", minHeight: "60vh" }}
      data-testid="movement-section"
    >
      <Line words={["GROWTH", "EVOLUTION", "INDIVIDUALITY", "AMBITION"]} direction="left" progress={scrollYProgress} />
      <Line words={["BECOMING", "BECOMING", "BECOMING"]} direction="right" progress={scrollYProgress} />
    </section>
  );
}
