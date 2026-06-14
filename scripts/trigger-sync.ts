import { syncMatches } from '../src/lib/match-sync';

async function main() {
  const result = await syncMatches();
  console.log(JSON.stringify(result));
}

main().catch(console.error);
