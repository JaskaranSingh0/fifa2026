// useLiveMatches.ts — match-list helpers for the live (MatchWithScore) shape.
//
// The polling hook that previously lived here was removed in favour of
// useRealtimeMatches (30s poll + Supabase Realtime). These pure helpers mirror
// filterMatches / groupMatchesByDate in matches-data.ts but operate on the
// MatchWithScore shape returned by /api/matches, and are consumed by /matches.

import type { MatchWithScore } from "@/app/api/matches/route";
import { TournamentStage } from "@/lib/data/matches";

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
