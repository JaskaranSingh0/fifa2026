/* eslint-disable @typescript-eslint/no-explicit-any -- ESPN summary is untyped third-party JSON; `any` is the pragmatic boundary type for this adapter. */
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
  'Congo DR': 'DR Congo',
  'Democratic Republic of the Congo': 'DR Congo',
};

function normalizeESPN(name: string): string {
  return ESPN_NAME_MAP[name] ?? name;
}

async function fetchESPNEventId(homeTeam: string, awayTeam: string, date: Date): Promise<string | null> {
  try {
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

    // Try all possible ESPN paths for goal data.
    // As of 2026 ESPN serves goals under header.competitions[].details (the
    // legacy scoringPlays/plays arrays are now usually absent), so that's the
    // primary path; the rest are kept as fallbacks for other data states.
    let rawScoringPlays: any[] = [];

    // Path 0 (current): header.competitions[0].details where scoringPlay === true
    const headerDetails = espn.header?.competitions?.[0]?.details;
    if (Array.isArray(headerDetails) && headerDetails.length > 0) {
      rawScoringPlays = headerDetails.filter((d: any) => d.scoringPlay === true);
    }

    // Path 1: direct scoringPlays array
    if (rawScoringPlays.length === 0 && espn.scoringPlays?.length > 0) {
      rawScoringPlays = espn.scoringPlays;
    }

    // Path 2: keyEvents filtered to goals
    if (rawScoringPlays.length === 0 && espn.keyEvents?.length > 0) {
      rawScoringPlays = espn.keyEvents.filter((e: any) =>
        e.scoringPlay === true ||
        e.type?.text?.toLowerCase().includes('goal') ||
        e.scoringType?.displayName?.toLowerCase().includes('goal') ||
        e.type?.id === '99' || e.type?.id === '70'
      );
    }

    // Path 3: plays array filtered to scoringPlay === true
    if (rawScoringPlays.length === 0 && espn.plays?.length > 0) {
      rawScoringPlays = espn.plays.filter((p: any) => p.scoringPlay === true);
    }

    const goals = rawScoringPlays.map((play: any) => {
      // ESPN participants format: [{ athlete: { displayName, id } }, ...]
      // First participant is the scorer, second (if any) is the assist.
      const scorerName = play.participants?.[0]?.athlete?.displayName
        ?? play.participants?.[0]?.displayName
        ?? play.athlete?.displayName
        ?? 'Unknown';

      const assistName = play.participants?.[1]?.athlete?.displayName
        ?? play.participants?.[1]?.displayName
        ?? null;

      const clockStr = play.clock?.displayValue ?? play.period?.clock ?? '';
      const minute = clockStr
        ? clockStr.replace(/'/g, '').trim()
        : (play.sequenceNumber ? Math.floor(parseInt(play.sequenceNumber) / 60) + '' : '?');

      const teamName = play.team?.displayName ?? play.team?.name ?? '';

      // Derive type from the boolean flags ESPN now ships (own goal / penalty),
      // falling back to the older scoringType / type fields.
      const type = play.ownGoal
        ? 'Own Goal'
        : play.penaltyKick
        ? 'Penalty'
        : play.scoringType?.displayName ?? play.type?.text ?? 'Goal';

      return {
        minute,
        team: normalizeESPN(teamName),
        scorer: scorerName,
        assist: assistName,
        type,
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
