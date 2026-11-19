import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BecomingHeadline, DrawRule, EASE, useReducedMotion } from "../components/Star";
import { TypeText } from "../components/Experience";
import { srcSet } from "@/lib/img";

const LOOKS = Array.from({ length: 14 }, (_, i) => i + 1).map((n) => ({
  img: `/brand/lookbook-${String(n).padStart(2, "0")}.jpg`,
  caption: `LOOK ${String(n).padStart(2, "0")}`,
  link: "/product/mxxvi-hoodie",
}));

export default function Lookbook() {
  const reduced = useReducedMotion();
  return (
    <div data-testid="lookbook-page">
      <div className="px-[20px] md:px-[40px] pt-[40px] pb-[30px]">
        <div className="flex items-baseline justify-between mb-[15px]">
          <h1>
            <BecomingHeadline nowrap style={{ fontSize: 32 }}>LOOKBOOK</BecomingHeadline>
          </h1>
          <span className="t-mono-xs" style={{ color: "var(--muted)" }}>14 LOOKS · DROP 01</span>
        </div>
        <DrawRule />
      </div>
      {LOOKS.map((look, i) => (
        <motion.div
          key={i}
          className="mb-[5px]"
          initial={reduced ? {} : { clipPath: "inset(100% 0 0 0)" }}
          whileInView={{ clipPath: "inset(0% 0 0 0)" }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1.1, ease: EASE }}
        >
          <Link to={look.link} data-testid={`look-${i + 1}`} data-cursor="VIEW">
            <div className="overflow-hidden" style={{ background: "var(--flatlay)" }}>
              <img src={look.img} srcSet={srcSet(look.img)} sizes="(min-width: 768px) 60vw, 100vw" alt={look.caption} className="w-full block object-cover" style={{ maxHeight: "92vh" }} loading="lazy" />
            </div>
            <p className="t-mono-xs px-[20px] md:px-[40px] py-[15px]" style={{ color: "var(--muted)" }}>
              <TypeText text={look.caption} />
            </p>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
