import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, EASE, useReducedMotion } from "./Star";
import { srcSet } from "@/lib/img";

export function Hero({ product }) {
  const reduced = useReducedMotion();

  return (
    <section className="flex flex-col-reverse md:flex-row relative" data-testid="hero-section">
      <div className="flex-1 flex flex-col px-[20px] md:px-[50px] py-[50px] md:py-[60px]" style={{ background: "var(--studio)" }}>
        <div className="my-auto">
          <p className="t-mono-sm mb-[20px]" data-testid="hero-tag">[ OUT NOW ]</p>
          <motion.h1
            data-testid="hero-title"
            className="font-display"
            style={{ fontSize: "clamp(64px, 8vw, 116px)", lineHeight: 0.95 }}
            initial={reduced ? {} : { fontStretch: "62%", fontWeight: 300, letterSpacing: "0.02em", opacity: 0 }}
            animate={{ fontStretch: "125%", fontWeight: 800, letterSpacing: "-0.015em", opacity: 1 }}
            transition={{ duration: 1.6, delay: 0.2, ease: EASE }}
          >
            DROP 01
          </motion.h1>
          <p className="t-body-copy mt-[20px] mb-[30px]">
            The first piece from MORRO. One hoodie, faded black. The art of becoming starts here.
          </p>
          <div className="flex flex-wrap" style={{ gap: 10 }}>
            <Link to={product ? `/product/${product.slug}` : "/shop"} data-testid="hero-shop-cta" className="btn-primary">
              <span className="btn-star"><Star size={16} /></span>
              SHOP THE DROP
            </Link>
            <Link to="/lookbook" data-testid="hero-lookbook-cta" className="btn-secondary">
              VIEW LOOKBOOK
            </Link>
          </div>
        </div>
        <p className="t-mono-xs mt-[50px] hidden md:block" style={{ color: "var(--muted)" }}>
          001 — “MXXVI” HOODIE · FADED BLACK · LOOKS 01—14
        </p>
      </div>
      <div className="flex-1 overflow-hidden" style={{ background: "var(--flatlay)", height: "clamp(480px, 78vh, 780px)" }}>
        <motion.img
          src="/brand/02-hero-mobile.jpg" srcSet={srcSet("/brand/02-hero-mobile.jpg")} sizes="(min-width: 768px) 50vw, 100vw" srcSet={srcSet("/brand/02-hero-mobile.jpg")} sizes="(min-width: 768px) 50vw, 100vw"
          alt="DROP 01"
          className="w-full h-full object-cover"
          style={{ objectPosition: "center 30%" }}
          initial={reduced ? {} : { filter: "grayscale(1) blur(10px)", scale: 1.06, opacity: 0.4 }}
          animate={{ filter: "grayscale(0) blur(0px)", scale: 1, opacity: 1 }}
          transition={{ duration: 1.4, ease: EASE }}
        />
      </div>
    </section>
  );
}
