// api/matches/route.ts — Serves match data merged with live scores.
// Client components poll this endpoint for updates.

import { NextResponse } from "next/server";
import { MATCHES, Match, MatchStatus } from "@/lib/data/matches";
import { LIVE_SCORES } from "@/lib/data/live-scores";

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

function mergeMatch(match: Match): MatchWithScore {
  const live = LIVE_SCORES[match.id];
  return {
    id: match.id,
    stage: match.stage,
    group: match.group,
    matchNumber: match.matchNumber,
    date: match.date,
    time: match.time,
    stadium: match.stadium,
    city: match.city,
    country: match.country,
    home: {
      code: match.home.code,
      name: match.home.name,
      flag: match.home.flag,
      colors: match.home.colors,
    },
    away: {
      code: match.away.code,
      name: match.away.name,
      flag: match.away.flag,
      colors: match.away.colors,
    },
    status: live?.status ?? match.status,
    homeScore: live?.homeScore ?? match.homeScore,
    awayScore: live?.awayScore ?? match.awayScore,
    liveData: live?.liveData ?? match.liveData,
  };
}

export async function GET() {
  const merged = MATCHES.map(mergeMatch);

  return NextResponse.json(
    { matches: merged, updatedAt: new Date().toISOString() },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
