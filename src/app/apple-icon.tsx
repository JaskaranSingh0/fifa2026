import { ImageResponse } from "next/og";

// iOS home-screen icon.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
        }}
      >
        <div style={{ display: "flex", fontSize: 30, letterSpacing: 4, color: "rgba(255,255,255,0.55)" }}>
          WC
        </div>
        <div style={{ display: "flex", fontSize: 92, fontWeight: 800, color: "#00D1FF", lineHeight: 1 }}>
          26
        </div>
      </div>
    ),
    { ...size }
  );
}
