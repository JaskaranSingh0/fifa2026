const { execSync } = require('child_process');
const fs = require('fs');

console.log("=== 1. DEBUG ===");
try {
  console.log(execSync('npx tsx scripts/debug-api-response.ts').toString());
} catch(e) { console.error(e.message); }

console.log("\n=== 2. SYNC ===");
try {
  const env = fs.readFileSync('.env.local', 'utf8');
  const secret = env.split('\n').find(l => l.startsWith('SYNC_SECRET=')).split('=')[1].trim();
  console.log(execSync(`curl -s -H "x-sync-secret: ${secret}" http://localhost:3000/api/matches/sync`).toString());
} catch(e) { console.error(e.message); }

console.log("\n=== 3. AUDIT ===");
try {
  console.log(execSync('npx tsx scripts/audit-live.ts').toString());
} catch(e) { console.error(e.message); }
