import { Link } from "react-router-dom";
import { StarPatch } from "@/components/Star";

export default function NotFound() {
  return (
    <div className="px-[20px] text-center" style={{ paddingTop: 160, paddingBottom: 140 }} data-testid="not-found-page">
      <div className="flex justify-center mb-[40px]"><StarPatch size={140} /></div>
      <p className="t-mono-sm mb-[20px]" style={{ color: "var(--muted)" }}>404</p>
      <h1 className="font-display mb-[30px]" style={{ fontSize: "clamp(28px, 5vw, 48px)" }}>
        THIS PAGE IS STILL BECOMING.
      </h1>
      <Link to="/" data-testid="notfound-home-link" className="btn-primary">
        BACK TO THE STORE
      </Link>
    </div>
  );
}
