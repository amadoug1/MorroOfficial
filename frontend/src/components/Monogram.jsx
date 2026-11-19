const M_PATH =
  "M122.0 392.5 L120.0 392.6 L119.7 391.0 L156.4 230.0 L160.8 206.0 L160.3 194.0 L157.2 185.0 L153.4 179.0 L149.0 174.3 L143.0 169.7 L136.0 166.4 L134.6 165.0 L134.6 163.0 L145.0 161.8 L207.0 161.9 L209.5 164.0 L287.2 306.0 L284.9 308.0 L235.0 329.6 L219.6 304.0 L187.4 246.0 L181.3 236.0 L180.0 235.8 L172.6 269.0 L152.5 373.0 L122.0 392.5 Z  M319.0 295.2 L317.0 295.2 L316.7 294.0 L318.9 289.0 L383.3 163.0 L385.0 162.2 L397.0 161.8 L424.0 161.8 L453.0 161.8 L456.0 163.0 L456.4 164.0 L455.0 166.3 L447.1 170.0 L440.9 175.0 L434.8 184.0 L431.6 193.0 L430.6 200.0 L430.7 210.0 L438.2 260.0 L437.5 261.0 L384.0 273.8 L382.7 271.0 L377.4 233.0 L376.0 232.1 L349.5 284.0 L319.0 295.2 Z  M204.0 437.0 L91.0 437.3 L89.4 436.0 L105.0 423.6 L133.0 403.8 L181.0 373.8 L227.0 348.7 L281.0 323.7 L310.1 312.0 L345.0 299.7 L387.0 286.6 L420.0 277.8 L481.0 266.7 L502.0 263.7 L508.0 263.2 L509.8 264.0 L447.0 283.7 L395.0 302.7 L336.0 327.7 L294.0 347.9 L260.1 366.0 L230.0 383.7 L205.0 399.8 L184.1 415.0 L183.1 417.0 L185.0 417.7 L204.0 417.5 L216.0 414.2 L258.0 392.4 L328.0 353.8 L351.0 341.7 L353.0 342.0 L287.0 391.5 L249.0 418.2 L224.0 432.2 L215.0 435.3 L204.0 437.0 Z  M489.0 433.2 L377.0 432.9 L376.2 431.0 L377.2 429.0 L388.0 425.1 L395.6 419.0 L400.4 410.0 L402.3 402.0 L401.1 385.0 L391.7 325.0 L391.7 322.0 L393.0 320.3 L440.0 300.9 L442.0 301.4 L455.6 386.0 L459.6 403.0 L462.7 410.0 L467.7 417.0 L477.0 424.4 L489.0 429.4 L490.3 431.0 L489.0 433.2 Z";

export function MOnly({ color = "currentColor", size = 54, className = "", style = {} }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 600 600"
      width={size}
      height={size}
      aria-hidden
      className={className}
      data-testid="m-only"
      style={{ display: "block", color, ...style }}
    >
      <path fill="currentColor" fillRule="evenodd" d={M_PATH} />
    </svg>
  );
}

/* Tiled monogram background */
export function MonogramField({ opacity = 0.06 }) {
  return (
    <div
      aria-hidden
      className="monogram-field absolute pointer-events-none"
      style={{
        inset: -60,
        backgroundImage: "url('/brand/morro-mark-white.png')",
        backgroundSize: "72px 72px",
        backgroundRepeat: "space",
        opacity,
        animation: "monogramDrift 40s linear infinite",
      }}
    />
  );
}

/* Menu drawer watermark */
export function MenuWatermark() {
  return (
    <img
      src="/brand/morro-mark-black.png"
      alt=""
      aria-hidden
      className="menu-watermark absolute pointer-events-none"
      style={{
        width: 260,
        height: 260,
        right: -70,
        bottom: -70,
        opacity: 0.07,
        animation: "menuWatermarkSpin 60s linear infinite",
      }}
    />
  );
}
