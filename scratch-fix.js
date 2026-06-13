const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
  await prisma.match.update({
    where: { id: "m001" },
    data: {
      status: "SCHEDULED",
      homeScore: 0,
      awayScore: 0,
      minute: 0
    }
  });
  console.log("Fixed m001");
}

fix().catch(console.error).finally(() => prisma.$disconnect());
