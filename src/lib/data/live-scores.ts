// live-scores.ts — Dynamic match results, separate from static schedule.
//
// This file is the single source of truth for match outcomes.
// The static schedule in matches.ts provides teams/dates/venues.
// This file provides scores, status, and live data.
//
// To update: edit this file, or replace with an API fetch in the future.

import { MatchStatus } from "./matches";

export interface LiveScore {
  matchId: string;
  status: MatchStatus;
  homeScore: number;
  awayScore: number;
  liveData?: {
    currentMinute: number;
    isExtraTime: boolean;
    isPenalties: boolean;
    penaltyScore?: [number, number];
  };
}

/**
 * All known results.
 * Keyed by match ID for O(1) lookup.
 */
export const LIVE_SCORES: Record<string, LiveScore> = {
  // ── June 11, 2026 — Matchday 1 ──────────────────────────────────────
  m001: {
    matchId: "m001",
    status: MatchStatus.FINISHED,
    homeScore: 2,  // Mexico
    awayScore: 0,  // South Africa
  },
  m002: {
    matchId: "m002",
    status: MatchStatus.FINISHED,
    homeScore: 2,  // South Korea
    awayScore: 1,  // Czech Republic
  },
};

/**
 * Look up a live score by match ID.
 * Returns null if no live data exists (match is still UPCOMING per schedule).
 */
export function getLiveScore(matchId: string): LiveScore | null {
  return LIVE_SCORES[matchId] ?? null;
}
