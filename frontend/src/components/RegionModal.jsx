import { useState } from "react";
import { useStore } from "../lib/store";
import { BrandMark } from "./Logo";

const REGIONS = ["United States (USD)", "United Kingdom (GBP)", "European Union (EUR)", "Canada (CAD)", "Japan (JPY)", "Australia (AUD)"];

export function RegionModal() {
  const { regionOpen, setRegionOpen, region, setRegion } = useStore();
  const [value, setValue] = useState(region);

  if (!regionOpen) return null;

  return (
    <div
      data-testid="region-modal-overlay"
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center px-[20px]"
      style={{ background: "rgba(0,0,0,0.9)" }}
      onClick={() => setRegionOpen(false)}
    >
      <BrandMark variant="white" size={36} className="mb-[25px]" />
      <div
        data-testid="region-modal"
        className="bg-white w-full max-w-[380px] p-[30px]"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="t-mono-md mb-[25px]">UPDATE YOUR COUNTRY/REGION?</p>
        <select
          data-testid="region-select"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full t-body bg-white outline-none px-[10px] mb-[20px]"
          style={{ border: "1px solid var(--ink)", height: 52 }}
        >
          {REGIONS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <button
          data-testid="region-save-button"
          className="btn-secondary w-full"
          onClick={() => { setRegion(value); setRegionOpen(false); }}
        >
          SAVE
        </button>
      </div>
    </div>
  );
}
