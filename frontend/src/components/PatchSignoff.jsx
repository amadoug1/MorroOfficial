import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { EASE, useReducedMotion } from "./Star";

// Outline of /brand/morro-patch.webp, traced from its alpha channel (viewBox 0 0 901 1044).
const OUTLINE =
  "M320 2 L344 8 L554 218 L818 130 L838 134 L848 140 L854 152 L850 178 L730 416 L730 422 L892 650 L898 664 L896 676 L886 686 L868 688 L866 686 L838 686 L836 682 L716 674 L694 668 L682 646 L676 622 L644 542 L638 548 L616 610 L602 626 L584 622 L538 586 L536 590 L556 628 L560 644 L554 656 L518 680 L472 712 L418 766 L382 818 L346 898 L316 1030 L310 1040 L298 1042 L290 1036 L284 1022 L266 926 L266 910 L262 908 L262 892 L260 890 L254 818 L250 814 L250 766 L248 764 L248 676 L250 674 L248 652 L14 518 L4 508 L2 500 L2 490 L8 478 L20 470 L262 340 L272 250 L274 248 L274 224 L280 196 L280 172 L284 170 L284 148 L286 146 L286 124 L292 98 L292 74 L298 50 L298 28 L304 14 Z";

const THREAD = 1.6; // seconds for the thread to run once around the patch

/* Closing mark above the footer: a thread stitches around the patch, then the patch presses in. */
export function PatchSignoff() {
  const reduced = useReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const play = inView && !reduced;

  return (
    <section
      aria-label="MORRO"
      data-testid="patch-signoff"
      className="flex flex-col items-center pt-[70px] pb-[60px] md:pt-[90px] md:pb-[70px]"
    >
      <div ref={ref} className="relative w-[60px] md:w-[72px]" style={{ aspectRatio: "901 / 1044" }}>
        <motion.img
          src="/brand/morro-patch-360.webp"
          alt="MORRO patch"
          width={901}
          height={1044}
          loading="lazy"
          draggable={false}
          className="absolute inset-0 w-full h-full select-none"
          initial={reduced ? false : { opacity: 0, scale: 1.12, rotate: -8 }}
          animate={play ? { opacity: 1, scale: 1, rotate: 0 } : undefined}
          transition={{ delay: THREAD * 0.75, duration: 0.7, ease: EASE }}
        />
        {!reduced && (
          <svg viewBox="0 0 901 1044" className="absolute inset-0 w-full h-full overflow-visible pointer-events-none" aria-hidden>
            <defs>
              <mask id="patch-thread-mask" maskUnits="userSpaceOnUse" x="-100" y="-100" width="1101" height="1244">
                <path
                  d={OUTLINE}
                  fill="none"
                  stroke="white"
                  strokeWidth={60}
                  pathLength={1}
                  style={{
                    strokeDasharray: "1 1",
                    strokeDashoffset: play ? 0 : 1,
                    transition: `stroke-dashoffset ${THREAD}s ease-in-out`,
                  }}
                />
              </mask>
            </defs>
            <motion.path
              d={OUTLINE}
              fill="none"
              stroke="var(--ink)"
              strokeWidth={16}
              strokeDasharray="48 34"
              strokeLinecap="round"
              mask="url(#patch-thread-mask)"
              initial={{ opacity: 1 }}
              animate={play ? { opacity: 0 } : undefined}
              transition={{ delay: THREAD + 0.5, duration: 0.6 }}
            />
          </svg>
        )}
      </div>
      <p className="t-mono-xs mt-[18px]" style={{ color: "var(--muted)", letterSpacing: "0.14em" }}>
        MORRO · DROP 01
      </p>
    </section>
  );
}
