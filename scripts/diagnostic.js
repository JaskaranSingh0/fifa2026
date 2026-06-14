const { execSync } = require('child_process');
const fs = require('fs');

console.log("=== 1. SYNC ===");
try {
  const env = fs.readFileSync('.env.local', 'utf8');
  const secret = env.split('\n').find(l => l.startsWith('SYNC_SECRET=')).split('=')[1].trim();
  console.log(execSync(`curl -s -H "x-sync-secret: ${secret}" http://localhost:3000/api/matches/sync`).toString());
} catch(e) { console.error(e.message); }

console.log("\n=== 2. ESPN ===");
try {
  const espn = execSync('curl -s "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard"').toString();
  console.log(espn.substring(0, 3000));
} catch(e) { console.error(e.message); }

console.log("\n=== 3. DEBUG ===");
try {
  console.log(execSync('npx tsx scripts/debug-api-response.ts').toString());
} catch(e) { console.error(e.message); }

console.log("\n=== 4. AUDIT ===");
try {
  console.log(execSync('npx tsx scripts/audit-live.ts').toString());
} catch(e) { console.error(e.message); }

console.log("\n=== 5. VERIFY SEED ===");
try {
  console.log(execSync('npx tsx scripts/verify-seed.ts').toString());
} catch(e) { console.error(e.message); }
