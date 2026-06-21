import { ImageResponse } from "next/og";

// Favicon — generated at build. Cyan "26" on the signature near-black.
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#050505",
          color: "#00D1FF",
          fontSize: 19,
          fontWeight: 800,
        }}
      >
        26
      </div>
    ),
    { ...size }
  );
}
