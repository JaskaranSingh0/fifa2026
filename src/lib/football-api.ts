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
  try {
    const res = await fetch('https://football-live-streaming-api.p.rapidapi.com/matches?page=1', {
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY || '',
        'x-rapidapi-host': 'football-live-streaming-api.p.rapidapi.com'
      }
    });
    
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    
    const data = await res.json();
    const matchesList = data.matches || [];
    
    return matchesList.map((match: any): NormalizedMatch => {
      const matchTime = parseInt(match.match_time) || Math.floor(Date.now() / 1000);
      const isLive = match.match_status === 'live';
      // If the match was in the past (e.g. started > 2 hours ago) and is no longer live, mark as FINISHED
      const hasEnded = !isLive && (Date.now() / 1000) > (matchTime + 7200);
      const status: 'SCHEDULED' | 'LIVE' | 'FINISHED' = isLive 
        ? 'LIVE' 
        : (hasEnded ? 'FINISHED' : 'SCHEDULED');
      
      // Create a unique external ID since the API doesn't provide a direct ID field
      const externalId = `${match.home_team_name}-${match.away_team_name}-${matchTime}`.replace(/\s+/g, '-').toLowerCase();
      
      return {
        externalId,
        homeTeam: match.home_team_name || 'TBD',
        awayTeam: match.away_team_name || 'TBD',
        homeScore: parseInt(match.homeTeamScore) || 0,
        awayScore: parseInt(match.awayTeamScore) || 0,
        minute: isLive ? 45 : 0, // Fallback/average since this API does not supply the elapsed minute
        status,
        date: new Date(matchTime * 1000).toISOString(),
        stage: match.league_name || 'World Cup',
        source: 'api-football'
      };
    });
  } catch (err) {
    console.error('fetchFromApiFootball (Football Live Streaming API) failed:', err);
    return [];
  }
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
