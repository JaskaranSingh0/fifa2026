import { fetchFromApiFootball, fetchFromFootballData, fetchFromESPN, NormalizedMatch } from './football-api';
import { prisma } from './prisma';

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
  'Türkiye': 'Turkey',
  'Cabo Verde': 'Cape Verde',
};

export function normalizeTeamName(name: string): string {
  return TEAM_NAME_MAP[name] ?? name;
}

export async function syncMatches(): Promise<{ updated: number, source: string }> {
  const [apfData, afdData, espnData] = await Promise.all([
    fetchFromApiFootball(),
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
    } else {
      // GUARD: Do NOT create foreign matches. Only update existing seeded WC matches.
      // If no match found in DB for this API result, it is not a World Cup match — skip silently.
      console.log(`[sync] Skipping non-WC match: ${m.homeTeam} vs ${m.awayTeam}`);
    }
  }
  
  return { updated: updatedCount, source: 'api-football+football-data+espn' };
}
