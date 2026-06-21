// bracket.ts — turn the flat knockout fixtures into a feeder tree and resolve
// the group-position placeholders ("1A"/"2B"…) into real qualified teams.

export interface BracketMatch {
  id: string;
  matchNumber: number;
  date: string;
  status: string;
  homeScore?: number;
  awayScore?: number;
  home: { code: string; name: string };
  away: { code: string; name: string };
  liveData?: { currentMinute: number };
}

export interface BracketNode {
  match: BracketMatch;
  children?: [BracketNode, BracketNode];
}

export interface BracketTree {
  final: BracketMatch;
  third?: BracketMatch;
  left: BracketNode | null;
  right: BracketNode | null;
}

export type ResolvedTeam = { code: string; name: string } | null;

interface StandingTeam { code: string; name: string; played: number; points: number }
export interface LiveGroupStanding { letter: string; teams: StandingTeam[] }

/** A real, playable team already sits in this slot (3-letter code). */
export function isRealTeam(code: string): boolean {
  return /^[A-Z]{3}$/.test(code) && code !== "TBD";
}

/** Human label for an unresolved placeholder slot. */
export function slotLabel(code: string): string {
  let m: RegExpExecArray | null;
  if ((m = /^1([A-L])$/.exec(code))) return `Winner ${m[1]}`;
  if ((m = /^2([A-L])$/.exec(code))) return `Runner-up ${m[1]}`;
  if (/^3/.test(code)) return "3rd Place";
  if ((m = /^W(\d+)$/.exec(code))) return `Winner ${m[1]}`;
  if ((m = /^L(\d+)$/.exec(code))) return `Loser ${m[1]}`;
  return code;
}

/**
 * Resolve "1X"/"2X" group-position slots into real teams as they QUALIFY — i.e.
 * the team currently in that slot, shown once it has SECURED a top-two finish
 * (at most one other team can still finish above it on points). This reveals a
 * side the moment it's through (e.g. a team on 6 pts after two wins) without
 * showing teams in groups that are still genuinely up for grabs, and the exact
 * 1st/2nd ordering keeps updating as results land. Finished groups resolve
 * directly. Best-third ("3X/…") slots stay labels until the official draw.
 */
export function buildGroupSlotResolver(groups: LiveGroupStanding[]) {
  const byLetter = new Map(groups.map((g) => [g.letter, g.teams]));
  const team = (t: StandingTeam): ResolvedTeam => ({ code: t.code, name: t.name });
  const maxPts = (t: StandingTeam) => t.points + 3 * Math.max(0, 3 - t.played);
  return (code: string): ResolvedTeam => {
    const m = /^([12])([A-L])$/.exec(code);
    if (!m) return null;
    const pos = parseInt(m[1], 10);
    const teams = byLetter.get(m[2]);
    if (!teams || teams.length < 4) return null;

    // Group finished → positions are final (already sorted pts→GD→GF).
    if (teams.every((t) => t.played >= 3)) return team(teams[pos - 1]);

    const t = teams[pos - 1];
    if (!t) return null;
    // Secured a top-two finish ⇔ at most one other team can end above it.
    const canFinishAbove = teams.filter((u) => u !== t && maxPts(u) > t.points).length;
    return canFinishAbove <= 1 ? team(t) : null;
  };
}

/**
 * Build the feeder tree from the flat knockout list. Each "W<n>" ref points at the
 * match that feeds this slot; following them down from the Final yields the two
 * halves of the bracket (left = feeders of the Final's first slot, right = second).
 */
export function buildBracketTree(matches: BracketMatch[]): BracketTree | null {
  const byNumber = new Map(matches.map((m) => [m.matchNumber, m]));
  const feeder = (code: string): BracketMatch | undefined => {
    const m = /^W(\d+)$/.exec(code);
    return m ? byNumber.get(parseInt(m[1], 10)) : undefined;
  };
  const node = (m: BracketMatch): BracketNode => {
    const h = feeder(m.home.code);
    const a = feeder(m.away.code);
    return h && a ? { match: m, children: [node(h), node(a)] } : { match: m };
  };

  const final = byNumber.get(104);
  if (!final) return null;
  const left = feeder(final.home.code);
  const right = feeder(final.away.code);
  return {
    final,
    third: byNumber.get(103),
    left: left ? node(left) : null,
    right: right ? node(right) : null,
  };
}
