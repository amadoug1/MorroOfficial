// Brand photos ship in three widths: name-640.jpg, name-960.jpg, name.jpg (1320).
// srcSet() lets the browser pick the smallest file that's still sharp for the screen.
const BRAND_JPG = /^\/brand\/[\w-]+\.jpg$/;

export function srcSet(src) {
  if (!src || !BRAND_JPG.test(src)) return undefined;
  const base = src.slice(0, -4);
  return `${base}-640.jpg 640w, ${base}-960.jpg 960w, ${src} 1320w`;
}

// Smallest variant, for thumbnails.
export function thumb(src) {
  return src && BRAND_JPG.test(src) ? `${src.slice(0, -4)}-640.jpg` : src;
}
