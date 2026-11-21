import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock } from "lucide-react";
import { api, useStore, DROP_PASS_KEY } from "../lib/store";
import { BrandMark, Wordmark } from "../components/Logo";
import { EmailCapture } from "../components/EmailCapture";
import { Star, EASE } from "../components/Star";
import { MonogramField } from "../components/Monogram";
import { srcSet } from "@/lib/img";

function pad(n) {
  return String(n).padStart(2, "0");
}

function CountDigit({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <div className="overflow-hidden" style={{ height: "1em", fontSize: "clamp(40px, 8vw, 80px)", lineHeight: 1 }}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            className="font-mono block"
            data-testid={`countdown-${label.toLowerCase()}`}
            style={{ fontSize: "inherit", fontWeight: 500, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="t-mono-xs mt-[8px]" style={{ color: "var(--muted-dark)" }}>{label}</span>
    </div>
  );
}

export default function DropMode() {
  const { settings, refreshSettings, isAdmin, setAdminPreview } = useStore();
  const [now, setNow] = useState(new Date());
  const [pwOpen, setPwOpen] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState("");

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const target = useMemo(() => (settings?.drop_at ? new Date(settings.drop_at) : null), [settings]);

  const diff = target ? Math.max(0, target.getTime() - now.getTime()) : 0;
  const hasCountdown = !!target && !Number.isNaN(target.getTime());

  // When the countdown hits zero, ask the server again: it ends Drop Mode at the drop time
  // and the store opens for this visitor without a reload. Retries every few seconds in case
  // this device's clock runs slightly ahead of the server's.
  const ended = hasCountdown && diff === 0;
  useEffect(() => {
    if (!ended) return undefined;
    refreshSettings();
    const t = setInterval(refreshSettings, 5000);
    return () => clearInterval(t);
  }, [ended, refreshSettings]);
  const displayDate = settings?.drop_display_date || "";
  const days = Math.floor(diff / 86400000);
  const hrs = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);

  const teasers = settings?.teasers || [
    { number: "001", label: "SOON", image: "/brand/hoodie-01-flatlay.jpg" },
    { number: "002", label: "CLASSIFIED", image: "" },
    { number: "003", label: "CLASSIFIED", image: "" },
    { number: "004", label: "CLASSIFIED", image: "" },
  ];

  const tryUnlock = async (e) => {
    e.preventDefault();
    setPwError("");
    try {
      const { data } = await api.post("/drop-mode/unlock", { password: pw });
      try { localStorage.setItem(DROP_PASS_KEY, data.token); } catch { /* cookie still works */ }
      await refreshSettings();
    } catch {
      setPwError("WRONG PASSWORD");
    }
  };

  const clock = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  return (
    <div className="relative overflow-hidden" style={{ background: "var(--black)", color: "var(--paper)", minHeight: "100vh" }} data-testid="drop-mode-page">
      <MonogramField opacity={0.03} />
      {isAdmin && (
        <div
          data-testid="drop-admin-bar"
          className="t-mono-xs relative z-[2] flex flex-wrap items-center justify-center gap-x-[18px] gap-y-[6px] px-[15px] py-[10px] text-center"
          style={{ background: "#d4ff3a", color: "#111" }}
        >
          <span>SIGNED IN · THIS IS WHAT CUSTOMERS SEE</span>
          <a href="/admin?tab=dropmode" data-testid="drop-admin-studio" style={{ textDecoration: "underline" }}>STUDIO (TURN OFF DROP MODE)</a>
          <button data-testid="drop-admin-preview" onClick={() => setAdminPreview(true)} style={{ textDecoration: "underline" }}>PREVIEW FULL SITE</button>
        </div>
      )}
      {/* Top strip */}
      <div
        className="t-mono-sm flex items-center justify-between px-[15px] md:px-[25px]"
        style={{ height: 44, borderBottom: "1px solid #1F1F1F", color: "var(--muted-dark)" }}
        data-testid="drop-top-strip"
      >
        <span>● STORE CLOSED</span>
        <span data-testid="local-clock">LOCAL TIME {clock}</span>
        {displayDate ? <span className="hidden md:inline">NEXT DROP: {displayDate}</span> : <span className="hidden md:inline">NEXT DROP: SOON</span>}
      </div>

      <div className="relative z-[1] flex flex-col items-center px-[20px] pt-[60px] pb-[80px] text-center">
        <BrandMark variant="white" size={64} />
        <p className="t-mono-sm mt-[25px] mb-[30px]" style={{ color: "var(--muted-dark)" }}>
          [ {(settings?.drop_label || "DROP 01").toUpperCase()} ]
        </p>

        {/* Peephole */}
        <div className="overflow-hidden mb-[40px]" style={{ width: "min(560px, 90vw)", height: 96, border: "1px solid #2E2E2E" }} data-testid="peephole">
          <img
            src="/brand/02-hero-mobile.jpg" srcSet={srcSet("/brand/02-hero-mobile.jpg")} sizes="min(560px, 90vw)"
            alt=""
            className="w-full h-full object-cover"
            style={{ objectPosition: "center 39%" }}
          />
        </div>

        {/* Wordmark */}
        <div className="mb-[30px] w-full flex justify-center" data-testid="drop-wordmark">
          <Wordmark variant="white" plain style={{ width: "min(760px, 88vw)", height: "auto", display: "block" }} />
        </div>

        <p className="t-mono-md mb-[8px] flex items-center justify-center" style={{ gap: 10, color: "var(--paper)", letterSpacing: "0.16em" }} data-testid="drop-slogan">
          <Star size={18} spinning spinDuration={10} />
          THE ART OF BECOMING
        </p>

        <p className="t-mono-md mb-[20px]" style={{ color: "var(--muted-dark)" }} data-testid="drop-date-text">
          {ended ? "OPENING NOW" : displayDate || "COMING SOON"}
        </p>

        {/* Countdown (only when a drop time is set) */}
        {hasCountdown && (
        <div className="flex items-start justify-center mb-[50px]" data-testid="countdown" style={{ gap: "clamp(8px, 3vw, 30px)" }}>
          {[
            [pad(days), "DAYS"],
            [pad(hrs), "HRS"],
            [pad(mins), "MIN"],
            [pad(secs), "SEC"],
          ].map(([val, label], i) => (
            <div key={label} className="flex items-start" style={{ gap: "clamp(8px, 3vw, 30px)" }}>
              {i > 0 && (
                <span className="font-mono" style={{ fontSize: "clamp(40px, 8vw, 80px)", fontWeight: 500, color: "#4A4A4A", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
                  :
                </span>
              )}
              <CountDigit value={val} label={label} />
            </div>
          ))}
        </div>
        )}
        {!hasCountdown && <div className="mb-[30px]" />}

        {/* Email capture */}
        <div className="w-full" style={{ maxWidth: 480 }}>
          <EmailCapture
            tag="early-access"
            dark
            buttonLabel="GET EARLY ACCESS"
            successText="YOU'RE ON THE LIST. WATCH YOUR INBOX ON DROP DAY."
            smsLabel="ALSO TEXT ME WHEN IT DROPS"
          />
        </div>

        {/* Password */}
        <div className="mt-[40px]">
          {!pwOpen ? (
            <button
              data-testid="password-reveal"
              className="t-mono-xs flex items-center"
              style={{ gap: 8, color: "var(--muted-dark)" }}
              onClick={() => setPwOpen(true)}
            >
              <Lock size={12} strokeWidth={1} />
              HAVE A PASSWORD? ENTER HERE
            </button>
          ) : (
            <form onSubmit={tryUnlock} className="flex flex-col items-center" style={{ gap: 10 }} data-testid="password-form">
              <input
                type="password"
                data-testid="password-input"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="PASSWORD"
                className="t-mono-sm outline-none text-center"
                style={{ height: 48, width: 260, border: "1px solid #5A5A5A", background: "transparent", color: "var(--paper)" }}
              />
              {pwError && <p className="t-mono-xs" data-testid="password-error" style={{ color: "var(--paper)" }}>{pwError}</p>}
              <button type="submit" data-testid="password-submit" className="btn-outline-white" style={{ height: 44, fontSize: 12 }}>
                ENTER
              </button>
            </form>
          )}
        </div>

        {/* What's coming */}
        <div className="w-full mt-[80px]" style={{ maxWidth: 900 }}>
          <div className="flex items-baseline justify-between mb-[20px]">
            <span className="t-mono-sm">WHAT'S COMING</span>
            <span className="t-mono-xs" style={{ color: "var(--muted-dark)" }}>REVEALED ON DROP DAY</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 10 }}>
            {teasers.slice(0, 4).map((t, i) => (
              <div key={i} data-testid={`teaser-tile-${i}`} className="teaser-tile relative flex items-center justify-center" style={{ aspectRatio: "4/5", background: "#0A0A0A", border: "1px solid #262626" }}>
                {t.image ? (
                  <img
                    src={t.image} srcSet={srcSet(t.image)} sizes="(min-width: 768px) 25vw, 50vw"
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ filter: "blur(12px) brightness(0.45)" }}
                    loading="lazy"
                  />
                ) : (
                  <Lock size={20} strokeWidth={1} color="#4A4A4A" className="teaser-lock" />
                )}
                <span className="t-mono-xs absolute bottom-[10px] left-[10px]" style={{ color: "#BDBDBD" }}>
                  {t.number} / {t.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer strip */}
      <div
        className="t-mono-xs flex items-center justify-between px-[15px] md:px-[25px]"
        style={{ height: 44, borderTop: "1px solid #1F1F1F", color: "#8F8F8F" }}
        data-testid="drop-footer-strip"
      >
        <span>© 2026 MORRO</span>
        {!isAdmin && (
          <a href="/account" data-testid="drop-staff-signin" style={{ color: "#8F8F8F" }}>STAFF SIGN IN</a>
        )}
        <a href="https://www.instagram.com/morroxxvl/" target="_blank" rel="noopener noreferrer" style={{ color: "#8F8F8F" }} data-testid="drop-instagram">
          INSTAGRAM @MORROXXVL
        </a>
      </div>
    </div>
  );
}
