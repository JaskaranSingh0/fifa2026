export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { syncMatches } from '@/lib/match-sync';

// Rate limit: only sync if last sync was >25 seconds ago
let lastSyncTime = 0;

export async function GET() {
  const now = Date.now();
  if (now - lastSyncTime < 25_000) {
    return NextResponse.json({ skipped: true, reason: 'rate_limited' });
  }
  lastSyncTime = now;
  
  try {
    const result = await syncMatches();
    return NextResponse.json({ success: true, ...result });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
