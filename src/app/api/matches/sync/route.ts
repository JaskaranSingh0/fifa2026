import { NextResponse } from "next/server";
import { syncMatches } from "@/lib/match-sync";

// NOTE: Vercel Cron will need the x-sync-secret header.
// A Vercel Cron job can be configured with a custom header via middleware,
// or the request can be authenticated by checking the User-Agent for 'vercel-cron'.
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("x-sync-secret");
    const isCron = request.headers.get("user-agent") === "vercel-cron";
    
    if (authHeader !== process.env.SYNC_SECRET && !isCron) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    
    const { updated, source } = await syncMatches();
    
    return NextResponse.json({ 
      success: true, 
      updated, 
      source,
      timestamp: new Date().toISOString() 
    });
  } catch (error: any) {
    console.error("Match sync error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to sync matches" },
      { status: 500 }
    );
  }
}
