export interface NormalizedMatch {
  externalId: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  minute: number;
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED';
  date: string;
  stage: string;
  source: 'api-football' | 'football-data';
}

export async function fetchFromApiFootball(): Promise<NormalizedMatch[]> {
  // API-Football free tier does not cover FIFA World Cup 2026 fixtures.
  // football-data.org is the sole active data source for WC 2026 match sync.
  return [];
}

export async function fetchFromFootballData(): Promise<NormalizedMatch[]> {
  try {
    const res = await fetch('https://api.football-data.org/v4/competitions/WC/matches?season=2026', {
      headers: {
        'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY || ''
      }
    });
    
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    
    const data = await res.json();
    const matchesList = data.matches || [];
    
    return matchesList.map((match: any): NormalizedMatch => {
      let status: 'SCHEDULED' | 'LIVE' | 'FINISHED' = 'SCHEDULED';
      
      if (['IN_PLAY', 'PAUSED'].includes(match.status)) {
        status = 'LIVE';
      } else if (match.status === 'FINISHED') {
        status = 'FINISHED';
      }
      
      return {
        externalId: match.id.toString(),
        homeTeam: match.homeTeam?.name || 'TBD',
        awayTeam: match.awayTeam?.name || 'TBD',
        homeScore: match.score?.fullTime?.home ?? 0,
        awayScore: match.score?.fullTime?.away ?? 0,
        minute: 0, // API doesn't provide minute for IN_PLAY reliably
        status,
        date: match.utcDate,
        stage: match.stage,
        source: 'football-data'
      };
    });
  } catch (err) {
    console.error('fetchFromFootballData failed:', err);
    return [];
  }
}
