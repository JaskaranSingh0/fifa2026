export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GROUPS } from '@/lib/data/groups';
import { TEAMS, getTeam } from '@/lib/data/teams';

interface TeamStanding {
  code: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
}

export async function GET() {
  try {
    const matches = await prisma.match.findMany({
      where: { stage: 'GROUP_STAGE', status: { in: ['FINISHED'] } }
    });

    // Build standings map: teamName → stats
    const standings: Record<string, TeamStanding & { name: string }> = {};

    const nameToCode: Record<string, string> = {};
    Object.values(TEAMS).forEach(t => { nameToCode[t.name] = t.code; });

    // Also add common variants (from normalization map)
    const variants: Record<string, string> = {
      'Czech Republic': 'CZE', 'Bosnia and Herzegovina': 'BIH',
      'USA': 'USA', 'United States': 'USA', 'Curacao': 'CUR',
      'South Korea': 'KOR', 'Ivory Coast': 'CIV',
    };
    Object.assign(nameToCode, variants);

    const initTeam = (name: string): TeamStanding & { name: string } => ({
      code: nameToCode[name] ?? name.slice(0, 3).toUpperCase(),
      name,
      played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0
    });

    for (const match of matches) {
      const h = match.homeTeam;
      const a = match.awayTeam;
      if (!standings[h]) standings[h] = initTeam(h);
      if (!standings[a]) standings[a] = initTeam(a);

      const hg = match.homeScore ?? 0;
      const ag = match.awayScore ?? 0;
      standings[h].played++; standings[a].played++;
      standings[h].gf += hg; standings[h].ga += ag;
      standings[a].gf += ag; standings[a].ga += hg;
      standings[h].gd = standings[h].gf - standings[h].ga;
      standings[a].gd = standings[a].gf - standings[a].ga;

      if (hg > ag) {
        standings[h].won++; standings[h].points += 3;
        standings[a].lost++;
      } else if (hg < ag) {
        standings[a].won++; standings[a].points += 3;
        standings[h].lost++;
      } else {
        standings[h].drawn++; standings[h].points++;
        standings[a].drawn++; standings[a].points++;
      }
    }

    // Build per-group standings, sorted by points → GD → GF
    const groupStandings = GROUPS.map(group => {
      const teams = group.teams.map(code => {
        const team = getTeam(code);
        const name = team?.name ?? code;
        const s = Object.values(standings).find(st => st.code === code || st.name === name);
        return s ?? { code, name, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 };
      }).sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);
      return { letter: group.letter, name: group.name, teams };
    });

    return NextResponse.json({ groups: groupStandings });
  } catch (err) {
    console.error('Groups API error:', err);
    return NextResponse.json({ groups: [] }, { status: 500 });
  }
}
