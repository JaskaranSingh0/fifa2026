import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FIFA World Cup 2026 — Football Universe",
    short_name: "WC 2026",
    description:
      "An immersive interactive experience for the FIFA World Cup 2026 — matches, teams, stadiums, groups, and the bracket.",
    start_url: "/",
    display: "standalone",
    background_color: "#050505",
    theme_color: "#050505",
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
