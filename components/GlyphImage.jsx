export function GlyphImage({ src, glyph, label, className = "", imageClassName = "" }) {
  if (typeof src === "string" && src.startsWith("/")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- Asset PNG Noto dari katalog lokal perlu dirender apa adanya.
      <img
        src={src}
        alt={`Aksara ${label || glyph || ""}`.trim()}
        className={imageClassName || className}
        loading="lazy"
      />
    );
  }

  return <span className={className}>{glyph}</span>;
}
