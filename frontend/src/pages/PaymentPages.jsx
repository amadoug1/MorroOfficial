import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { api, useStore } from "../lib/store";
import { StarPatch, BecomingHeadline, useReducedMotion } from "../components/Star";

/* Order-confirmed wax-seal stamp */
function SealStamp() {
  const reduced = useReducedMotion();
  return (
    <div className="relative flex justify-center mb-[40px]" data-testid="seal-stamp">
      <motion.span
        aria-hidden
        className="absolute"
        style={{ width: 112, height: 112, border: "2px solid #111", top: 0 }}
        initial={reduced ? { opacity: 0 } : { scale: 0.8, opacity: 0.35 }}
        animate={{ scale: 1.6, opacity: 0 }}
        transition={{ duration: 1, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.img
        src="/brand/morro-mark-black.png"
        alt="MORRO seal"
        style={{ width: 112, height: 112, display: "block" }}
        initial={reduced ? {} : { opacity: 0, scale: 1.9, rotate: -28 }}
        animate={
          reduced
            ? {}
            : {
                opacity: [0, 1, 1, 1],
                scale: [1.9, 0.94, 1.03, 1],
                rotate: [-28, -10, -12, -12],
              }
        }
        transition={{ duration: 0.8, times: [0, 0.55, 0.75, 1], ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}

export function PaymentSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const { clearCart } = useStore();
  const [status, setStatus] = useState("checking");
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    if (!sessionId) {
      setStatus("unknown");
      return;
    }
    let attempts = 0;
    const poll = async () => {
      try {
        const { data } = await api.get(`/payments/status/${sessionId}`);
        if (data.payment_status === "paid") {
          setStatus("paid");
          setOrderId(data.order_id || "");
          clearCart();
          return;
        }
      } catch { /* retry */ }
      attempts += 1;
      if (attempts < 8) setTimeout(poll, 2000);
      else setStatus("pending");
    };
    poll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  return (
    <div className="px-[20px] text-center" style={{ paddingTop: 140, paddingBottom: 120 }} data-testid="payment-success-page">
      {status === "paid" ? <SealStamp /> : (
        <div className="flex justify-center mb-[40px]"><StarPatch size={120} /></div>
      )}
      <h1 className="mb-[20px]" data-testid="payment-headline">
        <BecomingHeadline style={{ fontSize: "clamp(32px, 6vw, 64px)", lineHeight: 0.95 }}>
          {status === "paid" ? "WELCOME TO THE BECOMING." : status === "checking" ? "CONFIRMING YOUR ORDER…" : "ALMOST THERE."}
        </BecomingHeadline>
      </h1>
      {orderId && <p className="t-mono-sm mb-[10px]" style={{ color: "var(--muted)" }} data-testid="order-number">ORDER {orderId.toUpperCase()} · SEALED</p>}
      <p className="t-body-copy mb-[40px]" style={{ color: "var(--muted)", maxWidth: "none", marginLeft: "auto", marginRight: "auto" }} data-testid="payment-status-text">
        {status === "paid"
          ? "Thanks for your order. A confirmation is on its way to your inbox."
          : status === "checking"
          ? "We're confirming your payment with Stripe."
          : "Your payment is still processing — check back shortly."}
      </p>
      <Link to="/shop" data-testid="payment-continue" className="btn-primary">BACK TO THE STORE</Link>
    </div>
  );
}

export function PaymentCancel() {
  return (
    <div className="px-[20px] text-center" style={{ paddingTop: 140, paddingBottom: 120 }} data-testid="payment-cancel-page">
      <div className="flex justify-center mb-[40px]"><StarPatch size={120} /></div>
      <h1 className="mb-[20px]">
        <BecomingHeadline style={{ fontSize: "clamp(32px, 6vw, 64px)", lineHeight: 0.95 }}>
          NO RUSH. YOUR BAG IS SAVED.
        </BecomingHeadline>
      </h1>
      <p className="t-body-copy mb-[40px]" style={{ color: "var(--muted)", maxWidth: "none" }}>Nothing was charged — your pieces are waiting.</p>
      <Link to="/shop" data-testid="cancel-continue" className="btn-secondary">RETURN TO BAG</Link>
    </div>
  );
}
