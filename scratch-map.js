const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { MATCHES } = require('./src/lib/data/matches');

async function main() {
  const dbMatches = await prisma.match.findMany();
  let matchedCount = 0;
  
  for (const m of MATCHES) {
    const found = dbMatches.find(dbm => dbm.homeTeam === m.home.name && dbm.awayTeam === m.away.name);
    if (found) {
      matchedCount++;
    } else {
      console.log(`Unmatched: ${m.home.name} vs ${m.away.name}`);
    }
  }
  
  console.log(`Matched ${matchedCount} out of ${MATCHES.length}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
