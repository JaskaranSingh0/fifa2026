/* eslint-disable @typescript-eslint/no-explicit-any -- football-data.org + ESPN responses are untyped third-party JSON */
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
  source: 'football-data' | 'espn';
  /** Shootout score, when the match went (or is going) to penalties */
  homePens?: number | null;
  awayPens?: number | null;
  /** How the match ended / is being decided */
  duration?: 'REGULAR' | 'EXTRA_TIME' | 'PENALTY_SHOOTOUT';
}

const FETCH_TIMEOUT_MS = 8000;

/**
 * fetch + a hard timeout. The background sync runs via `after()` on read routes;
 * without this an unresponsive upstream could keep a serverless invocation alive
 * indefinitely. Aborts after `ms` and lets the caller's catch return [].
 */
async function fetchWithTimeout(url: string, init: RequestInit = {}, ms = FETCH_TIMEOUT_MS): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchFromFootballData(): Promise<NormalizedMatch[]> {
  try {
    const res = await fetchWithTimeout('https://api.football-data.org/v4/competitions/WC/matches?season=2026', {
      headers: {
        'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY || ''
      }
    });
    
    if (res.status === 403) {
      console.warn('[football-data] 403 rate limit hit — quota exceeded for today');
      return [];
    }
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
      
      // v4: score.duration = REGULAR | EXTRA_TIME | PENALTY_SHOOTOUT,
      // with the shootout itself in score.penalties.{home,away}
      const duration: NormalizedMatch['duration'] =
        match.score?.duration === 'PENALTY_SHOOTOUT' ? 'PENALTY_SHOOTOUT'
        : match.score?.duration === 'EXTRA_TIME' ? 'EXTRA_TIME'
        : 'REGULAR';

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
        source: 'football-data',
        homePens: match.score?.penalties?.home ?? null,
        awayPens: match.score?.penalties?.away ?? null,
        duration,
      };
    });
  } catch (err) {
    console.error('fetchFromFootballData failed:', err);
    return [];
  }
}

export async function fetchFromESPN(): Promise<NormalizedMatch[]> {
  try {
    // Build a rolling date window: 5 days back through 1 day ahead
    // This catches all recent results even when other APIs hit rate limits
    const dateStrings: string[] = [];
    for (let i = -5; i <= 1; i++) {
      const d = new Date();
      d.setUTCDate(d.getUTCDate() + i);
      const yyyy = d.getUTCFullYear();
      const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
      const dd = String(d.getUTCDate()).padStart(2, '0');
      dateStrings.push(`${yyyy}${mm}${dd}`);
    }

    // Fetch all dates in parallel
    const responses = await Promise.all(
      dateStrings.map(dateStr =>
        fetchWithTimeout(
          `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${dateStr}`,
          { next: { revalidate: 60 } }
        ).then(r => r.ok ? r.json() : { events: [] }).catch(() => ({ events: [] }))
      )
    );

    // Flatten and deduplicate all events by ESPN event ID
    const seenIds = new Set<string>();
    const allEvents: any[] = [];
    for (const data of responses) {
      for (const event of (data.events || [])) {
        if (!seenIds.has(event.id)) {
          seenIds.add(event.id);
          allEvents.push(event);
        }
      }
    }

    return allEvents.map((event): NormalizedMatch => {
      const competition = event.competitions?.[0];
      const home = competition?.competitors?.find((c: any) => c.homeAway === 'home');
      const away = competition?.competitors?.find((c: any) => c.homeAway === 'away');
      const statusName = event.status?.type?.name ?? 'STATUS_SCHEDULED';
      const statusDetail: string = event.status?.type?.detail ?? event.status?.type?.shortDetail ?? '';

      const normalizedStatus: 'SCHEDULED' | 'LIVE' | 'FINISHED' =
        statusName === 'STATUS_IN_PROGRESS' || statusName === 'STATUS_HALFTIME' || statusName === 'STATUS_FIRST_HALF' || statusName === 'STATUS_SECOND_HALF'
          || statusName === 'STATUS_OVERTIME' || statusName === 'STATUS_SHOOTOUT' || statusName === 'STATUS_HALFTIME_ET'
          ? 'LIVE'
          : statusName === 'STATUS_FULL_TIME' || statusName === 'STATUS_FINAL' || statusName === 'STATUS_END_PERIOD'
            || statusName === 'STATUS_FINAL_PEN' || statusName === 'STATUS_FINAL_AET'
          ? 'FINISHED'
          : 'SCHEDULED';

      // For live matches, extract the actual minute
      const clockStr = event.status?.displayClock ?? "0:00";
      let minute = 0;

      if (normalizedStatus === 'LIVE') {
        // ESPN format: "23'", "45'+2'", "90'+6'", "105'+1'" (extra time)
        const match = clockStr.match(/^(\d+)/);
        minute = match ? parseInt(match[1]) : 0;
        // Add injury time if present (cap at 125 so ET stoppage still reads sanely)
        const injuryMatch = clockStr.match(/\+(\d+)/);
        if (injuryMatch) minute = Math.min(minute + parseInt(injuryMatch[1]), 125);
      }

      // Shootout: competitors carry shootoutScore when pens happened / are underway
      const homePensRaw = home?.shootoutScore;
      const awayPensRaw = away?.shootoutScore;
      const hasPens = homePensRaw != null && awayPensRaw != null;
      const duration: NormalizedMatch['duration'] =
        hasPens || statusName === 'STATUS_FINAL_PEN' || statusName === 'STATUS_SHOOTOUT' || /pen/i.test(statusDetail)
          ? 'PENALTY_SHOOTOUT'
          : statusName === 'STATUS_FINAL_AET' || statusName === 'STATUS_OVERTIME' || statusName === 'STATUS_HALFTIME_ET'
            || /AET|extra/i.test(statusDetail) || (normalizedStatus === 'LIVE' && minute > 90)
          ? 'EXTRA_TIME'
          : 'REGULAR';

      return {
        externalId: `espn-${event.id}`,
        homeTeam: home?.team?.displayName ?? 'TBD',
        awayTeam: away?.team?.displayName ?? 'TBD',
        homeScore: parseInt(home?.score ?? '0') || 0,
        awayScore: parseInt(away?.score ?? '0') || 0,
        minute,
        status: normalizedStatus,
        date: event.date,
        stage: event.season?.slug ?? 'GROUP_STAGE',
        source: 'espn' as const,
        homePens: hasPens ? parseInt(String(homePensRaw)) || 0 : null,
        awayPens: hasPens ? parseInt(String(awayPensRaw)) || 0 : null,
        duration,
      };
    });
  } catch (err) {
    console.error('[ESPN] fetch failed:', err);
    return [];
  }
}
