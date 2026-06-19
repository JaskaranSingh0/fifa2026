"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { MatchWithScore } from "@/app/api/matches/route";

const SYNC_INTERVAL_LIVE = 30_000;   // 30s when matches are live
const SYNC_INTERVAL_IDLE = 120_000;  // 2min when no live matches
const POLL_INTERVAL = 30_000;        // Always poll /api/matches every 30s

export function useRealtimeMatches(initialMatches: MatchWithScore[] = []) {
  const [matches, setMatches] = useState<MatchWithScore[]>(initialMatches);
  const [isLive, setIsLive] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const mountedRef = useRef(true);
  const syncTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch latest match data from API
  const fetchMatches = useCallback(async () => {
    try {
      const res = await fetch("/api/matches", { cache: "no-store" });
      if (res.ok && mountedRef.current) {
        const data = await res.json();
        setMatches(data.matches ?? []);
      }
    } catch (err) {
      console.error("[matches] fetch failed:", err);
    } finally {
      if (mountedRef.current) setLoaded(true);
    }
  }, []);

  // Trigger backend sync (updates DB from ESPN/football-data APIs)
  const triggerSync = useCallback(async () => {
    try {
      await fetch("/api/matches/live", { cache: "no-store" });
      // After sync, immediately re-fetch matches
      await fetchMatches();
    } catch (err) {
      console.error("[sync] trigger failed:", err);
    }
  }, [fetchMatches]);

  // Start polling and sync timers
  const startTimers = useCallback((hasLive: boolean) => {
    // Clear existing timers
    if (syncTimerRef.current) clearInterval(syncTimerRef.current);
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);

    const syncInterval = hasLive ? SYNC_INTERVAL_LIVE : SYNC_INTERVAL_IDLE;

    // Poll for fresh match data every 30s regardless
    pollTimerRef.current = setInterval(fetchMatches, POLL_INTERVAL);

    // Trigger backend sync at appropriate interval
    syncTimerRef.current = setInterval(triggerSync, syncInterval);
  }, [fetchMatches, triggerSync]);

  useEffect(() => {
    mountedRef.current = true;

    // Initial load
    fetchMatches().then(() => {
      // After initial load, trigger a sync immediately to get latest live data
      triggerSync();
    });

    // Start with idle interval — will be adjusted when live matches detected
    startTimers(false);

    // Supabase Realtime — additional push-based updates from DB changes
    const channel = supabase
      .channel("matches_realtime")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "Match" },
        (payload) => {
          const updated = payload.new as {
            id: string;
            status: string;
            homeScore?: number;
            awayScore?: number;
            minute?: number;
          };
          if (!mountedRef.current) return;
          setMatches((prev) =>
            prev.map((m) => {
              if (m.id !== updated.id) return m;
              return {
                ...m,
                status: updated.status as MatchWithScore["status"],
                homeScore: updated.homeScore ?? m.homeScore,
                awayScore: updated.awayScore ?? m.awayScore,
                liveData:
                  updated.status === "LIVE"
                    ? { currentMinute: updated.minute ?? 0, isExtraTime: false, isPenalties: false }
                    : m.liveData,
              };
            })
          );
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") setIsLive(true);
      });

    return () => {
      mountedRef.current = false;
      if (syncTimerRef.current) clearInterval(syncTimerRef.current);
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      supabase.removeChannel(channel);
    };
  }, [fetchMatches, triggerSync, startTimers]);

  // Adjust sync frequency based on whether live matches exist
  useEffect(() => {
    const hasLive = matches.some((m) => m.status === "LIVE");
    startTimers(hasLive);
  }, [matches, startTimers]);

  return { matches, isLive, loaded };
}
