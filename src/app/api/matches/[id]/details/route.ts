export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizeTeamName } from '@/lib/match-sync';

// ESPN team name → our stored team name normalization
const ESPN_NAME_MAP: Record<string, string> = {
  'United States': 'USA',
  'Czechia': 'Czech Republic',
  'Bosnia-Herzegovina': 'Bosnia and Herzegovina',
  'Türkiye': 'Turkey',
  "Côte d'Ivoire": 'Ivory Coast',
  'IR Iran': 'Iran',
  'Korea Republic': 'South Korea',
  'Curaçao': 'Curaçao',
  'Curacao': 'Curaçao',
  'Cabo Verde': 'Cape Verde',
};

function normalizeESPN(name: string): string {
  return ESPN_NAME_MAP[name] ?? name;
}

async function fetchESPNEventId(homeTeam: string, awayTeam: string, date: Date): Promise<string | null> {
  try {
    const yyyy = date.getUTCFullYear();
    const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(date.getUTCDate()).padStart(2, '0');
    const dateStr = `${yyyy}${mm}${dd}`;

    // Try current date and adjacent days to handle timezone offsets
    for (const offset of [0, -1, 1]) {
      const d = new Date(date);
      d.setUTCDate(d.getUTCDate() + offset);
      const ds = `${d.getUTCFullYear()}${String(d.getUTCMonth()+1).padStart(2,'0')}${String(d.getUTCDate()).padStart(2,'0')}`;
      
      const res = await fetch(
        `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${ds}`,
        { next: { revalidate: 60 } }
      );
      if (!res.ok) continue;
      const data = await res.json();
      
      for (const event of (data.events || [])) {
        const comp = event.competitions?.[0];
        const h = comp?.competitors?.find((c: any) => c.homeAway === 'home');
        const a = comp?.competitors?.find((c: any) => c.homeAway === 'away');
        const espnHome = normalizeESPN(h?.team?.displayName ?? '');
        const espnAway = normalizeESPN(a?.team?.displayName ?? '');
        if (espnHome === homeTeam && espnAway === awayTeam) {
          return event.id;
        }
      }
    }
    return null;
  } catch {
    return null;
  }
}

async function fetchESPNSummary(eventId: string) {
  const res = await fetch(
    `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary?event=${eventId}`,
    { next: { revalidate: 60 } }
  );
  if (!res.ok) throw new Error(`ESPN summary failed: ${res.status}`);
  return res.json();
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const match = await prisma.match.findUnique({
      where: { id: resolvedParams.id },
      select: { homeTeam: true, awayTeam: true, date: true, status: true, homeScore: true, awayScore: true, externalId: true }
    });

    if (!match) return NextResponse.json({ error: 'Match not found' }, { status: 404 });

    // Find ESPN event ID using stored externalId (if it's an ESPN ID) or by matching team names + date
    let espnEventId = match.externalId?.startsWith('espn-') ? match.externalId.replace('espn-', '') : null;
    if (!espnEventId) {
      espnEventId = await fetchESPNEventId(match.homeTeam, match.awayTeam, match.date);
    }
    
    if (!espnEventId) {
      return NextResponse.json({ details: null, reason: 'no_external_id' });
    }

    const espn = await fetchESPNSummary(espnEventId);

    console.log('[ESPN summary keys]:', Object.keys(espn));
    console.log('[ESPN scoringPlays count]:', espn.scoringPlays?.length ?? 0, 'keyEvents:', espn.keyEvents?.length ?? 0, 'plays:', espn.plays?.length ?? 0);

    // Try all possible ESPN paths for goal data
    let rawScoringPlays: any[] = [];

    // Path 1: direct scoringPlays array
    if (espn.scoringPlays?.length > 0) {
      rawScoringPlays = espn.scoringPlays;
    }

    // Path 2: keyEvents filtered to goals
    if (rawScoringPlays.length === 0 && espn.keyEvents?.length > 0) {
      rawScoringPlays = espn.keyEvents.filter((e: any) => 
        e.type?.text?.toLowerCase().includes('goal') ||
        e.scoringType?.displayName?.toLowerCase().includes('goal') ||
        e.type?.id === '99' || e.type?.id === '70'
      );
    }

    // Path 3: plays array filtered to scoringPlay === true
    if (rawScoringPlays.length === 0 && espn.plays?.length > 0) {
      rawScoringPlays = espn.plays.filter((p: any) => p.scoringPlay === true);
    }

    // Log what ESPN returned so we can debug
    console.log(`[ESPN goals] path used: ${espn.scoringPlays?.length > 0 ? 'scoringPlays' : espn.keyEvents?.length > 0 ? 'keyEvents' : 'plays'}, count: ${rawScoringPlays.length}`);
    console.log('[ESPN raw first goal]:', JSON.stringify(rawScoringPlays[0] ?? null));

    const goals = rawScoringPlays.map((play: any) => {
      // ESPN participants format: [{ athlete: { displayName, id } }, { athlete: { displayName, id } }]
      // First participant is always scorer, second (if exists) is assist
      const scorerName = play.participants?.[0]?.athlete?.displayName
        ?? play.participants?.[0]?.displayName  // fallback if no nesting
        ?? play.athlete?.displayName
        ?? 'Unknown';

      const assistName = play.participants?.[1]?.athlete?.displayName
        ?? play.participants?.[1]?.displayName
        ?? null;

      const clockStr = play.clock?.displayValue ?? play.period?.clock ?? '';
      const minute = clockStr 
        ? clockStr.replace("'", '').trim()
        : (play.sequenceNumber ? Math.floor(parseInt(play.sequenceNumber) / 60) + '' : '?');

      const teamName = play.team?.displayName ?? play.team?.name ?? '';

      return {
        minute,
        team: normalizeESPN(teamName),
        scorer: scorerName,
        assist: assistName,
        type: play.scoringType?.displayName ?? play.type?.text ?? 'Goal',
      };
    });

    // Parse match stats from ESPN
    const boxscore = espn.boxscore || {};
    const statGroups = boxscore.teams || [];
    const homeStats = statGroups.find((t: any) => t.homeAway === 'home')?.statistics ?? [];
    const awayStats = statGroups.find((t: any) => t.homeAway === 'away')?.statistics ?? [];
    
    const getStat = (stats: any[], name: string) => 
      stats.find((s: any) => s.name === name || s.label?.toLowerCase().includes(name.toLowerCase()))?.displayValue ?? null;

    const matchStats = {
      possession: {
        home: getStat(homeStats, 'possessionPct') ?? getStat(homeStats, 'possession'),
        away: getStat(awayStats, 'possessionPct') ?? getStat(awayStats, 'possession'),
      },
      shots: {
        home: getStat(homeStats, 'totalShots') ?? getStat(homeStats, 'shots'),
        away: getStat(awayStats, 'totalShots') ?? getStat(awayStats, 'shots'),
      },
      shotsOnTarget: {
        home: getStat(homeStats, 'shotsOnTarget'),
        away: getStat(awayStats, 'shotsOnTarget'),
      },
      corners: {
        home: getStat(homeStats, 'cornerKicks') ?? getStat(homeStats, 'corners'),
        away: getStat(awayStats, 'cornerKicks') ?? getStat(awayStats, 'corners'),
      },
      fouls: {
        home: getStat(homeStats, 'foulsCommitted') ?? getStat(homeStats, 'fouls'),
        away: getStat(awayStats, 'foulsCommitted') ?? getStat(awayStats, 'fouls'),
      },
      yellowCards: {
        home: getStat(homeStats, 'yellowCards'),
        away: getStat(awayStats, 'yellowCards'),
      },
      redCards: {
        home: getStat(homeStats, 'redCards'),
        away: getStat(awayStats, 'redCards'),
      },
      offsides: {
        home: getStat(homeStats, 'offsides'),
        away: getStat(awayStats, 'offsides'),
      },
      saves: {
        home: getStat(homeStats, 'saves'),
        away: getStat(awayStats, 'saves'),
      },
    };

    // Parse lineups from ESPN rosters
    const rosters = espn.rosters || [];
    const parseLineup = (homeAway: 'home' | 'away') => {
      const team = rosters.find((r: any) => r.homeAway === homeAway);
      if (!team) return { formation: null, startingXI: [], bench: [] };
      
      const starters = (team.roster || []).filter((p: any) => p.starter);
      const bench = (team.roster || []).filter((p: any) => !p.starter);
      
      return {
        formation: team.formation ?? null,
        startingXI: starters.map((p: any) => ({
          name: p.athlete?.displayName ?? 'Unknown',
          position: p.position?.abbreviation ?? '',
          shirtNumber: p.jersey ?? null,
        })),
        bench: bench.map((p: any) => ({
          name: p.athlete?.displayName ?? 'Unknown',
          position: p.position?.abbreviation ?? '',
          shirtNumber: p.jersey ?? null,
        })),
      };
    };

    // Parse referee from ESPN officials
    const officials = espn.gameInfo?.officials || [];
    const referees = officials.map((o: any) => ({
      name: o.fullName ?? o.displayName ?? 'Unknown',
      role: o.position?.displayName ?? 'Referee',
      nationality: null,
    }));

    const details = {
      goals,
      matchStats,
      homeLineup: parseLineup('home'),
      awayLineup: parseLineup('away'),
      referees,
      venue: espn.gameInfo?.venue?.fullName ?? null,
      attendance: espn.gameInfo?.attendance ?? null,
      espnEventId,
    };

    return NextResponse.json({ details });
  } catch (err) {
    console.error('[match details]', err);
    return NextResponse.json({ details: null, reason: 'server_error' });
  }
}
