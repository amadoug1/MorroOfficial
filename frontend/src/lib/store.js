import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API, withCredentials: true });

export const ADMIN_TOKEN_KEY = "morro_admin_token";
export const DROP_PASS_KEY = "morro_drop_pass";
const PREVIEW_KEY = "morro_admin_preview";

// Cookies can be blocked cross-site, so also send stored tokens as headers.
api.interceptors.request.use((config) => {
  try {
    const admin = localStorage.getItem(ADMIN_TOKEN_KEY);
    const pass = localStorage.getItem(DROP_PASS_KEY);
    if (admin) config.headers.Authorization = `Bearer ${admin}`;
    if (pass) config.headers["X-Drop-Pass"] = pass;
  } catch { /* storage unavailable */ }
  return config;
});

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("morro_cart") || "[]");
    } catch {
      return [];
    }
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [regionOpen, setRegionOpen] = useState(false);
  const [region, setRegion] = useState(() => localStorage.getItem("morro_region") || "United States (USD)");
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    localStorage.setItem("morro_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("morro_region", region);
  }, [region]);

  const refreshSettings = useCallback(
    () => api.get("/settings").then(({ data }) => setSettings(data)).catch(() => setSettings({})),
    []
  );

  // Keep every open tab in sync: re-check on load, when the tab regains focus, and every minute,
  // so visitors flip to/from the countdown without reloading when Drop Mode changes.
  useEffect(() => {
    refreshSettings();
    const onFocus = () => document.visibilityState === "visible" && refreshSettings();
    const timer = setInterval(refreshSettings, 60000);
    document.addEventListener("visibilitychange", onFocus);
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onFocus);
      window.removeEventListener("focus", onFocus);
    };
  }, [refreshSettings]);

  // Admins see the countdown like everyone else, and can opt in to previewing the full site
  // for this browser tab. A drop-password holder always sees the site.
  const [adminPreview, setAdminPreviewState] = useState(() => {
    try { return sessionStorage.getItem(PREVIEW_KEY) === "1"; } catch { return false; }
  });
  const setAdminPreview = useCallback((on) => {
    try { on ? sessionStorage.setItem(PREVIEW_KEY, "1") : sessionStorage.removeItem(PREVIEW_KEY); } catch { /* per-tab only */ }
    setAdminPreviewState(on);
  }, []);

  const isAdmin = settings?.access === "admin";
  const dropLive = !!settings?.drop_mode;
  const siteLocked = dropLive && !(settings?.access === "unlocked" || (isAdmin && adminPreview));

  const addToCart = useCallback((item, flyRect = null) => {
    setCart((prev) => {
      const idx = prev.findIndex((l) => l.product_id === item.product_id && l.size === item.size && l.color === item.color);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: Math.min(10, next[idx].qty + item.qty) };
        return next;
      }
      return [...prev, item];
    });
    if (flyRect) {
      window.dispatchEvent(new CustomEvent("morro:fly", { detail: { rect: flyRect, img: item.image } }));
      setTimeout(() => setCartOpen(true), 750);
    } else {
      setCartOpen(true);
    }
  }, []);

  const updateQty = useCallback((index, delta) => {
    setCart((prev) =>
      prev
        .map((l, i) => (i === index ? { ...l, qty: l.qty + delta } : l))
        .filter((l) => l.qty > 0)
    );
  }, []);

  const removeLine = useCallback((index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartCount = cart.reduce((sum, l) => sum + l.qty, 0);
  const subtotal = cart.reduce((sum, l) => sum + l.price * l.qty, 0);

  return (
    <StoreContext.Provider
      value={{
        cart, addToCart, updateQty, removeLine, clearCart, cartCount, subtotal,
        cartOpen, setCartOpen, menuOpen, setMenuOpen,
        searchOpen, setSearchOpen, regionOpen, setRegionOpen, region, setRegion,
        settings, setSettings, refreshSettings, siteLocked, dropLive, isAdmin, adminPreview, setAdminPreview,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}
