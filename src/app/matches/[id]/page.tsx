import type { Metadata } from "next";
import Link from "next/link";
import { MATCHES } from "@/lib/matches-data";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const match = MATCHES.find((m) => m.id === id);
  if (!match) return { title: "Match Not Found | FIFA World Cup 2026" };
  return {
    title: `${match.home.code} vs ${match.away.code} | FIFA World Cup 2026`,
    description: `${match.home.name} vs ${match.away.name} — ${match.stadium}, ${match.city}. ${match.date} ${match.time}.`,
  };
}

export function generateStaticParams() {
  return MATCHES.map((m) => ({ id: m.id }));
}

export default async function MatchDetailPage({ params }: Props) {
  const { id } = await params;
  const match = MATCHES.find((m) => m.id === id);

  if (!match) {
    return (
      <main className="fixed inset-0 bg-[#050505] flex items-center justify-center">
        <div className="text-center">
          <p style={{ fontSize: "0.7rem", letterSpacing: "0.18em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase" }}>
            Match not found
          </p>
          <Link
            href="/matches"
            style={{ fontSize: "0.6rem", letterSpacing: "0.14em", color: "rgba(0,209,255,0.6)", textTransform: "uppercase", textDecoration: "none", display: "block", marginTop: "1rem" }}
          >
            ← Back to Matches
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main
      className="fixed inset-0 bg-[#050505] flex flex-col items-center justify-center overflow-hidden"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Back */}
      <div className="absolute top-6 left-6 md:top-8 md:left-8 z-10">
        <Link
          href="/matches"
          style={{ fontSize: "0.65rem", letterSpacing: "0.14em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", textDecoration: "none" }}
          aria-label="Back to matches"
        >
          ← Matches
        </Link>
      </div>

      {/* Stage */}
      <p style={{ fontSize: "0.6rem", letterSpacing: "0.2em", color: "rgba(0,209,255,0.7)", textTransform: "uppercase", marginBottom: "2rem" }}>
        {match.group ?? match.stage.replace(/_/g, " ")}
      </p>

      {/* Teams */}
      <div className="flex items-center gap-8 md:gap-16">
        <div className="flex flex-col items-center gap-3">
          <span style={{ fontSize: "4rem", lineHeight: 1 }}>{match.home.flag}</span>
          <span style={{ fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" }}>
            {match.home.code}
          </span>
        </div>

        <div className="flex flex-col items-center gap-1">
          {match.homeScore !== undefined && match.awayScore !== undefined ? (
            <span style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)", fontWeight: 800, letterSpacing: "0.04em" }}>
              {match.homeScore} — {match.awayScore}
            </span>
          ) : (
            <span style={{ fontSize: "clamp(1rem, 2vw, 1.4rem)", fontWeight: 300, letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)" }}>
              {match.time}
            </span>
          )}
          <span style={{ fontSize: "0.55rem", letterSpacing: "0.14em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase" }}>
            {match.status}
          </span>
        </div>

        <div className="flex flex-col items-center gap-3">
          <span style={{ fontSize: "4rem", lineHeight: 1 }}>{match.away.flag}</span>
          <span style={{ fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" }}>
            {match.away.code}
          </span>
        </div>
      </div>

      {/* Venue */}
      <div className="flex flex-col items-center gap-1 mt-10">
        <p style={{ fontSize: "0.65rem", letterSpacing: "0.14em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>
          {match.stadium}
        </p>
        <p style={{ fontSize: "0.6rem", letterSpacing: "0.1em", color: "rgba(255,255,255,0.18)" }}>
          {match.city} · {match.date} · {match.time}
        </p>
      </div>

      {/* Coming soon */}
      <div
        className="absolute bottom-10"
        style={{ fontSize: "0.55rem", letterSpacing: "0.16em", color: "rgba(255,255,255,0.12)", textTransform: "uppercase" }}
      >
        Lineups · Statistics · Timeline — Coming Soon
      </div>
    </main>
  );
}
