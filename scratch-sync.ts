import { syncMatches } from './src/lib/match-sync';

async function main() {
  console.log("Starting syncMatches...");
  const res = await syncMatches();
  console.log("Sync result:", res);
}

main().catch(console.error).finally(() => {
  console.log("Exiting.");
  process.exit(0);
});
