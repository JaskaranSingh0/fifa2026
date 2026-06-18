export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { syncIfStale } from '@/lib/match-sync';

// Client-triggered refresh (used by useRealtimeMatches). Shares the same
// throttle as the read endpoints so we never hammer the upstream APIs.
export async function GET() {
  try {
    await syncIfStale();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
