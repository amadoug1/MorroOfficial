import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Plus, Minus, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { api, useStore } from "../lib/store";
import { Star, BecomingHeadline, FocusImage, DrawRule, EASE, useReducedMotion } from "../components/Star";

function Accordion({ title, children, id, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderTop: "1px solid var(--hairline)" }} data-testid={`accordion-${id}`}>
      <button
        data-testid={`accordion-toggle-${id}`}
        className="w-full flex items-center justify-between py-[15px]"
        onClick={() => setOpen(!open)}
      >
        <span className="t-mono-sm">{title}</span>
        <motion.span animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.3, ease: EASE }} className="inline-flex">
          <Plus size={14} strokeWidth={1} />
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="pb-[20px] t-body-copy" style={{ color: "var(--muted)" }}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const SEEN_IN = [
  [3, "/brand/lookbook-03.jpg"],
  [9, "/brand/lookbook-09.jpg"],
  [5, "/brand/lookbook-05.jpg"],
  [7, "/brand/lookbook-07.jpg"],
];

/* 9b: fullscreen viewer */
function Viewer({ images, index, onClose, onNav }) {
  const [zoomed, setZoomed] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const drag = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNav(1);
      if (e.key === "ArrowLeft") onNav(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onNav]);

  useEffect(() => {
    setZoomed(false);
    setPos({ x: 0, y: 0 });
  }, [index]);

  const toggleZoom = (e) => {
    if (!zoomed) {
      setZoomed(true);
    } else {
      setZoomed(false);
      setPos({ x: 0, y: 0 });
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[95] flex items-center justify-center"
      style={{ background: "var(--black)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      data-testid="image-viewer"
    >
      <span className="t-mono-sm absolute top-[20px] left-[20px]" style={{ color: "var(--paper)" }} data-testid="viewer-counter">
        {String(index + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
      </span>
      <button className="t-mono-sm absolute top-[20px] right-[20px]" style={{ color: "var(--paper)" }} onClick={onClose} data-testid="viewer-close">
        CLOSE
      </button>
      <button className="absolute left-[15px] top-1/2 -translate-y-1/2" style={{ color: "var(--paper)" }} onClick={() => onNav(-1)} aria-label="Previous" data-testid="viewer-prev">
        <ChevronLeft size={28} strokeWidth={1} />
      </button>
      <button className="absolute right-[15px] top-1/2 -translate-y-1/2" style={{ color: "var(--paper)" }} onClick={() => onNav(1)} aria-label="Next" data-testid="viewer-next">
        <ChevronRight size={28} strokeWidth={1} />
      </button>
      <AnimatePresence mode="wait">
        <motion.img
          key={index}
          src={images[index]}
          alt=""
          className="object-contain select-none"
          style={{
            maxWidth: "90vw",
            maxHeight: "88vh",
            transform: `scale(${zoomed ? 2 : 1}) translate(${pos.x / (zoomed ? 2 : 1)}px, ${pos.y / (zoomed ? 2 : 1)}px)`,
            cursor: zoomed ? "grab" : "zoom-in",
          }}
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -40, opacity: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          onClick={toggleZoom}
          onMouseDown={(e) => {
            if (!zoomed) return;
            drag.current = { sx: e.clientX - pos.x, sy: e.clientY - pos.y };
          }}
          onMouseMove={(e) => {
            if (!zoomed || !drag.current || e.buttons !== 1) return;
            setPos({ x: e.clientX - drag.current.sx, y: e.clientY - drag.current.sy });
          }}
          onMouseUp={() => (drag.current = null)}
          onMouseLeave={() => (drag.current = null)}
          onWheel={(e) => {
            if (e.deltaY < 0 && !zoomed) setZoomed(true);
            if (e.deltaY > 0 && zoomed) { setZoomed(false); setPos({ x: 0, y: 0 }); }
          }}
          draggable={false}
        />
      </AnimatePresence>
    </motion.div>
  );
}

/* 9c: mobile sticky buy bar */
function StickyBuyBar({ product, size, onPick, visible }) {
  if (!visible) return null;
  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden items-center justify-between px-[15px]"
      style={{ background: "var(--black)", height: 56 }}
      initial={{ y: 56 }}
      animate={{ y: 0 }}
      exit={{ y: 56 }}
      transition={{ duration: 0.3, ease: EASE }}
      data-testid="sticky-buy-bar"
    >
      <span className="t-mono-xs" style={{ color: "var(--paper)" }}>
        {product.name.toUpperCase()} · ${product.price.toFixed(0)}
      </span>
      <button
        data-testid="sticky-add-button"
        className="font-display"
        style={{ background: "var(--paper)", color: "var(--black)", fontWeight: 700, fontSize: 12, textTransform: "uppercase", padding: "10px 20px" }}
        onClick={onPick}
      >
        {size ? `ADD — ${size}` : "SELECT SIZE"}
      </button>
    </motion.div>
  );
}

export default function ProductPage() {
  const { slug } = useParams();
  const { addToCart } = useStore();
  const [product, setProduct] = useState(null);
  const [size, setSize] = useState("");
  const [imgIndex, setImgIndex] = useState(0);
  const [viewer, setViewer] = useState(-1);
  const [showSticky, setShowSticky] = useState(false);
  const addBtnRef = useRef(null);
  const sizeRef = useRef(null);
  const addBtnInView = useInView(addBtnRef, { amount: 0.5 });
  const reduced = useReducedMotion();

  useEffect(() => {
    setProduct(null);
    setImgIndex(0);
    setSize("");
    setViewer(-1);
    window.scrollTo(0, 0);
    api.get(`/products/${slug}`).then(({ data }) => setProduct(data)).catch(() => setProduct(null));
  }, [slug]);

  useEffect(() => {
    setShowSticky(!addBtnInView && !!product);
  }, [addBtnInView, product]);

  if (!product) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: "60vh" }} data-testid="product-loading">
        <Star size={24} spinning spinDuration={1.2} style={{ color: "var(--ink)" }} />
      </div>
    );
  }

  const gallery = [
    { src: product.images[0], label: "" },
    { src: product.images[1], label: "" },
    { src: product.images[2], label: "" },
    { src: product.images[3], label: "" },
    { src: product.images[4], label: "" },
    { src: "/brand/lookbook-02.jpg", label: "AS SEEN IN LOOK 02" },
  ].filter((g) => g.src);

  const stock = product.stock && Object.keys(product.stock).length ? product.stock : null;
  const sizeStock = size && stock ? stock[size] : null;

  const add = (e) => {
    if (!size) return;
    const img = document.querySelector(`[data-testid="product-page"] img`);
    const rect = img?.getBoundingClientRect();
    addToCart({
      product_id: product.slug,
      name: product.name,
      price: product.price,
      color: product.colors[0] || "",
      size,
      qty: 1,
      image: product.images[0],
    }, rect ? { left: rect.left, top: rect.top, width: rect.width, height: rect.height, img: product.images[0] } : null);
  };

  const stickyPick = () => {
    if (size) {
      add();
    } else {
      sizeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div data-testid="product-page">
      <div className="px-[20px] md:px-[40px] pt-[20px] pb-[60px]">
        <p className="t-mono-xs mb-[25px]" style={{ color: "var(--muted)" }} data-testid="breadcrumb">
          SHOP / DROP 01 / {product.name.toUpperCase()}
        </p>
        <div className="grid md:grid-cols-[1fr_460px]" style={{ gap: 40 }}>
          {/* Gallery */}
          <div>
            <div className="hidden md:grid grid-cols-2" style={{ gap: 8 }}>
              {gallery.map((g, i) => (
                <motion.button
                  key={i}
                  className="relative block"
                  style={{ aspectRatio: "4/5", background: "var(--flatlay)", overflow: "hidden" }}
                  onClick={() => setViewer(i)}
                  data-testid={`gallery-img-${i}`}
                  data-cursor="VIEW"
                  initial={reduced ? {} : { clipPath: "inset(100% 0 0 0)" }}
                  whileInView={{ clipPath: "inset(0% 0 0 0)" }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 1, delay: i * 0.08, ease: EASE }}
                >
                  <img src={g.src} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" loading={i < 2 ? "eager" : "lazy"} />
                  {g.label && (
                    <span className="t-mono-xs absolute bottom-[10px] left-[10px] px-[8px] py-[4px]" style={{ background: "var(--paper)", color: "var(--ink)" }}>
                      {g.label}
                    </span>
                  )}
                </motion.button>
              ))}
            </div>
            <div className="md:hidden relative" style={{ background: "var(--flatlay)" }}>
              <div
                className="overflow-x-auto flex snap-x snap-mandatory"
                style={{ scrollbarWidth: "none" }}
                onScroll={(e) => setImgIndex(Math.round(e.target.scrollLeft / e.target.clientWidth))}
                data-testid="product-carousel"
              >
                {gallery.map((g, i) => (
                  <button key={i} className="w-full shrink-0 snap-center relative" style={{ aspectRatio: "4/5" }} onClick={() => setViewer(i)}>
                    <img src={g.src} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" loading={i === 0 ? "eager" : "lazy"} />
                    {g.label && (
                      <span className="t-mono-xs absolute bottom-[10px] left-[10px] px-[8px] py-[4px]" style={{ background: "var(--paper)", color: "var(--ink)" }}>
                        {g.label}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <div className="absolute bottom-[15px] left-0 right-0 flex justify-center" style={{ gap: 8 }}>
                {gallery.map((_, i) => (
                  <span key={i} data-testid={`carousel-dot-${i}`} style={{ width: 5, height: 5, borderRadius: "50%", background: i === imgIndex ? "var(--ink)" : "#BDBDBD" }} />
                ))}
              </div>
            </div>
          </div>

          {/* Info column */}
          <div>
            <div className="md:sticky" style={{ top: 20 }}>
              <p className="t-mono-sm mb-[15px]" style={{ color: "var(--muted)" }} data-testid="product-drop-label">[ DROP 01 ] — 001</p>
              <h1 className="mb-[15px]" data-testid="product-name">
                <BecomingHeadline style={{ fontSize: 38, lineHeight: 1 }}>
                  {product.name.toUpperCase()}
                </BecomingHeadline>
              </h1>
              <p className="mb-[5px]" data-testid="product-price" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 18, fontWeight: 500 }}>
                ${product.price.toFixed(2)} USD
              </p>
              <p className="t-mono-sm mb-[30px]" style={{ color: "var(--muted)" }} data-testid="shipping-note">
                + SHIPPING, CALCULATED AT CHECKOUT
              </p>

              {/* Authenticity note */}
              <button
                data-testid="auth-note"
                className="auth-note w-full flex items-center text-left mb-[30px]"
                style={{ border: "1px solid var(--ink)", padding: 14, gap: 14, background: "transparent" }}
                onClick={() => {
                  const sleeve = document.querySelector('[data-testid="gallery-img-4"]') || document.querySelector('[data-testid="product-carousel"]');
                  sleeve?.scrollIntoView({ behavior: "smooth", block: "center" });
                  const target = document.querySelector('[data-testid="gallery-img-4"]');
                  if (target) {
                    target.classList.add("sleeve-highlight");
                    setTimeout(() => target.classList.remove("sleeve-highlight"), 1400);
                  }
                }}
              >
                <motion.img
                  src="/brand/morro-mark-black.png"
                  alt=""
                  style={{ width: 40, height: 40, display: "block", flexShrink: 0 }}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 1.2, ease: "linear" }}
                />
                <span className="t-body-copy" style={{ fontSize: 12, color: "#2A2A2A" }}>
                  Look for the circle M on the sleeve.{" "}
                  <span style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>See the detail →</span>
                </span>
              </button>

              <p className="t-mono-sm mb-[10px]" style={{ color: "var(--muted)" }}>
                COLOR — <span style={{ color: "var(--ink)" }} data-testid="product-color-name">{(product.colors[0] || "").toUpperCase()}</span>
              </p>
              <div className="mb-[30px]">
                <span
                  data-testid="color-swatch-0"
                  className="inline-block"
                  style={{ width: 44, height: 44, background: product.color_hexes[0] || "#111", border: "1px solid var(--hairline)" }}
                />
              </div>

              <div className="flex items-baseline justify-between mb-[10px]">
                <p className="t-mono-sm" style={{ color: "var(--muted)" }}>SIZE</p>
                <Link to="/client-services" data-testid="size-guide-link" className="t-mono-xs" style={{ color: "var(--ink)", textDecoration: "underline", textUnderlineOffset: 3 }}>
                  SIZE GUIDE
                </Link>
              </div>
              <div className="flex mb-[15px]" style={{ gap: 5 }} ref={sizeRef}>
                {product.sizes.map((s) => {
                  const sStock = stock ? stock[s] : null;
                  const soldOut = sStock === 0;
                  return (
                    <button
                      key={s}
                      data-testid={`size-option-${s}`}
                      className={`size-chip ${size === s ? "selected" : ""} ${soldOut ? "soldout" : ""}`}
                      onClick={() => !soldOut && setSize(s)}
                    >
                      <span>{s}</span>
                    </button>
                  );
                })}
              </div>

              {size && (
                <p className="t-mono-xs mb-[15px]" data-testid="size-status" style={{ color: "var(--muted)" }}>
                  SIZE {size} — {sizeStock !== null && sizeStock !== undefined
                    ? sizeStock === 0
                      ? "SOLD OUT"
                      : sizeStock <= 3
                      ? `ONLY ${sizeStock} LEFT`
                      : "IN STOCK · [SHIPS IN X DAYS]"
                    : "IN STOCK · [SHIPS IN X DAYS]"}
                  {sizeStock !== null && sizeStock !== undefined && sizeStock > 0 && sizeStock <= 3 && (
                    <span className="badge badge-lowstock ml-[8px]">LOW STOCK</span>
                  )}
                </p>
              )}

              <span ref={addBtnRef} className="block">
                <button
                  data-testid="add-to-bag-button"
                  className={size ? "btn-primary w-full" : "btn-disabled w-full"}
                  style={{ height: 56 }}
                  onClick={add}
                  disabled={product.sold_out}
                >
                  {size && !product.sold_out && <span className="btn-star"><Star size={16} /></span>}
                  {product.sold_out ? "SOLD OUT" : size ? `ADD TO BAG — ${size}` : "SELECT A SIZE"}
                </button>
              </span>

              <div className="mt-[40px]">
                <Accordion title="DETAILS" id="details" defaultOpen>
                  <p>
                    Sun-faded black wash with distressed hood and cuffs. Oversized MXXVI chest print, circle M on the sleeve, kangaroo pocket. [Add fabric and weight from the maker.]
                  </p>
                </Accordion>
                <Accordion title="SIZE & FIT" id="size-fit">
                  <p>[Fit notes and model size]</p>
                </Accordion>
                <Accordion title="SHIPPING & RETURNS" id="shipping">
                  <p>[Shipping times, costs and the return window.]</p>
                </Accordion>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seen in lookbook */}
      <section className="px-[20px] md:px-[40px] pb-[60px]" data-testid="seen-in-lookbook">
        <div className="flex items-baseline justify-between mb-[15px]">
          <h2>
            <BecomingHeadline nowrap style={{ fontSize: 24 }}>SEEN IN THE LOOKBOOK</BecomingHeadline>
          </h2>
          <Link to="/lookbook" className="t-mono-xs" data-testid="seen-view-all">VIEW ALL →</Link>
        </div>
        <DrawRule style={{ marginBottom: 25 }} />
        <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 8 }}>
          {SEEN_IN.map(([n, src]) => (
            <Link key={n} to="/lookbook" data-testid={`seen-look-${n}`} data-cursor="VIEW">
              <FocusImage src={src} alt={`Look ${n}`} style={{ aspectRatio: "4/5", background: "var(--flatlay)" }} />
              <p className="t-mono-xs mt-[10px]" style={{ color: "var(--muted)" }}>LOOK {String(n).padStart(2, "0")}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Fullscreen viewer */}
      <AnimatePresence>
        {viewer >= 0 && (
          <Viewer
            images={gallery.map((g) => g.src)}
            index={viewer}
            onClose={() => setViewer(-1)}
            onNav={(d) => setViewer((v) => (v + d + gallery.length) % gallery.length)}
          />
        )}
      </AnimatePresence>

      {/* Mobile sticky buy bar */}
      <AnimatePresence>
        {showSticky && <StickyBuyBar product={product} size={size} onPick={stickyPick} visible />}
      </AnimatePresence>
    </div>
  );
}
