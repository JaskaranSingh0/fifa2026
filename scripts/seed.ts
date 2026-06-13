import { PrismaClient } from '@prisma/client';
import { MATCHES } from '../src/lib/data/matches';

const prisma = new PrismaClient();

async function seed() {
  console.log(`Seeding ${MATCHES.length} matches...`);
  
  for (const m of MATCHES) {
    const matchDate = new Date(`${m.date}T00:00:00.000Z`); // Roughly the right date
    
    await prisma.match.upsert({
      where: { id: m.id },
      update: {
        homeTeam: m.home.name,
        awayTeam: m.away.name,
        stage: m.stage
      },
      create: {
        id: m.id,
        homeTeam: m.home.name,
        awayTeam: m.away.name,
        homeScore: m.homeScore ?? 0,
        awayScore: m.awayScore ?? 0,
        minute: 0,
        status: m.status,
        date: matchDate,
        stage: m.stage
      }
    });
  }
  
  console.log('Done seeding.');
}

seed().catch(console.error).finally(() => prisma.$disconnect());
