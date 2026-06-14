export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    // Look up the match in our DB to get the externalId
    const match = await prisma.match.findUnique({
      where: { id },
      select: { externalId: true, homeTeam: true, awayTeam: true, status: true }
    });

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    // If no externalId yet (match not synced), return empty details gracefully
    if (!match.externalId) {
      return NextResponse.json({ details: null, reason: 'no_external_id' });
    }

    // Fetch from football-data.org
    const res = await fetch(`https://api.football-data.org/v4/matches/${match.externalId}`, {
      headers: { 'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY || '' },
      next: { revalidate: 60 } // cache 60s
    });

    if (!res.ok) {
      return NextResponse.json({ details: null, reason: 'api_error' });
    }

    const data = await res.json();

    // Normalize into a clean MatchDetails shape
    const details = {
      goals: (data.goals || []).map((g: any) => ({
        minute: g.minute,
        injuryTime: g.injuryTime ?? null,
        type: g.type, // 'REGULAR', 'OWN', 'PENALTY'
        team: g.team?.name ?? 'Unknown',
        scorer: g.scorer?.name ?? 'Unknown',
        assist: g.assist?.name ?? null,
      })),
      homeLineup: {
        formation: data.homeTeam?.formation ?? null,
        startingXI: (data.homeTeam?.lineup || []).map((p: any) => ({
          name: p.name,
          position: p.position,
          shirtNumber: p.shirtNumber,
        })),
        bench: (data.homeTeam?.bench || []).map((p: any) => ({
          name: p.name,
          position: p.position,
          shirtNumber: p.shirtNumber,
        })),
      },
      awayLineup: {
        formation: data.awayTeam?.formation ?? null,
        startingXI: (data.awayTeam?.lineup || []).map((p: any) => ({
          name: p.name,
          position: p.position,
          shirtNumber: p.shirtNumber,
        })),
        bench: (data.awayTeam?.bench || []).map((p: any) => ({
          name: p.name,
          position: p.position,
          shirtNumber: p.shirtNumber,
        })),
      },
      referees: (data.referees || []).map((r: any) => ({
        name: r.name,
        nationality: r.nationality,
        role: r.role,
      })),
      venue: data.venue ?? null,
    };

    return NextResponse.json({ details });
  } catch (err) {
    console.error('Match details fetch error:', err);
    return NextResponse.json({ details: null, reason: 'server_error' });
  }
}
