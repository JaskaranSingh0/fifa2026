import { fetchFromApiFootball, fetchFromFootballData, NormalizedMatch } from './football-api';
import { prisma } from './prisma';

// Maps football-data.org team name variants → names stored in our DB (from seed)
const TEAM_NAME_MAP: Record<string, string> = {
  'Czechia': 'Czech Republic',
  'Bosnia-Herzegovina': 'Bosnia & Herzegovina',
  'United States': 'USA',
  'Curaçao': 'Curacao',
  'IR Iran': 'Iran',
  'Korea Republic': 'South Korea',
  'Côte d\'Ivoire': 'Ivory Coast',
  'China PR': 'China',
  'Trinidad and Tobago': 'Trinidad & Tobago',
};

function normalizeTeamName(name: string): string {
  return TEAM_NAME_MAP[name] ?? name;
}

export async function syncMatches(): Promise<{ updated: number, source: string }> {
  const [apfData, afdData] = await Promise.all([
    fetchFromApiFootball(),
    fetchFromFootballData()
  ]);
  
  // Build a map keyed by normalized team pair string
  const mergedMap = new Map<string, NormalizedMatch>();
  
  // First insert all apfData (PRIMARY source)
  for (const match of apfData) {
    const dateStr = match.date.substring(0, 10);
    const key = (match.homeTeam === 'TBD' || match.awayTeam === 'TBD')
      ? `${match.source}-${match.externalId}`
      : `${match.homeTeam}|${match.awayTeam}|${dateStr}`;
    mergedMap.set(key, match);
  }
  
  // Merge football-data entries
  for (const match of afdData) {
    const dateStr = match.date.substring(0, 10);
    const normalizedHome = normalizeTeamName(match.homeTeam);
    const normalizedAway = normalizeTeamName(match.awayTeam);
    const key = (normalizedHome === 'TBD' || normalizedAway === 'TBD')
      ? `${match.source}-${match.externalId}`
      : `${normalizedHome}|${normalizedAway}|${dateStr}`;
    
    if (!mergedMap.has(key)) {
      mergedMap.set(key, { ...match, homeTeam: normalizedHome, awayTeam: normalizedAway });
    } else {
      const existing = mergedMap.get(key)!;
      // Override status if API-Football says SCHEDULED but football-data has an active status
      if (existing.status === 'SCHEDULED' && (match.status === 'LIVE' || match.status === 'FINISHED')) {
        mergedMap.set(key, match);
      }
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
  
  return { updated: updatedCount, source: 'api-football+football-data' };
}
