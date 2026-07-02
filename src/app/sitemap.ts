import type { MetadataRoute } from "next";
import { MATCHES } from "@/lib/data/matches";

const BASE = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "https://wc26-universe.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const sections: MetadataRoute.Sitemap = [
    { url: BASE, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/matches`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE}/teams`, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/bracket`, changeFrequency: "hourly", priority: 0.8 },
    { url: `${BASE}/groups`, changeFrequency: "daily", priority: 0.7 },
    { url: `${BASE}/stadiums`, changeFrequency: "monthly", priority: 0.6 },
  ];

  const matches: MetadataRoute.Sitemap = MATCHES.map((m) => ({
    url: `${BASE}/matches/${m.id}`,
    changeFrequency: "hourly" as const,
    priority: 0.5,
  }));

  return [...sections, ...matches];
}
