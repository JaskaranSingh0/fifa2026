import type { Metadata, Viewport } from "next";
import "./globals.css";
import SiteNav from "@/components/SiteNav";
import CustomCursor from "@/components/CustomCursor";
import FilmGrain from "@/components/FilmGrain";
import MusicProvider from "@/components/music/MusicProvider";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#050505",
};

export const metadata: Metadata = {
  title: "FIFA World Cup 2026 | Enter the Football Universe",
  description:
    "An immersive interactive experience for the FIFA World Cup 2026. Explore matches, teams, stadiums, groups, and the bracket.",
  keywords: ["FIFA World Cup 2026", "football", "soccer", "interactive", "teams", "matches"],
  authors: [{ name: "FIFA World Cup 2026" }],
  openGraph: {
    title: "FIFA World Cup 2026 | Enter the Football Universe",
    description: "Welcome to the World of Football — an immersive interactive experience.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "FIFA World Cup 2026",
    description: "Welcome to the World of Football.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className="antialiased"
        style={{ 
          background: "#050505", 
          margin: 0, 
          padding: 0,
          "--font-inter": "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        } as React.CSSProperties}
        suppressHydrationWarning
      >
        <MusicProvider>
          <CustomCursor />
          <FilmGrain />
          <SiteNav />
          {children}
        </MusicProvider>
      </body>
    </html>
  );
}
