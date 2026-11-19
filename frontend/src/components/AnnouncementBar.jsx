import { Link } from "react-router-dom";
import { useStore } from "../lib/store";

export function AnnouncementBar() {
  const { settings } = useStore();
  const text = settings?.announcement_text || "DROP 01 — OUT NOW · JOIN THE LIST FOR DROP 02";
  return (
    <div
      data-testid="announcement-bar"
      className="t-mono-sm text-center text-white"
      style={{ background: "var(--black)", height: 36, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 15px" }}
    >
      <Link to="/shop" data-testid="announcement-link" className="text-white no-underline">{text}</Link>
    </div>
  );
}
