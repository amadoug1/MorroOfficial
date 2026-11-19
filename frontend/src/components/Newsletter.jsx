import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { api } from "../lib/store";

export function Newsletter({ compact = false }) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !email.includes("@")) {
      setError("PLEASE ENTER A VALID EMAIL");
      return;
    }
    try {
      await api.post("/newsletter", { email });
      setDone(true);
    } catch {
      setError("SOMETHING WENT WRONG — TRY AGAIN");
    }
  };

  if (done) {
    return (
      <div data-testid="newsletter-thanks">
        <p className="t-small" style={{ color: "var(--ink)" }}>THANK YOU</p>
        <p className="t-small mt-[10px]" style={{ color: "var(--muted)", letterSpacing: "0.6px", textTransform: "none" }}>
          By providing your email address, you agree to our Privacy Policy.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} data-testid="newsletter-form">
      <div
        className="newsletter-field flex items-center border px-[15px]"
        style={{ borderColor: "var(--ink)", height: compact ? 40 : 45 }}
      >
        <input
          data-testid="newsletter-input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="EMAIL ADDRESS"
          className="t-small flex-1 bg-transparent outline-none placeholder:text-[#C4C4C4]"
          style={{ color: "var(--ink)" }}
        />
        <button type="submit" data-testid="newsletter-submit" aria-label="Subscribe" className="ml-[10px]">
          <ArrowRight size={16} strokeWidth={1} />
        </button>
      </div>
      {error && <p className="t-small mt-[10px]" style={{ color: "var(--ink)" }} data-testid="newsletter-error">{error}</p>}
      <p className="mt-[10px]" style={{ fontSize: 10, letterSpacing: "0.6px", color: "var(--muted)" }}>
        By providing your email address, you agree to our Privacy Policy.
      </p>
    </form>
  );
}
