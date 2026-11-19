import { Link } from "react-router-dom";
import { useStore } from "../lib/store";
import { MenuWatermark } from "./Monogram";

const LINKS = [
  ["Shop all", "/shop"],
  ["Drop 01", "/shop?collection=drop-1"],
  ["Lookbook", "/lookbook"],
  ["About", "/about"],
];

export function MenuDrawer() {
  const { menuOpen, setMenuOpen } = useStore();
  const close = () => setMenuOpen(false);

  return (
    <>
      <div
        data-testid="menu-overlay"
        className={`overlay-fade fixed inset-0 z-40 ${menuOpen ? "open" : ""}`}
        style={{ background: "rgba(0,0,0,0.4)" }}
        onClick={close}
      />
      <aside
        data-testid="menu-drawer"
        className={`drawer-left fixed top-0 left-0 bottom-0 z-50 bg-white flex flex-col overflow-hidden ${menuOpen ? "open" : ""}`}
        style={{ width: "min(420px, 100vw)" }}
      >
        <MenuWatermark />
        <div className="flex items-center justify-between px-[25px] md:px-[40px]" style={{ height: 64, borderBottom: "1px solid var(--ink)" }}>
          <span className="t-mono-sm">MORRO</span>
          <button data-testid="menu-close-button" className="t-mono-sm" style={{ color: "var(--muted)" }} onClick={close}>
            CLOSE
          </button>
        </div>
        <nav className="relative z-[1] flex-1 overflow-y-auto px-[25px] md:px-[40px] py-[30px]" data-lenis-prevent>
          <ul>
            {LINKS.map(([label, to]) => (
              <li key={label}>
                <Link
                  to={to}
                  data-testid={`menu-link-${label.toLowerCase().replace(/\s+/g, "-")}`}
                  className="font-display block"
                  style={{ fontSize: 32, lineHeight: "58px", color: "var(--ink)" }}
                  onClick={close}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="px-[25px] md:px-[40px] py-[20px]" style={{ borderTop: "1px solid var(--hairline)" }}>
          <p className="t-mono-xs" style={{ color: "var(--muted)" }}>[ DROP 01 — OUT NOW ]</p>
        </div>
      </aside>
    </>
  );
}
