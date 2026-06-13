import { fetchFromApiFootball, fetchFromFootballData, NormalizedMatch } from './football-api';
import { prisma } from './prisma';

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
    const key = (match.homeTeam === 'TBD' || match.awayTeam === 'TBD')
      ? `${match.source}-${match.externalId}`
      : `${match.homeTeam}|${match.awayTeam}|${dateStr}`;
    
    if (!mergedMap.has(key)) {
      mergedMap.set(key, match);
    } else {
      const existing = mergedMap.get(key)!;
      // Override status if API-Football says SCHEDULED but football-data has an active status
      if (existing.status === 'SCHEDULED' && (match.status === 'LIVE' || match.status === 'FINISHED')) {
        mergedMap.set(key, match);
      }
    }
  }
  
  let updatedCount = 0;
  
  for (const m of mergedMap.values()) {
    const matchDate = new Date(m.date);
    const startOfDay = new Date(matchDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(matchDate);
    endOfDay.setUTCHours(23, 59, 59, 999);
    
    const existing = await prisma.match.findFirst({
      where: {
        homeTeam: m.homeTeam,
        awayTeam: m.awayTeam,
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });
    
    if (existing) {
      const hasChanged = 
        existing.homeScore !== m.homeScore || 
        existing.awayScore !== m.awayScore || 
        existing.minute !== m.minute || 
        existing.status !== m.status;
        
      if (hasChanged) {
        await prisma.match.update({
          where: { id: existing.id },
          data: {
            homeScore: m.homeScore,
            awayScore: m.awayScore,
            minute: m.minute,
            status: m.status
          }
        });
        updatedCount++;
      }
    } else {
      await prisma.match.create({
        data: {
          id: `${m.source}-${m.externalId}`,
          homeTeam: m.homeTeam,
          awayTeam: m.awayTeam,
          homeScore: m.homeScore,
          awayScore: m.awayScore,
          minute: m.minute,
          status: m.status,
          date: matchDate,
          stage: m.stage
        }
      });
      updatedCount++;
    }
  }
  
  return { updated: updatedCount, source: 'api-football+football-data' };
}
