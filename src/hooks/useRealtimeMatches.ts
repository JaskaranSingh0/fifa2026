"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { MatchWithScore } from "@/app/api/matches/route";

export function useRealtimeMatches(initialMatches: MatchWithScore[] = []) {
  const [matches, setMatches] = useState<MatchWithScore[]>(initialMatches);
  const [isLive, setIsLive] = useState(false);
  const mountedRef = useRef(true);

  const fetchInitial = useCallback(async () => {
    try {
      const res = await fetch("/api/matches", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (mountedRef.current) {
          setMatches(data.matches);
        }
      }
    } catch (err) {
      console.error("Failed to fetch initial matches:", err);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    if (initialMatches.length === 0) {
      fetchInitial();
    }

    const channel = supabase
      .channel("matches_changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "Match",
        },
        (payload) => {
          const updatedMatch = payload.new;
          setMatches((prev) =>
            prev.map((m) => {
              if (m.id === updatedMatch.id) {
                const isMatchLive = updatedMatch.status === "LIVE";
                return {
                  ...m,
                  status: updatedMatch.status as any,
                  homeScore: updatedMatch.homeScore,
                  awayScore: updatedMatch.awayScore,
                  liveData: isMatchLive
                    ? {
                        ...m.liveData || { isExtraTime: false, isPenalties: false },
                        currentMinute: updatedMatch.minute,
                      }
                    : m.liveData,
                };
              }
              return m;
            })
          );
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setIsLive(true);
        }
      });

    return () => {
      mountedRef.current = false;
      supabase.removeChannel(channel);
    };
  }, [fetchInitial, initialMatches.length]);

  return { matches, isLive };
}
