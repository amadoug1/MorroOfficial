export function Wordmark({ variant = "black", style = {}, className = "", plain = false }) {
  return (
    <img
      src={variant === "white" ? "/brand/morro-wordmark-white.png" : "/brand/morro-wordmark-black.png"}
      alt="MORRO"
      data-testid="wordmark"
      className={plain ? className : `wordmark-img ${className}`}
      style={style}
    />
  );
}

export function BrandMark({ variant = "black", size = 44, className = "", style = {} }) {
  return (
    <img
      src={variant === "white" ? "/brand/morro-mark-white.png" : "/brand/morro-mark-black.png"}
      alt="MORRO"
      data-testid={`brand-mark-${variant}`}
      className={className}
      style={{ height: size, width: "auto", display: "block", ...style }}
    />
  );
}
