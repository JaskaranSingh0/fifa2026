import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className="antialiased overflow-hidden"
        style={{ background: "#050505", margin: 0, padding: 0 }}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
