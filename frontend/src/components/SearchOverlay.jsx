import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useStore, api } from "../lib/store";

const RECOMMENDED = [
  ["Drop 01", "/shop?collection=drop-1"],
  ["“MXXVI” Hoodie", "/product/mxxvi-hoodie"],
];

export function SearchOverlay() {
  const { searchOpen, setSearchOpen } = useStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!searchOpen) {
      setQuery("");
      setResults([]);
    }
  }, [searchOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const { data } = await api.get("/products", { params: { q: query } });
        setResults(data);
      } catch {
        setResults([]);
      }
    }, 200);
    return () => clearTimeout(t);
  }, [query]);

  const close = () => setSearchOpen(false);

  return (
    <div
      data-testid="search-overlay"
      className="fixed top-0 left-0 right-0 z-50 bg-white"
      style={{
        transform: searchOpen ? "translateY(0)" : "translateY(-100%)",
        transition: "transform 300ms ease-in-out",
        maxHeight: "100vh",
        overflowY: "auto",
        borderBottom: "1px solid var(--ink)",
      }}
      data-lenis-prevent
    >
      <div className="px-[20px] md:px-[40px] pt-[25px] pb-[40px]">
        <div className="flex items-center gap-[15px]" style={{ borderBottom: "1px solid var(--ink)", paddingBottom: 12 }}>
          <input
            data-testid="search-input"
            autoFocus={searchOpen}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="SEARCH"
            className="flex-1 bg-transparent outline-none font-display"
            style={{ fontSize: 24, letterSpacing: "-0.01em" }}
          />
          <button data-testid="search-close-button" className="t-mono-sm" style={{ color: "var(--muted)" }} onClick={close}>
            CLOSE
          </button>
        </div>

        {!query.trim() && (
          <div className="mt-[40px]">
            <p className="t-mono-xs mb-[20px]" style={{ color: "var(--muted)" }}>RECOMMENDATIONS</p>
            <div className="flex flex-col gap-[5px]">
              {RECOMMENDED.map(([label, to]) => (
                <Link key={label} to={to} data-testid={`search-rec-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} className="t-mono-md" style={{ lineHeight: "38px", color: "var(--ink)" }} onClick={close}>
                  {label}
                </Link>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-[15px] mt-[40px] max-w-[600px]">
              <Link to="/lookbook" data-testid="search-tile-lookbook" onClick={close} className="block">
                <div className="overflow-hidden" style={{ aspectRatio: "4/5", background: "var(--flatlay)" }}>
                  <img src="/brand/lookbook-01.jpg" alt="Lookbook" className="w-full h-full object-cover" loading="lazy" />
                </div>
                <p className="t-mono-xs mt-[10px]">LOOKBOOK</p>
              </Link>
              <Link to="/product/mxxvi-hoodie" data-testid="search-tile-product" onClick={close} className="block">
                <div className="overflow-hidden" style={{ aspectRatio: "4/5", background: "var(--flatlay)" }}>
                  <img src="/brand/hoodie-01-flatlay.jpg" alt="Product" className="w-full h-full object-cover" loading="lazy" />
                </div>
                <p className="t-mono-xs mt-[10px]">001 — THE HOODIE</p>
              </Link>
            </div>
          </div>
        )}

        {query.trim() && (
          <div className="mt-[40px]">
            <p className="t-mono-xs mb-[20px]" style={{ color: "var(--muted)" }} data-testid="search-results-count">
              {results.length} {results.length === 1 ? "RESULT" : "RESULTS"}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-[10px] md:gap-[15px]">
              {results.map((p) => (
                <Link key={p.id} to={`/product/${p.slug}`} data-testid={`search-result-${p.slug}`} onClick={close}>
                  <div style={{ aspectRatio: "4/5", background: "var(--flatlay)" }}>
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <p className="t-mono-sm mt-[10px]">{p.name}</p>
                  <p className="t-mono-price mt-[5px]" style={{ color: "var(--muted)" }}>${p.price.toFixed(2)}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
