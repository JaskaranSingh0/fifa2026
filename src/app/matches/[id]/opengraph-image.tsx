import { ImageResponse } from "next/og";
import { MATCHES } from "@/lib/data/matches";
import { TEAMS } from "@/lib/data/teams";
import { getTeamBranding } from "@/lib/data/team-branding";
import { slotLabel, isRealTeam } from "@/lib/bracket";
import { prisma } from "@/lib/prisma";

const TEAM_BY_NAME = new Map(Object.values(TEAMS).map((t) => [t.name, t]));

// Per-match share card — every shared link becomes a matchup poster. 1200×630.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const STAGE_LABELS: Record<string, string> = {
  GROUP_STAGE: "GROUP STAGE",
  ROUND_OF_32: "ROUND OF 32",
  ROUND_OF_16: "ROUND OF 16",
  QUARTER_FINALS: "QUARTER-FINAL",
  SEMI_FINALS: "SEMI-FINAL",
  THIRD_PLACE: "THIRD PLACE",
  FINAL: "THE FINAL",
};

export const alt = "FIFA World Cup 2026 match";

export default async function OpengraphImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const match = MATCHES.find((m) => m.id === id);

  if (!match) {
    return new ImageResponse(
      (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#050505", color: "#fff", fontSize: 120, fontWeight: 900 }}>
          2026
        </div>
      ),
      { ...size }
    );
  }

  // Prefer live data: the sync writes real teams into knockout slots and final
  // scores as results land — a shared link should show the real matchup.
  let home = match.home;
  let away = match.away;
  let scoreLine: string | null = null;
  try {
    const db = await prisma.match.findUnique({ where: { id } });
    if (db) {
      home = TEAM_BY_NAME.get(db.homeTeam) ?? home;
      away = TEAM_BY_NAME.get(db.awayTeam) ?? away;
      if (db.status === "FINISHED") {
        scoreLine = `${db.homeScore} — ${db.awayScore}`;
      }
    }
  } catch { /* fall back to the seeded fixture */ }

  const homeReal = isRealTeam(home.code);
  const awayReal = isRealTeam(away.code);
  const homeName = homeReal ? home.name : slotLabel(home.code);
  const awayName = awayReal ? away.name : slotLabel(away.code);
  const homeColor = homeReal ? getTeamBranding(home.code).primary : "#00D1FF";
  const awayColor = awayReal ? getTeamBranding(away.code).primary : "#00D1FF";
  const stage = match.group?.toUpperCase() ?? STAGE_LABELS[match.stage] ?? String(match.stage);
  const dateLabel = new Date(`${match.date}T12:00:00`)
    .toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    .toUpperCase();

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
        {/* team-colour glows, mirroring the match page */}
        <div style={{ position: "absolute", left: -320, top: -80, width: 800, height: 800, display: "flex", background: `radial-gradient(circle at center, ${homeColor}2e 0%, transparent 65%)` }} />
        <div style={{ position: "absolute", right: -320, bottom: -80, width: 800, height: 800, display: "flex", background: `radial-gradient(circle at center, ${awayColor}2e 0%, transparent 65%)` }} />

        <div style={{ display: "flex", fontSize: 26, letterSpacing: 14, color: "rgba(255,255,255,0.5)" }}>
          FIFA WORLD CUP 2026 · {stage}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 60, marginTop: 46 }}>
          <div style={{ display: "flex", maxWidth: 430, fontSize: homeName.length > 12 ? 62 : 84, fontWeight: 900, color: "#ffffff", textTransform: "uppercase", lineHeight: 1, textAlign: "right", justifyContent: "flex-end" }}>
            {homeName}
          </div>
          <div style={{ display: "flex", fontSize: scoreLine ? 64 : 40, color: scoreLine ? "#ffffff" : "rgba(255,255,255,0.35)", fontWeight: scoreLine ? 900 : 300, whiteSpace: "nowrap" }}>
            {scoreLine ?? "vs"}
          </div>
          <div style={{ display: "flex", maxWidth: 430, fontSize: awayName.length > 12 ? 62 : 84, fontWeight: 900, color: "#ffffff", textTransform: "uppercase", lineHeight: 1 }}>
            {awayName}
          </div>
        </div>

        <div style={{ display: "flex", width: 90, height: 3, background: "#00D1FF", marginTop: 52, marginBottom: 34 }} />

        <div style={{ display: "flex", fontSize: 24, letterSpacing: 10, color: "rgba(255,255,255,0.6)" }}>
          {dateLabel} · {match.stadium.toUpperCase()}
        </div>
      </div>
    ),
    { ...size }
  );
}
