import { useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../lib/store";
import { Star } from "./Star";

export function ProductCard({ product, quickAdd = false }) {
  const { addToCart } = useStore();
  const [loaded, setLoaded] = useState(false);
  const [size, setSize] = useState("");
  const hasSecond = product.images.length > 1;

  const pickSize = (s, e) => {
    setSize(s);
    if (quickAdd) {
      const card = e.currentTarget.closest(`[data-testid="product-card-${product.slug}"]`);
      const img = card?.querySelector("img");
      const rect = img?.getBoundingClientRect();
      addToCart({
        product_id: product.slug,
        name: product.name,
        price: product.price,
        color: product.colors[0] || "",
        size: s,
        qty: 1,
        image: product.images[0],
      }, rect && img ? { left: rect.left, top: rect.top, width: rect.width, height: rect.height, img: product.images[0] } : null);
      setSize("");
    }
  };

  return (
    <div data-testid={`product-card-${product.slug}`} className="group">
      <Link to={`/product/${product.slug}`} className="block" data-cursor="VIEW">
        <div className="relative overflow-hidden" style={{ aspectRatio: "4/5", background: "var(--flatlay)" }}>
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            className={`img-fade ${loaded ? "loaded" : ""} w-full h-full object-cover`}
          />
          {hasSecond && (
            <img
              src={product.images[1]}
              alt=""
              loading="lazy"
              aria-hidden
              className="card-wipe absolute inset-0 w-full h-full object-cover"
            />
          )}
          <span className="badge badge-new absolute top-[10px] left-[10px] z-[1]" data-testid={`badge-new-${product.slug}`}>NEW</span>
          {quickAdd && (
            <div
              className="quick-add-bar absolute bottom-0 left-0 right-0 hidden md:flex items-center justify-between px-[12px]"
              style={{ background: "var(--black)", height: 46, zIndex: 1 }}
              onClick={(e) => e.preventDefault()}
            >
              <span className="t-mono-xs" style={{ color: "var(--paper)" }}>QUICK ADD</span>
              <span className="flex" style={{ gap: 8 }}>
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    data-testid={`quickadd-size-${product.slug}-${s}`}
                    className="t-mono-sm"
                    style={{ color: "var(--paper)", padding: "4px 6px" }}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); pickSize(s, e); }}
                  >
                    {s}
                  </button>
                ))}
              </span>
            </div>
          )}
        </div>
      </Link>
      <div className="mt-[10px]">
        {quickAdd && (
          <div className="flex md:hidden mb-[10px]" style={{ gap: 5 }}>
            {product.sizes.map((s) => (
              <button
                key={s}
                data-testid={`quickadd-size-m-${product.slug}-${s}`}
                className={`size-chip ${size === s ? "selected" : ""}`}
                onClick={(e) => pickSize(s, e)}
              >
                <span>{s}</span>
              </button>
            ))}
          </div>
        )}
        <div className="flex justify-between items-baseline" style={{ gap: 10 }}>
          <Link to={`/product/${product.slug}`}>
            <p className="t-mono-sm">{product.name}</p>
          </Link>
          <p className="t-mono-price">${product.price.toFixed(2)}</p>
        </div>
        <p className="t-mono-xs mt-[5px]" style={{ color: "var(--muted)" }}>{(product.colors[0] || "").toUpperCase()}</p>
        {quickAdd && (
          <button
            data-testid={`quickadd-button-${product.slug}`}
            className={`${size ? "btn-primary" : "btn-disabled"} w-full mt-[15px] md:hidden`}
            onClick={(e) => size && pickSize(size, e)}
            style={{ height: 48 }}
          >
            {size && <span className="btn-star"><Star size={16} /></span>}
            {size ? `ADD TO BAG — ${size}` : "SELECT A SIZE"}
          </button>
        )}
      </div>
    </div>
  );
}
