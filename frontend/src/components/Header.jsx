import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "../lib/store";
import { Wordmark } from "./Logo";
import { Star, EASE, useReducedMotion } from "./Star";
import { AnnouncementBar } from "./AnnouncementBar";
import { Scramble } from "./Experience";

function MenuIcon() {
  return (
    <span className="flex flex-col justify-center" style={{ gap: 5, width: 18 }}>
      <span style={{ height: 1, background: "currentColor", display: "block" }} />
      <span style={{ height: 1, background: "currentColor", display: "block" }} />
    </span>
  );
}

export function Header() {
  const { cartCount, setCartOpen, setMenuOpen, setSearchOpen } = useStore();
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const [starPop, setStarPop] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [markHover, setMarkHover] = useState(false);
  const prevCount = useRef(cartCount);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 120);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (cartCount > prevCount.current) {
      setStarPop(true);
      const t = setTimeout(() => setStarPop(false), 700);
      prevCount.current = cartCount;
      return () => clearTimeout(t);
    }
    prevCount.current = cartCount;
  }, [cartCount]);

  return (
    <>
      <AnnouncementBar />
      <header
        data-testid="header"
        className="bg-white"
        style={{ height: scrolled ? 52 : 64, borderBottom: "1px solid var(--ink)", color: "var(--ink)", transition: "height 300ms cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        <div className="h-full px-[20px] md:px-[40px] grid grid-cols-3 items-center">
          <div className="flex items-center">
            <button
              data-testid="menu-open-button"
              className="t-mono-sm flex items-center"
              style={{ gap: 10 }}
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <MenuIcon />
              <span className="hidden md:inline"><Scramble text="MENU" /></span>
            </button>
          </div>
          <div className="flex justify-center relative" style={{ height: 30 }}>
            <Link
              to="/"
              data-testid="header-logo"
              aria-label="MORRO home"
              className="flex items-center absolute inset-0 justify-center"
              style={{
                opacity: scrolled ? 0 : 1,
                transform: scrolled ? "translateY(-6px)" : "translateY(0)",
                transition: "opacity 300ms ease, transform 300ms ease",
                pointerEvents: scrolled ? "none" : "auto",
              }}
            >
              <Wordmark />
            </Link>
            <Link
              to="/"
              data-testid="header-mark"
              aria-label="MORRO home"
              className="flex items-center absolute inset-0 justify-center"
              style={{
                opacity: scrolled ? 1 : 0,
                transform: scrolled ? "rotate(0deg) scale(1)" : "rotate(-90deg) scale(0.5)",
                transition: "opacity 500ms cubic-bezier(0.16,1,0.3,1), transform 700ms cubic-bezier(0.16,1,0.3,1)",
                pointerEvents: scrolled ? "auto" : "none",
              }}
              onMouseEnter={() => setMarkHover(true)}
              onMouseLeave={() => setMarkHover(false)}
            >
              <motion.img
                src="/brand/morro-mark-black.png"
                alt="MORRO"
                style={{ height: 30, width: "auto", display: "block" }}
                animate={{ rotate: markHover ? 360 : 0 }}
                transition={{ duration: 1.2, ease: "linear" }}
              />
            </Link>
          </div>
          <div className="flex items-center justify-end gap-[20px]">
            <button data-testid="search-open-button" onClick={() => setSearchOpen(true)} aria-label="Search">
              <Search size={16} strokeWidth={1} />
            </button>
            <button data-testid="account-link" onClick={() => navigate("/account")} aria-label="Account">
              <User size={16} strokeWidth={1} />
            </button>
            <button data-testid="nav-bag-button" className="t-mono-sm flex items-center" style={{ gap: 6 }} onClick={() => setCartOpen(true)}>
              {cartCount > 0 && (
                <motion.span
                  key={starPop ? "pop" : "idle"}
                  initial={starPop && !reduced ? { scale: 0, rotate: 0 } : false}
                  animate={starPop && !reduced ? { scale: [0, 1.3, 1], rotate: 180 } : {}}
                  transition={{ duration: 0.6, ease: EASE }}
                  className="inline-flex"
                  data-testid="bag-star"
                >
                  <Star size={14} />
                </motion.span>
              )}
              <Scramble text={`BAG (${cartCount})`} />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
