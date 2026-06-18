// api/matches/route.ts — Serves match data merged with live scores.
// Client components poll this endpoint for updates.

import { NextResponse } from "next/server";
import { MATCHES, MatchStatus } from "@/lib/data/matches";
import { prisma } from "@/lib/prisma";
import { syncIfStale } from "@/lib/match-sync";
export const dynamic = "force-dynamic"; // Never cache — always serve fresh data

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
  liveData?: {
    currentMinute: number;
    isExtraTime: boolean;
    isPenalties: boolean;
    penaltyScore?: [number, number];
  };
}

export async function GET() {
  try {
    // Keep the DB fresh on any match-data load (throttled to ~30s).
    await syncIfStale();

    const dbMatches = await prisma.match.findMany();

    const merged = MATCHES.map((match) => {
      // First try to match by exact ID
      let dbMatch = dbMatches.find(m => m.id === match.id);
      
      // Fallback: match by team names (useful for external APIs that create custom IDs)
      if (!dbMatch) {
        dbMatch = dbMatches.find(m => m.homeTeam === match.home.name && m.awayTeam === match.away.name);
      }

      if (dbMatch) {
        return {
          ...match,
          status: dbMatch.status as MatchStatus,
          homeScore: dbMatch.homeScore,
          awayScore: dbMatch.awayScore,
          liveData: dbMatch.status === "LIVE" ? {
            currentMinute: dbMatch.minute,
            isExtraTime: false,
            isPenalties: false
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
