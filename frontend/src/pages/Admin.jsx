import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, useStore, ADMIN_TOKEN_KEY } from "../lib/store";

const EMPTY = {
  name: "", category: "sweatshirts", price: "", description: "", details: "",
  images: "", colors: "", color_hexes: "", sizes: "S,M,L,XL",
  collections: [], sold_out: false,
};
const CATEGORIES = ["tees", "sweatshirts", "sweaters", "pants", "sweatpants", "shorts", "outerwear", "headwear", "accessories"];
const COLLECTIONS = [["drop-1", "DROP 01"], ["drop-2", "DROP 02"], ["new-arrivals", "NEW ARRIVALS"]];

const field = { border: "1px solid var(--ink)", height: 52, padding: "0 15px" };

function SectionTitle({ children }) {
  return <p className="font-display mb-[25px]" style={{ fontSize: 20 }}>{children}</p>;
}

function Toggle({ on, onChange, label, testid }) {
  return (
    <div className="flex items-center justify-between py-[15px]" style={{ borderTop: "1px solid var(--hairline)" }}>
      <span className="t-mono-sm">{label}</span>
      <button
        data-testid={testid}
        onClick={() => onChange(!on)}
        style={{ width: 44, height: 24, border: "1px solid var(--ink)", position: "relative", background: on ? "var(--ink)" : "transparent" }}
      >
        <span style={{ position: "absolute", top: 2, left: on ? 22 : 2, width: 18, height: 18, background: on ? "white" : "var(--ink)", transition: "left 200ms ease" }} />
      </button>
    </div>
  );
}

function DropStatus({ settings }) {
  const expired = settings.drop_mode && !settings.drop_live;
  const text = settings.drop_live
    ? "LIVE — VISITORS SEE THE COUNTDOWN. YOU CAN STILL BROWSE AND EDIT THE FULL SITE WHILE SIGNED IN."
    : expired
      ? "ON, BUT THE DROP TIME HAS PASSED — THE SITE IS PUBLIC. CLEAR OR MOVE THE DROP DATE TO GO LIVE AGAIN."
      : "OFF — THE SITE IS PUBLIC.";
  return (
    <p data-testid="dm-status" className="t-mono-xs py-[12px] px-[15px] mb-[10px]"
      style={{ background: settings.drop_live ? "var(--ink)" : "var(--studio)", color: settings.drop_live ? "white" : "var(--ink)" }}>
      STATUS: {text}
    </p>
  );
}

function DropModePanel({ settings, onSaved }) {
  const { refreshSettings } = useStore();
  const [form, setForm] = useState(settings);
  const [msg, setMsg] = useState("");

  useEffect(() => setForm(settings), [settings]);

  const save = async () => {
    setMsg("");
    try {
      const { data } = await api.put("/settings", form);
      onSaved(data);
      refreshSettings();
      setMsg("SAVED");
    } catch {
      setMsg("SAVE FAILED");
    }
  };

  const setTeaser = (i, key, val) => {
    const teasers = [...(form.teasers || [])];
    while (teasers.length < 4) teasers.push({ number: `00${teasers.length + 1}`, label: "CLASSIFIED", image: "" });
    teasers[i] = { ...teasers[i], [key]: val };
    setForm({ ...form, teasers });
  };

  const setWild = (i, val) => {
    const wild = [...(form.wild_images || ["", "", ""])];
    wild[i] = val;
    setForm({ ...form, wild_images: wild });
  };

  return (
    <div className="max-w-[640px]" data-testid="drop-mode-panel">
      <SectionTitle>DROP MODE</SectionTitle>
      <DropStatus settings={settings} />
      <Toggle on={!!form.drop_mode} onChange={(v) => setForm({ ...form, drop_mode: v })} label="DROP MODE: ON/OFF" testid="drop-mode-toggle" />
      <div className="flex flex-col gap-[15px] mt-[25px]">
        <input data-testid="dm-announcement" placeholder="ANNOUNCEMENT BAR TEXT" className="t-mono-sm bg-transparent outline-none" style={field}
          value={form.announcement_text || ""} onChange={(e) => setForm({ ...form, announcement_text: e.target.value })} />
        <div className="grid grid-cols-2 gap-[15px]">
          <input data-testid="dm-drop-label" placeholder="DROP LABEL (DROP 01)" className="t-mono-sm bg-transparent outline-none" style={field}
            value={form.drop_label || ""} onChange={(e) => setForm({ ...form, drop_label: e.target.value })} />
          <input data-testid="dm-drop-at" type="datetime-local" className="t-mono-sm bg-transparent outline-none" style={field}
            value={form.drop_at ? form.drop_at.slice(0, 16) : ""} onChange={(e) => setForm({ ...form, drop_at: e.target.value ? new Date(e.target.value).toISOString() : "" })} />
        </div>
        <input data-testid="dm-display-date" placeholder="DISPLAY DATE (FRI 05 DEC / 7:00 PM EST)" className="t-mono-sm bg-transparent outline-none" style={field}
          value={form.drop_display_date || ""} onChange={(e) => setForm({ ...form, drop_display_date: e.target.value })} />
        <input data-testid="dm-password" placeholder="EARLY-ACCESS PASSWORD" className="t-mono-sm bg-transparent outline-none" style={field}
          value={form.drop_password || ""} onChange={(e) => setForm({ ...form, drop_password: e.target.value })} />
        <input data-testid="dm-shipping-fee" type="number" step="0.01" min="0" placeholder="FLAT SHIPPING FEE (USD) — LEAVE EMPTY TO CHARGE AT CHECKOUT" className="t-mono-sm bg-transparent outline-none" style={field}
          value={form.shipping_fee ?? ""} onChange={(e) => setForm({ ...form, shipping_fee: e.target.value === "" ? null : parseFloat(e.target.value) })} />

        <p className="t-mono-xs mt-[15px]" style={{ color: "var(--muted)" }}>TEASER TILES (1–4)</p>
        {[0, 1, 2, 3].map((i) => {
          const t = (form.teasers || [])[i] || { number: `00${i + 1}`, label: "", image: "" };
          return (
            <div key={i} className="grid grid-cols-[80px_1fr_1fr] gap-[10px] items-center">
              <input data-testid={`dm-teaser-number-${i}`} placeholder="001" className="t-mono-sm bg-transparent outline-none" style={field}
                value={t.number} onChange={(e) => setTeaser(i, "number", e.target.value)} />
              <input data-testid={`dm-teaser-label-${i}`} placeholder="LABEL (SOON / CLASSIFIED)" className="t-mono-sm bg-transparent outline-none" style={field}
                value={t.label} onChange={(e) => setTeaser(i, "label", e.target.value)} />
              <input data-testid={`dm-teaser-image-${i}`} placeholder="IMAGE URL (SHOWN BLURRED)" className="t-mono-sm bg-transparent outline-none" style={field}
                value={t.image} onChange={(e) => setTeaser(i, "image", e.target.value)} />
            </div>
          );
        })}

        <p className="t-mono-xs mt-[15px]" style={{ color: "var(--muted)" }}>IN THE WILD IMAGES (HOMEPAGE, 1–3)</p>
        {[0, 1, 2].map((i) => (
          <input key={i} data-testid={`dm-wild-${i}`} placeholder={`LIFESTYLE PHOTO ${String(i + 1).padStart(2, "0")} URL`} className="t-mono-sm bg-transparent outline-none" style={field}
            value={(form.wild_images || [])[i] || ""} onChange={(e) => setWild(i, e.target.value)} />
        ))}

        {msg && <p className="t-mono-xs" data-testid="dm-save-msg">{msg}</p>}
        <button data-testid="dm-save" className="btn-primary" onClick={save}>SAVE SETTINGS</button>
      </div>
    </div>
  );
}

export default function Admin() {
  const [auth, setAuth] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [settings, setSettings] = useState(null);
  const [tab, setTab] = useState("products");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { refreshSettings } = useStore();

  const load = async () => {
    try {
      const [{ data: prods }, { data: ords }, { data: st }] = await Promise.all([
        api.get("/products"),
        api.get("/orders").catch(() => ({ data: [] })),
        api.get("/admin/settings").catch(() => ({ data: {} })),
      ]);
      setProducts(prods);
      setOrders(ords);
      setSettings(st);
    } catch { /* handled below */ }
  };

  useEffect(() => {
    api.get("/auth/me")
      .then(({ data }) => { setAuth(data); load(); })
      .catch(() => navigate("/account"));
  }, [navigate]);

  if (!auth || !settings) return <div style={{ paddingTop: 120 }} data-testid="admin-loading" />;

  const startEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name, category: p.category, price: p.price, description: p.description || "",
      details: (p.details || []).join("\n"), images: (p.images || []).join("\n"),
      colors: (p.colors || []).join(", "), color_hexes: (p.color_hexes || []).join(", "),
      sizes: (p.sizes || []).join(","), collections: p.collections || [], sold_out: p.sold_out,
    });
    setTab("edit");
  };

  const save = async (e) => {
    e.preventDefault();
    setError("");
    const payload = {
      name: form.name, category: form.category, price: parseFloat(form.price) || 0,
      description: form.description,
      details: form.details.split("\n").map((s) => s.trim()).filter(Boolean),
      images: form.images.split("\n").map((s) => s.trim()).filter(Boolean),
      colors: form.colors.split(",").map((s) => s.trim()).filter(Boolean),
      color_hexes: form.color_hexes.split(",").map((s) => s.trim()).filter(Boolean),
      sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
      collections: form.collections, sold_out: form.sold_out,
    };
    try {
      if (editing) {
        await api.put(`/products/${editing.id}`, payload);
      } else {
        await api.post("/products", payload);
      }
      setEditing(null);
      setForm(EMPTY);
      setTab("products");
      load();
    } catch (err) {
      setError(typeof err.response?.data?.detail === "string" ? err.response.data.detail : "SAVE FAILED");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Remove this product?")) return;
    await api.delete(`/products/${id}`);
    load();
  };

  const logout = async () => {
    await api.post("/auth/logout").catch(() => {});
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    await refreshSettings();
    navigate("/account");
  };

  const toggleCollection = (c) => {
    setForm((f) => ({
      ...f,
      collections: f.collections.includes(c) ? f.collections.filter((x) => x !== c) : [...f.collections, c],
    }));
  };

  return (
    <div className="px-[20px] md:px-[40px] pt-[40px] pb-[80px]" data-testid="admin-page">
      <div className="flex items-baseline justify-between pb-[15px] mb-[40px]" style={{ borderBottom: "1px solid var(--ink)" }}>
        <h1 className="font-display" style={{ fontSize: 32 }}>STUDIO</h1>
        <div className="flex gap-[25px]">
          <button data-testid="admin-tab-products" className="t-mono-sm" style={{ color: tab !== "orders" && tab !== "dropmode" ? "var(--ink)" : "var(--muted)" }} onClick={() => { setTab("products"); setEditing(null); }}>PRODUCTS</button>
          <button data-testid="admin-tab-orders" className="t-mono-sm" style={{ color: tab === "orders" ? "var(--ink)" : "var(--muted)" }} onClick={() => setTab("orders")}>ORDERS</button>
          <button data-testid="admin-tab-dropmode" className="t-mono-sm" style={{ color: tab === "dropmode" ? "var(--ink)" : "var(--muted)" }} onClick={() => setTab("dropmode")}>DROP MODE</button>
          <button data-testid="admin-logout" className="t-mono-sm" style={{ color: "var(--muted)" }} onClick={logout}>SIGN OUT</button>
        </div>
      </div>

      {tab === "dropmode" && <DropModePanel settings={settings} onSaved={setSettings} />}

      {tab === "products" && (
        <>
          <button data-testid="admin-new-product" className="btn-secondary mb-[30px]" style={{ height: 44, fontSize: 12 }}
            onClick={() => { setEditing(null); setForm(EMPTY); setTab("edit"); }}>
            + ADD PRODUCT
          </button>
          <div>
            {products.map((p) => (
              <div key={p.id} className="flex items-center gap-[15px] py-[15px]" style={{ borderTop: "1px solid var(--hairline)" }} data-testid={`admin-product-${p.slug}`}>
                <div style={{ width: 45, height: 56, background: "var(--flatlay)" }} className="shrink-0">
                  {p.images[0] && <img src={p.images[0]} alt="" className="w-full h-full object-cover" loading="lazy" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="t-mono-sm truncate">{p.name}{p.sold_out && <span style={{ color: "var(--muted)" }}> — SOLD OUT</span>}</p>
                  <p className="t-mono-xs" style={{ color: "var(--muted)" }}>{p.category} · ${p.price.toFixed(2)} · {(p.collections || []).join(", ") || "no collection"}</p>
                </div>
                <button data-testid={`admin-edit-${p.slug}`} className="t-mono-xs shrink-0" onClick={() => startEdit(p)}>EDIT</button>
                <button data-testid={`admin-delete-${p.slug}`} className="t-mono-xs shrink-0" style={{ color: "var(--muted)" }} onClick={() => remove(p.id)}>REMOVE</button>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "orders" && (
        <div>
          {orders.length === 0 && <p className="t-body" style={{ color: "var(--muted)" }} data-testid="orders-empty">No orders yet.</p>}
          {orders.map((o) => (
            <div key={o.id} className="py-[15px]" style={{ borderTop: "1px solid var(--hairline)" }} data-testid={`order-${o.id}`}>
              <div className="flex justify-between">
                <span className="t-mono-sm">${o.amount?.toFixed(2)} USD — {o.payment_status?.toUpperCase()}</span>
                <span className="t-mono-xs" style={{ color: "var(--muted)" }}>{new Date(o.created_at).toLocaleDateString()}</span>
              </div>
              <p className="t-mono-xs mt-[5px]" style={{ color: "var(--muted)" }}>
                {(o.items || []).map((i) => `${i.name} (${i.size}) x${i.qty}`).join(" · ")}
              </p>
            </div>
          ))}
        </div>
      )}

      {tab === "edit" && (
        <form onSubmit={save} className="max-w-[560px] flex flex-col gap-[15px]" data-testid="product-form">
          <SectionTitle>{editing ? "EDIT PRODUCT" : "NEW PRODUCT"}</SectionTitle>
          <input data-testid="form-name" required placeholder="PRODUCT NAME" className="t-mono-sm bg-transparent outline-none" style={field}
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <div className="grid grid-cols-2 gap-[15px]">
            <select data-testid="form-category" className="t-mono-sm bg-white outline-none" style={field}
              value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c.toUpperCase()}</option>)}
            </select>
            <input data-testid="form-price" required type="number" step="0.01" min="0" placeholder="PRICE (USD)" className="t-mono-sm bg-transparent outline-none" style={field}
              value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </div>
          <textarea data-testid="form-description" placeholder="DESCRIPTION" className="t-mono-sm bg-transparent outline-none pt-[15px]" style={{ ...field, height: 90 }}
            value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <textarea data-testid="form-details" placeholder="DETAILS — ONE PER LINE" className="t-mono-sm bg-transparent outline-none pt-[15px]" style={{ ...field, height: 110 }}
            value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} />
          <textarea data-testid="form-images" required placeholder="IMAGE URLS — ONE PER LINE" className="t-mono-sm bg-transparent outline-none pt-[15px]" style={{ ...field, height: 110 }}
            value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} />
          <div className="grid grid-cols-2 gap-[15px]">
            <input data-testid="form-colors" placeholder="COLORS — COMMA SEPARATED" className="t-mono-sm bg-transparent outline-none" style={field}
              value={form.colors} onChange={(e) => setForm({ ...form, colors: e.target.value })} />
            <input data-testid="form-color-hexes" placeholder="COLOR HEX CODES — COMMA SEPARATED" className="t-mono-sm bg-transparent outline-none" style={field}
              value={form.color_hexes} onChange={(e) => setForm({ ...form, color_hexes: e.target.value })} />
          </div>
          <input data-testid="form-sizes" placeholder="SIZES — COMMA SEPARATED (S,M,L,XL)" className="t-mono-sm bg-transparent outline-none" style={field}
            value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} />
          <div className="flex flex-wrap gap-[20px] items-center">
            {COLLECTIONS.map(([key, label]) => (
              <label key={key} className="t-mono-xs flex items-center gap-[8px] cursor-pointer" data-testid={`form-collection-${key}`}>
                <input type="checkbox" checked={form.collections.includes(key)} onChange={() => toggleCollection(key)} style={{ accentColor: "#111" }} />
                {label}
              </label>
            ))}
            <label className="t-mono-xs flex items-center gap-[8px] cursor-pointer" data-testid="form-sold-out">
              <input type="checkbox" checked={form.sold_out} onChange={(e) => setForm({ ...form, sold_out: e.target.checked })} style={{ accentColor: "#111" }} />
              SOLD OUT
            </label>
          </div>
          {error && <p className="t-mono-xs" data-testid="form-error">{error}</p>}
          <div className="flex gap-[15px]">
            <button data-testid="form-save" type="submit" className="btn-primary flex-1">
              {editing ? "SAVE CHANGES" : "CREATE PRODUCT"}
            </button>
            <button data-testid="form-cancel" type="button" className="btn-secondary flex-1"
              onClick={() => { setTab("products"); setEditing(null); }}>
              CANCEL
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
