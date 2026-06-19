import { Match, TournamentStage } from "./data/matches";

// Re-export core data & types for legacy compat
export * from "./data/matches";
export * from "./data/teams";
export * from "./data/stadiums";
export * from "./data/groups";

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------

/** Format "2026-06-11" → "Thursday, 11 June 2026" */
export function formatDate(isoDate: string): string {
  const d = new Date(isoDate + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Format "2026-06-11" → "Jun 11" (short) */
export function formatDateShort(isoDate: string): string {
  const d = new Date(isoDate + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Format "2026-06-11" → "JUNE 11" (editorial — massive display) */
export function formatDateEditorial(isoDate: string): { month: string; day: string } {
  const d = new Date(isoDate + "T00:00:00");
  const month = d.toLocaleDateString("en-US", { month: "long" }).toUpperCase();
  const day = d.getDate().toString();
  return { month, day };
}

/**
 * Convert a match's official date + "HH:MM UTC±H" kickoff string into the
 * viewer's LOCAL time (e.g. "7:00 PM"). Client-side; falls back to the raw
 * string if it can't be parsed.
 */
export function formatLocalKickoff(isoDate: string, timeStr: string): string {
  if (!timeStr) return "";
  const m = timeStr.match(/(\d{1,2}):(\d{2})\s*UTC\s*([+-]\d{1,2})/i);
  if (!m) return timeStr;
  const [, hh, mm, off] = m;
  const sign = off.startsWith("-") ? "-" : "+";
  const offHrs = String(Math.abs(parseInt(off, 10))).padStart(2, "0");
  const d = new Date(`${isoDate}T${hh.padStart(2, "0")}:${mm}:00${sign}${offHrs}:00`);
  if (isNaN(d.getTime())) return timeStr;
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

/** Get the tournament date range as a formatted string */
export function getTournamentDateRange(matches: Match[]): string {
  if (!matches || matches.length === 0) return "";
  const sorted = [...matches].sort((a, b) => a.date.localeCompare(b.date));
  const first = new Date(sorted[0].date + "T00:00:00");
  const last = new Date(sorted[sorted.length - 1].date + "T00:00:00");
  const f = first.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  const l = last.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  return `${f} — ${l}`;
}

/** Group matches by date, sorted chronologically */
export function groupMatchesByDate(matches: Match[]): Map<string, Match[]> {
  const grouped = new Map<string, Match[]>();
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

/** Filter matches by stage and search query */
export function filterMatches(
  matches: Match[],
  stage: TournamentStage,
  query: string
): Match[] {
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

/** Short stage label for editorial filters */
export const STAGE_LABELS_SHORT: Record<TournamentStage, string> = {
  [TournamentStage.ALL]: "All",
  [TournamentStage.GROUP_STAGE]: "Groups",
  [TournamentStage.ROUND_OF_32]: "R32",
  [TournamentStage.ROUND_OF_16]: "R16",
  [TournamentStage.QUARTER_FINALS]: "QF",
  [TournamentStage.SEMI_FINALS]: "SF",
  [TournamentStage.THIRD_PLACE]: "3rd Place",
  [TournamentStage.FINAL]: "Final",
};
