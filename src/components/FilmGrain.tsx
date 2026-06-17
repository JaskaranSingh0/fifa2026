"use client";

/**
 * FilmGrain.tsx — global cinematic finish: a faint static film-grain layer plus a
 * soft vignette, both pointer-events:none so they never intercept interaction.
 * Sits below the custom cursor (z 9998) and above page content. Subtle by design —
 * you should feel it, not see it.
 */

// Inline SVG fractal-noise tile (no network request, no extra asset).
const GRAIN =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'>
       <filter id='n'>
         <feTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='2' stitchTiles='stitch'/>
         <feColorMatrix type='saturate' values='0'/>
       </filter>
       <rect width='100%' height='100%' filter='url(#n)'/>
     </svg>`
  );

export default function FilmGrain() {
  return (
    <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 9000, pointerEvents: "none" }}>
      {/* Vignette — pulls focus to the centre */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, transparent 52%, rgba(0,0,0,0.38) 100%)",
        }}
      />
      {/* Grain */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.05,
          mixBlendMode: "soft-light",
          backgroundImage: `url("${GRAIN}")`,
          backgroundSize: "160px 160px",
        }}
      />
    </div>
  );
}
