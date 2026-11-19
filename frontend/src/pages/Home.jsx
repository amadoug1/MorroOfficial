import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { Lock } from "lucide-react";
import { api } from "../lib/store";
import { ProductCard } from "../components/ProductCard";
import { EmailCapture } from "../components/EmailCapture";
import { SloganTicker } from "../components/SloganTicker";
import { Hero } from "../components/Hero";
import { Movement } from "../components/Movement";
import { LookbookStrip } from "../components/LookbookStrip";
import { Star, BecomingHeadline, DrawRule, EASE, useReducedMotion } from "../components/Star";
import { Scramble } from "../components/Experience";
import { MonogramField } from "../components/Monogram";

const ROTATING_WORDS = ["BETTER", "BOLDER", "GREATER", "YOURSELF"];

function RotatingWord() {
  const [index, setIndex] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % ROTATING_WORDS.length), 2200);
    return () => clearInterval(t);
  }, [reduced]);

  const wordStyle = {
    fontSize: "clamp(38px, 4.6vw, 68px)",
    lineHeight: 0.95,
    color: "transparent",
    WebkitTextStroke: "1.5px #FFFFFF",
    display: "block",
  };

  if (reduced) {
    return <span className="font-display" style={wordStyle}>{ROTATING_WORDS[3]}</span>;
  }

  return (
    <span className="block overflow-hidden" style={{ height: "1.1em", fontSize: "clamp(38px, 4.6vw, 68px)" }}>
      <motion.span
        key={index}
        data-testid="rotating-word"
        className="font-display"
        style={wordStyle}
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: "0%", opacity: 1 }}
        exit={{ y: "-100%", opacity: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        {ROTATING_WORDS[index]}
      </motion.span>
    </span>
  );
}

/* 5a: scroll-highlight paragraph */
const BRAND_PARAGRAPH =
  "MORRO is about growth, evolution and becoming a better version of yourself. It's built for individuality and ambition, and for anyone who knows their past doesn't define their future. You're always becoming something greater.";

function BrandSectionInner() {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "end 40%"] });
  const [prog, setProg] = useState(0);
  useEffect(() => scrollYProgress.on("change", (v) => setProg(v)), [scrollYProgress]);
  const words = BRAND_PARAGRAPH.split(" ");

  return (
    <div ref={ref}>
      <p className="t-body-copy-lg t-body-copy-dark" data-testid="brand-paragraph" style={{ maxWidth: 480 }}>
        {words.map((w, i) => (
          <span
            key={i}
            style={{
              opacity: reduced || prog * words.length * 1.15 > i ? 1 : 0.2,
              transition: "opacity 400ms ease",
            }}
          >
            {w}{" "}
          </span>
        ))}
      </p>
      <motion.p
        className="t-mono-sm"
        data-testid="brand-pullquote"
        style={{ color: "var(--paper)", borderLeft: "2px solid #FFFFFF", paddingLeft: 14, marginTop: 26 }}
        animate={{ opacity: reduced || prog > 0.85 ? 1 : 0.2 }}
        transition={{ duration: 0.6 }}
      >
        YOUR PAST DOESN'T DEFINE YOUR FUTURE.
      </motion.p>
    </div>
  );
}

function LockedTeaser({ number }) {
  const [notifyOpen, setNotifyOpen] = useState(false);
  return (
    <div data-testid={`teaser-${number}`} className="teaser-tile">
      <div className="relative flex items-center justify-center overflow-hidden" style={{ aspectRatio: "4/5", background: "var(--black)" }}>
        <span className="scanline" aria-hidden />
        <Lock size={22} strokeWidth={1} color="#BDBDBD" className="teaser-lock" />
        <span className="t-mono-xs absolute bottom-[10px] left-[10px]" style={{ color: "#BDBDBD" }}>
          <Scramble text={`${number} / CLASSIFIED`} />
        </span>
      </div>
      <div className="mt-[10px]">
        <div className="flex justify-between items-baseline">
          <p className="t-mono-sm">DROP 02</p>
          <p className="t-mono-price" style={{ color: "var(--muted)" }}>— —</p>
        </div>
        {notifyOpen ? (
          <div className="mt-[15px]">
            <EmailCapture tag="drop-02" buttonLabel="NOTIFY ME" showSms={false} successText="YOU'RE ON THE LIST FOR DROP 02" />
          </div>
        ) : (
          <button data-testid={`notify-${number}`} className="btn-secondary w-full mt-[15px]" style={{ height: 48 }} onClick={() => setNotifyOpen(true)}>
            NOTIFY ME
          </button>
        )}
      </div>
    </div>
  );
}

function SectionLabel({ children, dark = false }) {
  return (
    <motion.p
      className="t-mono-sm mb-[15px]"
      style={{ color: dark ? "var(--muted-dark)" : "var(--muted)" }}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.8 }}
      transition={{ duration: 0.6, ease: EASE }}
      data-testid="section-index"
    >
      {children}
    </motion.p>
  );
}

export default function Home() {
  const [product, setProduct] = useState(null);
  const [settings, setSettings] = useState(null);
  const brandRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const reduced = reducedMotion;
  const { scrollYProgress: brandProg } = useScroll({ target: brandRef, offset: ["start end", "end start"] });
  const sleeveY = useTransform(brandProg, [0, 1], [0, -60]);
  const sleeveScale = useTransform(brandProg, [0, 1], [1, 1.08]);

  useEffect(() => {
    api.get("/products", { params: { collection: "drop-1" } })
      .then(({ data }) => setProduct(data[0] || null))
      .catch(() => setProduct(null));
    api.get("/settings").then(({ data }) => setSettings(data)).catch(() => setSettings({}));
  }, []);

  const wild = settings?.wild_images || ["", "", ""];

  return (
    <div data-testid="home-page">
      {/* a) HERO */}
      <Hero product={product} />

      {/* b) DROP 01 GRID */}
      <section className="px-[20px] md:px-[40px] py-[60px]" data-testid="drop-grid-section">
        <SectionLabel>(01) DROP</SectionLabel>
        <div className="flex items-baseline justify-between mb-[15px]">
          <h2><BecomingHeadline nowrap style={{ fontSize: 32 }}>DROP 01</BecomingHeadline></h2>
          <span className="t-mono-xs" style={{ color: "var(--muted)" }}>1 AVAILABLE NOW · MORE SOON</span>
        </div>
        <DrawRule style={{ marginBottom: 30 }} />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-[15px]">
          {[
            product && <ProductCard key="p" product={product} quickAdd />,
            <LockedTeaser key="002" number="002" />,
            <LockedTeaser key="003" number="003" />,
            <LockedTeaser key="004" number="004" />,
          ].filter(Boolean).map((el, i) => (
            <motion.div
              key={el.key}
              initial={reduced ? {} : { y: 40, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.09, ease: EASE }}
            >
              {el}
            </motion.div>
          ))}
        </div>
      </section>

      {/* c) BRAND STORY */}
      <section ref={brandRef} className="grid md:grid-cols-2 relative overflow-hidden" style={{ background: "var(--black)", color: "var(--paper)" }} data-testid="brand-story-section">
        <MonogramField opacity={0.04} />
        <div className="relative z-[1] flex flex-col justify-center px-[20px] md:px-[50px] py-[60px]" style={{ gap: 26 }}>
          <SectionLabel dark>(02) THE BRAND</SectionLabel>
          <p className="t-mono-sm flex items-center" style={{ gap: 10, color: "#BDBDBD" }}>
            <Star size={16} spinning spinDuration={10} style={{ color: "#FFFFFF" }} />
            THE BRAND
          </p>
          <div>
            <h2 className="font-display" style={{ fontSize: "clamp(38px, 4.6vw, 68px)", lineHeight: 0.95 }}>
              THE ART OF<br />BECOMING
            </h2>
            <div className="mt-[10px]">
              <RotatingWord />
            </div>
          </div>
          <BrandSectionInner />
          <div>
            <Link to="/about" data-testid="our-story-link" className="btn-outline-white">
              <span className="btn-star"><Star size={16} /></span>
              OUR STORY
            </Link>
          </div>
        </div>
        <div className="hidden md:block overflow-hidden relative z-[1]" style={{ minHeight: 660 }}>
          <motion.img
            src="/brand/hoodie-05-sleeve.jpg"
            alt="Sleeve monogram"
            className="w-full h-full object-cover"
            style={{ y: reduced ? 0 : sleeveY, scale: reduced ? 1 : sleeveScale }}
            loading="lazy"
          />
        </div>
      </section>

      {/* (03) MOVEMENT */}
      <div className="px-[20px] md:px-[40px] pt-[40px]">
        <SectionLabel>(03) MOVEMENT</SectionLabel>
      </div>
      <Movement />

      {/* d) LOOKBOOK STRIP */}
      <div className="px-[20px] md:px-[40px] pt-[60px]">
        <SectionLabel>(04) LOOKBOOK</SectionLabel>
      </div>
      <LookbookStrip />

      {/* e) IN THE WILD */}
      <section className="px-[20px] md:px-[40px] pb-[60px]" data-testid="in-the-wild-section">
        <SectionLabel>(05) IN THE WILD</SectionLabel>
        <div className="flex items-baseline justify-between mb-[15px]">
          <h2><BecomingHeadline nowrap style={{ fontSize: 32 }}>IN THE WILD</BecomingHeadline></h2>
          <span className="t-mono-xs" style={{ color: "var(--muted)" }}>NEXT SHOOT: STREET + LIFESTYLE</span>
        </div>
        <DrawRule style={{ marginBottom: 30 }} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[15px]">
          {[0, 1, 2].map((i) => (
            <div key={i} data-testid={`wild-tile-${i + 1}`} className="flex items-center justify-center" style={{ aspectRatio: "4/5", background: wild[i] ? "var(--flatlay)" : "#F4F4F2", border: wild[i] ? "none" : "1px dashed #8A8A8A" }}>
              {wild[i] ? (
                <img src={wild[i]} alt={`Lifestyle ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <span className="t-mono-xs" style={{ color: "#6B6B6B" }}>[LIFESTYLE PHOTO {String(i + 1).padStart(2, "0")}]</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* f) NEWSLETTER */}
      <section className="px-[20px] md:px-[40px] py-[80px]" style={{ background: "var(--studio)" }} data-testid="newsletter-section">
        <SectionLabel>(06) JOIN</SectionLabel>
        <h2 className="mb-[20px]">
          <BecomingHeadline nowrap style={{ fontSize: "clamp(40px, 6vw, 88px)", lineHeight: 0.95 }}>
            DON'T MISS DROP 02.
          </BecomingHeadline>
        </h2>
        <p className="t-body-copy mb-[30px]">
          First access, drop dates and restocks. Straight to your inbox.
        </p>
        <div style={{ maxWidth: 560 }}>
          <EmailCapture tag="drop-02-list" buttonLabel="JOIN" big successText="YOU'RE ON THE LIST. WATCH YOUR INBOX ON DROP DAY." />
        </div>
      </section>
    </div>
  );
}
