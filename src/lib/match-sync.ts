import { fetchFromFootballData, fetchFromESPN, NormalizedMatch } from './football-api';
import { prisma } from './prisma';
import { MATCHES, TournamentStage } from './data/matches';

// Maps football-data.org team name variants → names stored in our DB (from seed)
const TEAM_NAME_MAP: Record<string, string> = {
  'Czechia': 'Czech Republic',
  'Bosnia-Herzegovina': 'Bosnia & Herzegovina',
  'Bosnia and Herzegovina': 'Bosnia & Herzegovina',
  'United States': 'USA',
  'Curaçao': 'Curaçao',
  'Curacao': 'Curaçao',
  'IR Iran': 'Iran',
  'Iran': 'Iran',
  'Korea Republic': 'South Korea',
  'South Korea': 'South Korea',
  'Côte d\'Ivoire': 'Ivory Coast',
  'Ivory Coast': 'Ivory Coast',
  'China PR': 'China',
  'Trinidad and Tobago': 'Trinidad & Tobago',
  'DR Congo': 'DR Congo',
  'Congo DR': 'DR Congo',
  'Democratic Republic of the Congo': 'DR Congo',
  'Türkiye': 'Turkey',
  'Turkiye': 'Turkey',
  'Cabo Verde': 'Cape Verde',
  'Cape Verde Islands': 'Cape Verde',
  'Republic of Ireland': 'Ireland',
  'Korea DPR': 'North Korea',
};

export function normalizeTeamName(name: string): string {
  return TEAM_NAME_MAP[name] ?? name;
}

/** Parse a seeded "HH:MM UTC±H" kickoff + ISO date into the absolute UTC instant (ms). */
function kickoffUtcMs(dateStr: string, timeStr: string): number | null {
  const m = timeStr.match(/(\d{1,2}):(\d{2})\s*UTC\s*([+-]\d{1,2})/i);
  if (!m) return null;
  const [, hh, mm, off] = m;
  const sign = off.startsWith("-") ? "-" : "+";
  const offHrs = String(Math.abs(parseInt(off, 10))).padStart(2, "0");
  const d = new Date(`${dateStr}T${hh.padStart(2, "0")}:${mm}:00${sign}${offHrs}:00`);
  return isNaN(d.getTime()) ? null : d.getTime();
}

// Seeded knockout fixtures with their real UTC kickoff. Their teams are
// placeholders ("1A", "W73") that can't name-match the real upstream matchup, so
// we map by kickoff time instead.
const KO_SEEDS = MATCHES
  .filter((x) => x.stage !== TournamentStage.GROUP_STAGE && x.stage !== TournamentStage.ALL)
  .map((x) => ({ id: x.id, utc: kickoffUtcMs(x.date, x.time) }));

export async function syncMatches(): Promise<{ updated: number, source: string }> {
  const [afdData, espnData] = await Promise.all([
    fetchFromFootballData(),
    fetchFromESPN(),
  ]);
  
  // Build a map keyed by normalized team pair string
  const mergedMap = new Map<string, NormalizedMatch>();
  
  // ESPN is now primary source — most reliable for live WC 2026 data
  // football-data.org is secondary — used for FINISHED result confirmation
  // Insert ESPN data first into mergedMap, then overlay football-data.org

  // First: ESPN
  for (const match of espnData) {
    const normalizedHome = normalizeTeamName(match.homeTeam);
    const normalizedAway = normalizeTeamName(match.awayTeam);
    const dateStr = match.date.substring(0, 10);
    const key = `${normalizedHome}|${normalizedAway}|${dateStr}`;
    mergedMap.set(key, { ...match, homeTeam: normalizedHome, awayTeam: normalizedAway });
  }

  // Second: football-data.org — override only if it has FINISHED status (more authoritative for final scores)
  for (const match of afdData) {
    const normalizedHome = normalizeTeamName(match.homeTeam);
    const normalizedAway = normalizeTeamName(match.awayTeam);
    const dateStr = match.date.substring(0, 10);
    const key = `${normalizedHome}|${normalizedAway}|${dateStr}`;
    const existing = mergedMap.get(key);
    if (!existing) {
      mergedMap.set(key, { ...match, homeTeam: normalizedHome, awayTeam: normalizedAway });
    } else if (match.status === 'FINISHED') {
      // football-data.org confirmed finish overrides ESPN
      mergedMap.set(key, { ...match, homeTeam: normalizedHome, awayTeam: normalizedAway });
    }
  }
  
  let updatedCount = 0;
  
  const existingMatches = await prisma.match.findMany({
    where: { id: { startsWith: 'm' } }, // Only our seeded WC matches (m001-m104)
    select: { id: true, homeTeam: true, awayTeam: true, date: true, homeScore: true, awayScore: true, minute: true, status: true, externalId: true }
  });

  const assignedKo = new Set<string>(); // knockout slots already claimed this run

  for (const m of mergedMap.values()) {
    const matchDate = new Date(m.date);
    const matchTime = matchDate.getTime();
    const existing = existingMatches.find(e => {
      if (e.homeTeam !== m.homeTeam || e.awayTeam !== m.awayTeam) return false;
      const diffHours = Math.abs(e.date.getTime() - matchTime) / (1000 * 60 * 60);
      return diffHours <= 48; // Allow up to 48 hours timezone/scheduling variance
    });
    
    if (existing) {
      const scoreChanged = existing.homeScore !== m.homeScore || existing.awayScore !== m.awayScore;
      const statusChanged = existing.status !== m.status;
      const minuteChanged = existing.minute !== m.minute;
      const externalIdMissing = !existing.externalId && !!m.externalId;

      if (scoreChanged || statusChanged || minuteChanged || externalIdMissing) {
        await prisma.match.update({
          where: { id: existing.id },
          data: {
            homeScore: m.homeScore,
            awayScore: m.awayScore,
            minute: m.minute,
            status: m.status,
            externalId: m.externalId
          }
        });
        updatedCount++;
      }
      continue;
    }

    // Knockout fixtures hold placeholder names in the seed ("1A", "W73"), so the
    // real matchup ("South Africa vs Canada") can't name-match. Map it to a seeded
    // knockout slot by KICKOFF TIME, then write the real teams + scores.
    const realTeams =
      !!m.homeTeam && !!m.awayTeam && !/tbd/i.test(m.homeTeam) && !/tbd/i.test(m.awayTeam);
    if (realTeams) {
      let bestId: string | null = null;
      let bestDiff = Infinity;
      for (const k of KO_SEEDS) {
        if (k.utc == null || assignedKo.has(k.id)) continue;
        const diff = Math.abs(k.utc - matchTime);
        if (diff < bestDiff) { bestDiff = diff; bestId = k.id; }
      }
      if (bestId && bestDiff <= 2 * 60 * 60 * 1000) { // within 2h of the seeded kickoff
        assignedKo.add(bestId);
        const dbKo = existingMatches.find((e) => e.id === bestId);
        const changed =
          dbKo?.homeTeam !== m.homeTeam ||
          dbKo?.awayTeam !== m.awayTeam ||
          dbKo?.homeScore !== m.homeScore ||
          dbKo?.awayScore !== m.awayScore ||
          dbKo?.status !== m.status ||
          dbKo?.minute !== m.minute;
        if (changed) {
          await prisma.match.update({
            where: { id: bestId },
            data: {
              homeTeam: m.homeTeam,
              awayTeam: m.awayTeam,
              homeScore: m.homeScore,
              awayScore: m.awayScore,
              minute: m.minute,
              status: m.status,
              externalId: m.externalId,
            },
          });
          updatedCount++;
        }
        continue;
      }
    }

    // Not a WC match we recognise — skip (never create foreign matches).
    console.log(`[sync] Skipping non-WC match: ${m.homeTeam} vs ${m.awayTeam}`);
  }
  
  return { updated: updatedCount, source: 'football-data+espn' };
}

// Module-level throttle shared across read endpoints so any page that loads
// match data keeps the DB fresh — without hammering the upstream APIs.
let lastSyncAt = 0;

/**
 * Run a sync only if the last one was more than `minIntervalMs` ago.
 * Safe to await from GET routes: returns instantly when within the window.
 */
export async function syncIfStale(minIntervalMs = 30_000): Promise<void> {
  const now = Date.now();
  if (now - lastSyncAt < minIntervalMs) return;
  lastSyncAt = now;
  try {
    await syncMatches();
  } catch (err) {
    console.error('[syncIfStale] sync failed:', err);
  }
}
