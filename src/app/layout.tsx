import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SiteNav from "@/components/SiteNav";
import CustomCursor from "@/components/CustomCursor";
import FilmGrain from "@/components/FilmGrain";
import MusicProvider from "@/components/music/MusicProvider";

// Inter: self-hosted via next/font (zero CLS, no FOIT) — the typeface the whole
// design assumes. Exposed as the `--font-inter` CSS variable that components
// already reference.
const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});

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
    <html lang="en" className={inter.variable}>
      <body
        className="antialiased"
        style={{
          background: "#050505",
          margin: 0,
          padding: 0,
        }}
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
