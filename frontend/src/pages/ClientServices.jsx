import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { api } from "../lib/store";

const FAQS = [
  ["WHEN WILL MY ORDER SHIP?", "[Shipping times, costs and the return window.]"],
  ["DO YOU SHIP INTERNATIONALLY?", "[International shipping details]"],
  ["WHAT IS YOUR RETURN POLICY?", "[Return window and conditions]"],
  ["HOW DOES MORRO SIZING RUN?", "[Fit notes and model size]"],
];

export default function ClientServices() {
  const [open, setOpen] = useState(-1);
  const [form, setForm] = useState({ name: "", email: "", subject: "General", message: "" });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/contact", form);
      setSent(true);
    } catch {
      setError("SOMETHING WENT WRONG — TRY AGAIN");
    }
  };

  const field = { border: "1px solid var(--ink)", height: 52, padding: "0 15px" };

  return (
    <div className="px-[20px] md:px-[40px] pt-[40px] pb-[80px]" data-testid="client-services-page">
      <div className="pb-[15px] mb-[40px]" style={{ borderBottom: "1px solid var(--ink)" }}>
        <h1 className="font-display" style={{ fontSize: 32 }}>CLIENT SERVICES</h1>
      </div>
      <div className="grid md:grid-cols-2 gap-[50px]">
        <div>
          <p className="t-mono-sm mb-[25px]" style={{ color: "var(--muted)" }}>CONTACT US</p>
          {sent ? (
            <p className="t-mono-sm" data-testid="contact-success">THANK YOU — WE WILL REPLY WITHIN 24 HOURS.</p>
          ) : (
            <form onSubmit={submit} className="flex flex-col gap-[15px]" data-testid="contact-form">
              <input data-testid="contact-name" required placeholder="NAME" className="t-mono-sm bg-transparent outline-none w-full" style={field}
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input data-testid="contact-email" required type="email" placeholder="EMAIL ADDRESS" className="t-mono-sm bg-transparent outline-none w-full" style={field}
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <textarea data-testid="contact-message" required placeholder="MESSAGE" className="t-mono-sm bg-transparent outline-none w-full pt-[15px]" style={{ ...field, height: 140 }}
                value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
              {error && <p className="t-mono-xs" data-testid="contact-error">{error}</p>}
              <button data-testid="contact-submit" type="submit" className="btn-primary">
                SEND
              </button>
            </form>
          )}
        </div>
        <div>
          <p className="t-mono-sm mb-[25px]" style={{ color: "var(--muted)" }}>FREQUENTLY ASKED</p>
          <div>
            {FAQS.map(([q, a], i) => (
              <div key={i} style={{ borderTop: "1px solid var(--hairline)" }} data-testid={`faq-${i}`}>
                <button className="w-full flex items-center justify-between py-[15px]" onClick={() => setOpen(open === i ? -1 : i)} data-testid={`faq-toggle-${i}`}>
                  <span className="t-mono-sm text-left">{q}</span>
                  {open === i ? <Minus size={14} strokeWidth={1} /> : <Plus size={14} strokeWidth={1} />}
                </button>
                <AnimatePresence>
                  {open === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                      <p className="t-body-copy pb-[20px]" style={{ color: "var(--muted)" }}>{a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
