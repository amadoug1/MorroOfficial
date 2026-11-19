import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../lib/store";
import { Star, EASE, useReducedMotion } from "./Star";

function StarBurst({ show }) {
  const reduced = useReducedMotion();
  if (!show || reduced) return null;
  return (
    <span className="absolute inset-0 pointer-events-none" data-testid="star-burst">
      {[...Array(6)].map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        const dist = 30 + (i % 3) * 15;
        return (
          <motion.span
            key={i}
            className="absolute"
            style={{ left: "50%", top: "50%", color: "var(--ink)" }}
            initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
            animate={{ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, scale: [0, 1, 0.6], opacity: [1, 1, 0], rotate: 180 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <Star size={12} />
          </motion.span>
        );
      })}
    </span>
  );
}

export function EmailCapture({
  tag = "general",
  dark = false,
  buttonLabel = "JOIN",
  successText = "THANK YOU",
  successButton = "YOU'RE IN",
  showSms = true,
  smsLabel = "ALSO TEXT ME ON DROP DAY",
  big = false,
}) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [sms, setSms] = useState(false);
  const [done, setDone] = useState(false);
  const [burst, setBurst] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !email.includes("@")) {
      setError("PLEASE ENTER A VALID EMAIL");
      return;
    }
    try {
      await api.post("/newsletter", { email, phone: sms ? phone : "", tag });
      setDone(true);
      setBurst(true);
      setTimeout(() => setBurst(false), 800);
    } catch {
      setError("SOMETHING WENT WRONG — TRY AGAIN");
    }
  };

  const border = dark ? "#5A5A5A" : "var(--ink)";
  const textColor = dark ? "var(--paper)" : "var(--ink)";

  return (
    <div className="w-full">
      <form onSubmit={submit} data-testid={`email-capture-${tag}`}>
        <div className="flex" style={{ gap: 0 }}>
          <span className={`u-input ${dark ? "u-input-dark" : ""} flex-1`}>
            <input
              data-testid={`email-input-${tag}`}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="EMAIL ADDRESS"
              className="t-mono-sm w-full outline-none px-[15px]"
              disabled={done}
              style={{
                height: big ? 56 : 52,
                border: `1px solid ${border}`,
                borderRight: "none",
                background: dark ? "transparent" : "var(--paper)",
                color: textColor,
              }}
            />
          </span>
          <span className="relative shrink-0">
            <button
              type="submit"
              data-testid={`email-submit-${tag}`}
              className="font-display"
              disabled={done}
              style={{
                height: big ? 56 : 52,
                padding: "0 28px",
                fontWeight: 700,
                fontSize: 13,
                textTransform: "uppercase",
                background: dark ? "var(--paper)" : "var(--ink)",
                color: dark ? "var(--black)" : "var(--paper)",
                border: `1px solid ${dark ? "var(--paper)" : "var(--ink)"}`,
              }}
            >
              {done ? successButton : buttonLabel}
            </button>
            <StarBurst show={burst} />
          </span>
        </div>
        {showSms && !done && (
          <label className="t-mono-xs flex items-center mt-[15px]" style={{ gap: 10, color: dark ? "var(--muted-dark)" : "var(--muted)" }}>
            <input
              type="checkbox"
              data-testid={`sms-checkbox-${tag}`}
              checked={sms}
              onChange={(e) => setSms(e.target.checked)}
              style={{ width: 14, height: 14, accentColor: dark ? "#fff" : "#111" }}
            />
            {smsLabel}
          </label>
        )}
        {showSms && sms && !done && (
          <input
            data-testid={`phone-input-${tag}`}
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="PHONE NUMBER"
            className="t-mono-sm w-full outline-none px-[15px] mt-[10px]"
            style={{
              height: 52,
              border: `1px solid ${border}`,
              background: dark ? "transparent" : "var(--paper)",
              color: textColor,
            }}
          />
        )}
        {error && <p className="t-mono-xs mt-[10px]" data-testid={`email-error-${tag}`} style={{ color: dark ? "var(--paper)" : "var(--ink)" }}>{error}</p>}
        {done && (
          <p className="t-mono-xs mt-[10px]" data-testid="email-capture-success" style={{ color: dark ? "var(--muted-dark)" : "var(--muted)" }}>
            {successText}
          </p>
        )}
      </form>
    </div>
  );
}
