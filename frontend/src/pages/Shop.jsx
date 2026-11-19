import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../lib/store";
import { ProductCard } from "../components/ProductCard";

export default function Shop() {
  const [params] = useSearchParams();
  const collection = params.get("collection");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const q = {};
    if (collection) q.collection = collection;
    api.get("/products", { params: q })
      .then(({ data }) => setProducts(data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [collection]);

  const title = collection === "drop-1" ? "DROP 01" : "SHOP ALL";
  const gridCols =
    products.length === 1
      ? "grid grid-cols-1 md:grid-cols-2 gap-[15px] max-w-[840px]"
      : products.length === 3
      ? "grid grid-cols-2 md:grid-cols-3 gap-[15px]"
      : "grid grid-cols-2 md:grid-cols-4 gap-[15px]";

  return (
    <div className="px-[20px] md:px-[40px] pb-[60px] pt-[40px]" data-testid="shop-page">
      <div className="flex items-baseline justify-between pb-[15px] mb-[30px]" style={{ borderBottom: "1px solid var(--ink)" }}>
        <h1 className="font-display" style={{ fontSize: 32 }} data-testid="collection-title">{title}</h1>
        <span className="t-mono-xs" style={{ color: "var(--muted)" }} data-testid="collection-count">
          {products.length} {products.length === 1 ? "ITEM" : "ITEMS"}
        </span>
      </div>

      {loading ? (
        <div className={gridCols}>
          {[...Array(2)].map((_, i) => (
            <div key={i} style={{ aspectRatio: "4/5", background: "var(--flatlay)" }} />
          ))}
        </div>
      ) : (
        <motion.div
          className={gridCols}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {products.map((p) => (
            <ProductCard key={p.id} product={p} quickAdd />
          ))}
        </motion.div>
      )}
      {!loading && products.length === 0 && (
        <p className="t-body py-[60px] text-center" style={{ color: "var(--muted)" }} data-testid="shop-empty">
          Nothing here yet.
        </p>
      )}
    </div>
  );
}
