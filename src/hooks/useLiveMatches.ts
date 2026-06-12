// useLiveMatches.ts — Client-side hook that polls /api/matches for live data.
//
// Usage:
//   const { matches, isLoading, lastUpdated } = useLiveMatches(30000);
//
// Polls every `intervalMs` (default 30s). Returns merged match data.

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { MatchWithScore } from "@/app/api/matches/route";
import { MatchStatus, TournamentStage } from "@/lib/data/matches";

export interface UseLiveMatchesResult {
  matches: MatchWithScore[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
  refetch: () => Promise<void>;
}

export function useLiveMatches(intervalMs: number = 30000): UseLiveMatchesResult {
  const [matches, setMatches] = useState<MatchWithScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchMatches = useCallback(async () => {
    try {
      const res = await fetch("/api/matches", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (mountedRef.current) {
        setMatches(data.matches);
        setLastUpdated(data.updatedAt);
        setError(null);
        setIsLoading(false);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : "Failed to fetch matches");
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchMatches();

    const interval = setInterval(fetchMatches, intervalMs);
    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [fetchMatches, intervalMs]);

  return { matches, isLoading, error, lastUpdated, refetch: fetchMatches };
}

// ── Utility: filter & group (mirrors matches-data.ts but for MatchWithScore) ──

export function filterLiveMatches(
  matches: MatchWithScore[],
  stage: string,
  query: string
): MatchWithScore[] {
  return matches.filter((m) => {
    const stageMatch = stage === TournamentStage.ALL || m.stage === stage;
    const q = query.toLowerCase().trim();
    const searchMatch =
      !q ||
      m.home.name.toLowerCase().includes(q) ||
      m.away.name.toLowerCase().includes(q) ||
      m.home.code.toLowerCase().includes(q) ||
      m.away.code.toLowerCase().includes(q) ||
      m.stadium.toLowerCase().includes(q) ||
      m.city.toLowerCase().includes(q) ||
      (m.group?.toLowerCase().includes(q) ?? false);
    return stageMatch && searchMatch;
  });
}

export function groupLiveMatchesByDate(matches: MatchWithScore[]): Map<string, MatchWithScore[]> {
  const grouped = new Map<string, MatchWithScore[]>();
  const sorted = [...matches].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.matchNumber - b.matchNumber;
  });
  for (const match of sorted) {
    if (!grouped.has(match.date)) grouped.set(match.date, []);
    grouped.get(match.date)!.push(match);
  }
  return grouped;
}
