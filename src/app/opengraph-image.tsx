import { ImageResponse } from "next/og";

// Social share card (also used for Twitter/X). 1200×630.
export const alt = "FIFA World Cup 2026 — Enter the Football Universe";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#050505",
          position: "relative",
        }}
      >
        {/* planetary glow */}
        <div
          style={{
            position: "absolute",
            bottom: -260,
            width: 1500,
            height: 760,
            display: "flex",
            background:
              "radial-gradient(ellipse at center, rgba(0,209,255,0.28) 0%, rgba(0,201,167,0.10) 40%, transparent 70%)",
          }}
        />
        <div style={{ display: "flex", fontSize: 34, letterSpacing: 18, color: "rgba(255,255,255,0.55)" }}>
          FIFA WORLD CUP
        </div>
        <div style={{ display: "flex", fontSize: 240, fontWeight: 900, color: "#ffffff", lineHeight: 1 }}>
          2026
        </div>
        <div style={{ display: "flex", width: 90, height: 3, background: "#00D1FF", marginTop: 30, marginBottom: 30 }} />
        <div style={{ display: "flex", fontSize: 30, letterSpacing: 12, color: "rgba(255,255,255,0.65)" }}>
          48 NATIONS · ONE DREAM
        </div>
      </div>
    ),
    { ...size }
  );
}
