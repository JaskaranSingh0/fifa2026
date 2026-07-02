// api/matches/route.ts — Serves match data merged with live scores.
// Client components poll this endpoint for updates.

import { NextResponse, after } from "next/server";
import { MATCHES, MatchStatus } from "@/lib/data/matches";
import { TEAMS } from "@/lib/data/teams";
import { prisma } from "@/lib/prisma";
import { syncIfStale } from "@/lib/match-sync";
export const dynamic = "force-dynamic"; // Never cache — always serve fresh data

// Real team name → full team data. The sync writes real teams into knockout slots
// once the bracket is set; the static fixture still holds the "1A"/"W73" placeholder.
const TEAM_BY_NAME = new Map(Object.values(TEAMS).map((t) => [t.name, t]));

export interface MatchWithScore {
  id: string;
  stage: string;
  group?: string;
  matchNumber: number;
  date: string;
  time: string;
  stadium: string;
  city: string;
  country: string;
  home: { code: string; name: string; flag: string; colors: [string, string] };
  away: { code: string; name: string; flag: string; colors: [string, string] };
  status: MatchStatus;
  homeScore?: number;
  awayScore?: number;
  /** Shootout result, once (or while) the match goes to penalties */
  penaltyScore?: [number, number];
  /** "REGULAR" | "EXTRA_TIME" | "PENALTY_SHOOTOUT" */
  duration?: string;
  liveData?: {
    currentMinute: number;
    isExtraTime: boolean;
    isPenalties: boolean;
    penaltyScore?: [number, number];
  };
}

export async function GET() {
  try {
    // Refresh the DB AFTER responding — never block the page on the upstream
    // ESPN/football-data round-trip. The seeded matches are returned instantly;
    // synced scores/status land on the next poll (throttled to ~30s).
    after(async () => { await syncIfStale(); });

    const dbMatches = await prisma.match.findMany();

    const merged = MATCHES.map((match) => {
      // First try to match by exact ID
      let dbMatch = dbMatches.find(m => m.id === match.id);
      
      // Fallback: match by team names (useful for external APIs that create custom IDs)
      if (!dbMatch) {
        dbMatch = dbMatches.find(m => m.homeTeam === match.home.name && m.awayTeam === match.away.name);
      }

      if (dbMatch) {
        // Prefer the real teams the sync wrote into knockout slots over the placeholder.
        const dbHome = dbMatch.homeTeam !== match.home.name ? TEAM_BY_NAME.get(dbMatch.homeTeam) : undefined;
        const dbAway = dbMatch.awayTeam !== match.away.name ? TEAM_BY_NAME.get(dbMatch.awayTeam) : undefined;
        const pens: [number, number] | undefined =
          dbMatch.homePens != null && dbMatch.awayPens != null
            ? [dbMatch.homePens, dbMatch.awayPens]
            : undefined;
        return {
          ...match,
          home: dbHome ?? match.home,
          away: dbAway ?? match.away,
          status: dbMatch.status as MatchStatus,
          homeScore: dbMatch.homeScore,
          awayScore: dbMatch.awayScore,
          penaltyScore: pens,
          duration: dbMatch.duration,
          liveData: dbMatch.status === "LIVE" ? {
            currentMinute: dbMatch.minute,
            isExtraTime: dbMatch.duration === "EXTRA_TIME",
            isPenalties: dbMatch.duration === "PENALTY_SHOOTOUT",
            penaltyScore: pens
          } : match.liveData
        };
      }

      return match;
    });

    return NextResponse.json(
      { matches: merged, updatedAt: new Date().toISOString() },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching matches:", error);
    return NextResponse.json(
      { matches: MATCHES, updatedAt: new Date().toISOString() },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  }
}
