import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { useStore, api } from "../lib/store";
import { StarPatch, Star } from "./Star";
import { thumb } from "@/lib/img";

function QtyNumber({ value, testid }) {
  return (
    <span className="inline-block overflow-hidden" style={{ height: "1.2em", lineHeight: "1.2em" }}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          data-testid={testid}
          className="t-mono-sm inline-block px-[10px]"
          initial={{ y: "100%" }}
          animate={{ y: "0%" }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function CartDrawer() {
  const { cart, cartOpen, setCartOpen, updateQty, removeLine, subtotal, cartCount } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const checkout = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/checkout", {
        items: cart,
        origin_url: window.location.origin,
      });
      window.location.href = data.checkout_url;
    } catch (e) {
      setError(e.response?.data?.detail || "Checkout unavailable right now");
      setLoading(false);
    }
  };

  return (
    <>
      <div
        data-testid="cart-overlay"
        className={`overlay-fade fixed inset-0 z-40 ${cartOpen ? "open" : ""}`}
        style={{ background: "rgba(0,0,0,0.4)" }}
        onClick={() => setCartOpen(false)}
      />
      <aside
        data-testid="cart-drawer"
        className={`drawer-right fixed top-0 right-0 bottom-0 z-50 bg-white flex flex-col ${cartOpen ? "open" : ""}`}
        style={{ width: "min(440px, 100vw)" }}
      >
        <div className="flex items-center justify-between px-[25px]" style={{ height: 64, borderBottom: "1px solid var(--ink)" }}>
          <span className="t-mono-sm" data-testid="cart-title">BAG ({cartCount})</span>
          <button data-testid="cart-close-button" className="t-mono-sm" style={{ color: "var(--muted)" }} onClick={() => setCartOpen(false)}>
            CLOSE
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-[25px]" data-lenis-prevent>
          {cart.length === 0 ? (
            <div className="py-[60px] text-center">
              <div className="flex justify-center mb-[25px]"><StarPatch size={140} /></div>
              <p className="t-body-copy" style={{ color: "var(--muted)" }} data-testid="cart-empty-message">Your bag is empty.</p>
              <button
                data-testid="cart-continue-shopping"
                className="btn-secondary mt-[25px]"
                style={{ height: 44 }}
                onClick={() => { setCartOpen(false); navigate("/shop"); }}
              >
                CONTINUE SHOPPING
              </button>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {cart.map((line, i) => (
                <motion.div
                  key={`${line.product_id}-${line.size}-${line.color}`}
                  className="flex gap-[15px] py-[20px] overflow-hidden"
                  style={{ borderBottom: "1px solid var(--hairline)" }}
                  data-testid={`cart-line-${i}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, paddingTop: 0, paddingBottom: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="shrink-0" style={{ width: 80, height: 100, background: "var(--flatlay)" }}>
                    <img src={thumb(line.image)} alt={line.name} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between gap-[10px]">
                      <p className="t-mono-sm">{line.name}</p>
                      <p className="t-mono-price">${line.price.toFixed(2)}</p>
                    </div>
                    <p className="t-mono-xs mt-[5px]" style={{ color: "var(--muted)" }}>{line.color} / {line.size}</p>
                    <div className="mt-auto flex items-center justify-between pt-[10px]">
                      <div className="flex items-center" style={{ border: "1px solid var(--ink)" }}>
                        <button data-testid={`cart-qty-minus-${i}`} className="px-[10px] py-[5px]" onClick={() => updateQty(i, -1)} aria-label="Decrease quantity">
                          <Minus size={12} strokeWidth={1} />
                        </button>
                        <QtyNumber value={line.qty} testid={`cart-qty-${i}`} />
                        <button data-testid={`cart-qty-plus-${i}`} className="px-[10px] py-[5px]" onClick={() => updateQty(i, 1)} aria-label="Increase quantity">
                          <Plus size={12} strokeWidth={1} />
                        </button>
                      </div>
                      <button data-testid={`cart-remove-${i}`} className="t-mono-xs" style={{ color: "var(--muted)" }} onClick={() => removeLine(i)}>
                        REMOVE
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {cart.length > 0 && (
          <div className="px-[25px] py-[20px]" style={{ borderTop: "1px solid var(--ink)" }}>
            <div className="flex justify-between mb-[10px]">
              <span className="t-mono-sm">SUBTOTAL</span>
              <span className="t-mono-price" data-testid="cart-subtotal">${subtotal.toFixed(2)} USD</span>
            </div>
            <p className="t-mono-xs mb-[20px]" style={{ color: "var(--muted)" }} data-testid="cart-shipping-note">
              SHIPPING: CALCULATED AT CHECKOUT
            </p>
            {error && <p className="t-mono-xs mb-[10px]" data-testid="cart-checkout-error">{error}</p>}
            <button
              data-testid="checkout-button"
              className="btn-primary w-full"
              onClick={checkout}
              disabled={loading}
            >
              <span className="btn-star"><Star size={16} /></span>
              {loading ? "REDIRECTING…" : "CHECKOUT"}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
