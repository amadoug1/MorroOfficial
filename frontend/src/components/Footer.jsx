import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Wordmark } from "./Logo";
import { Star, EASE, useReducedMotion } from "./Star";
import { Scramble, LiveClock } from "./Experience";
import { useStore } from "../lib/store";

function FooterWordmark() {
  const reduced = useReducedMotion();
  return (
    <div className="mb-[40px] overflow-hidden" data-testid="footer-wordmark">
      <motion.div
        initial={reduced ? {} : { clipPath: "inset(0 100% 0 0)" }}
        whileInView={{ clipPath: "inset(0 0% 0 0)" }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 1.2, ease: EASE }}
      >
        <Wordmark variant="white" plain style={{ width: "100%", height: "auto", display: "block" }} />
      </motion.div>
    </div>
  );
}

const COLUMNS = [
  ["SHOP", [["Drop 01", "/shop?collection=drop-1"], ["Lookbook", "/lookbook"]]],
  ["HELP", [["Shipping", "/shipping"], ["Returns", "/returns"], ["Size guide", "/client-services"], ["Contact", "/client-services"]]],
  ["FOLLOW", [["Instagram [@HANDLE]", "https://instagram.com"], ["TikTok [@HANDLE]", "https://tiktok.com"]]],
];

export function Footer() {
  const { setRegionOpen, region } = useStore();

  return (
    <footer data-testid="footer" style={{ background: "var(--black)", color: "var(--paper)" }}>
      <div className="px-[20px] md:px-[40px] pt-[60px] pb-[30px]">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-[40px] mb-[60px] max-w-[900px]">
          {COLUMNS.map(([title, links]) => (
            <div key={title}>
              <p className="t-mono-xs mb-[20px]" style={{ color: "var(--muted-dark)" }}>{title}</p>
              <ul className="flex flex-col" style={{ gap: 12 }}>
                {links.map(([label, to]) => (
                  <li key={label}>
                    {to.startsWith("http") ? (
                      <a href={to} target="_blank" rel="noopener noreferrer" data-testid={`footer-link-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} className="t-mono-sm" style={{ color: "var(--paper)" }}>
                        <Scramble text={label} />
                      </a>
                    ) : (
                      <Link to={to} data-testid={`footer-link-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} className="t-mono-sm" style={{ color: "var(--paper)" }}>
                        <Scramble text={label} />
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="t-mono-sm flex items-center mb-[25px]" style={{ gap: 10, color: "var(--paper)", letterSpacing: "0.14em" }} data-testid="footer-slogan">
          <Star size={18} spinning spinDuration={10} />
          THE ART OF BECOMING
        </p>
        <FooterWordmark />
        <div
          className="flex flex-col md:flex-row md:items-center justify-between gap-[15px] pt-[25px]"
          style={{ borderTop: "1px solid #1F1F1F" }}
        >
          <p className="t-mono-xs" style={{ color: "#8F8F8F" }}>© 2026 MORRO</p>
          <LiveClock className="t-mono-xs" style={{ color: "#8F8F8F" }} />
          <button data-testid="region-trigger" className="t-mono-xs self-start md:self-auto" style={{ color: "#8F8F8F" }} onClick={() => setRegionOpen(true)}>
            SHIPPING TO: {region.toUpperCase()}
          </button>
          <p className="t-mono-xs" style={{ color: "#8F8F8F" }}>
            <Link to="/privacy" data-testid="footer-link-privacy" style={{ color: "#8F8F8F" }}>PRIVACY</Link>
            {" · "}
            <Link to="/returns" data-testid="footer-link-terms" style={{ color: "#8F8F8F" }}>TERMS</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
