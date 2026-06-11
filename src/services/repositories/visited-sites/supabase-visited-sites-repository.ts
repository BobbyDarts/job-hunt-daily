// /src/services/repositories/visited-sites/supabase-visited-sites-repository.ts

import { todayIso } from "@/lib/time";
import { getCurrentUserId } from "@/services/supabase/auth";
import { supabase } from "@/services/supabase/client";
import type { VisitedSiteHistory, VisitedSites } from "@/types";

import type { VisitedSitesRepository } from "./visited-sites-repository";

export function createSupabaseVisitedSitesRepository(): VisitedSitesRepository {
  async function reset(): Promise<void> {
    const userId = await getCurrentUserId();
    const today = todayIso();

    const { error } = await supabase!
      .from("visited_sites")
      .delete()
      .eq("user_id", userId)
      .eq("visited_date", today);

    if (error) throw error;
  }

  async function getByDate(dt: string): Promise<VisitedSites | null> {
    const { data, error } = await supabase!
      .from("visited_sites")
      .select("url")
      .eq("visited_date", dt);

    if (error) throw error;

    return {
      date: dt,
      visited: (data ?? []).map(row => row.url),
    };
  }

  async function getHistoryAll(): Promise<VisitedSiteHistory[]> {
    const { data, error } = await supabase!
      .from("visited_site_history")
      .select("*")
      .order("date", { ascending: false });

    if (error) throw error;

    return (data ?? []).map(row => ({
      date: row.date,
      visitedUrls: row.visited_urls,
      totalSites: row.total_sites,
    }));
  }

  async function getHistoryByDate(
    dt: string,
  ): Promise<VisitedSiteHistory | null> {
    const { data, error } = await supabase!
      .from("visited_site_history")
      .select("*")
      .eq("date", dt)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      date: data.date,
      visitedUrls: data.visited_urls,
      totalSites: data.total_sites,
    };
  }

  async function getHistoryRange(
    from: string,
    to: string,
  ): Promise<VisitedSiteHistory[]> {
    const { data, error } = await supabase!
      .from("visited_site_history")
      .select("*")
      .gte("date", from)
      .lte("date", to)
      .order("date", { ascending: true });

    if (error) throw error;

    return (data ?? []).map(row => ({
      date: row.date,
      visitedUrls: row.visited_urls,
      totalSites: row.total_sites,
    }));
  }

  async function getHistoryAllDates(): Promise<string[]> {
    const { data, error } = await supabase!
      .from("visited_site_history")
      .select("date")
      .order("date", { ascending: true });

    if (error) throw error;

    return (data ?? []).map(row => row.date);
  }

  async function clearHistory(): Promise<void> {
    const userId = await getCurrentUserId();

    const { error } = await supabase!
      .from("visited_site_history")
      .delete()
      .eq("user_id", userId);

    if (error) throw error;
  }

  async function markVisited(url: string): Promise<void> {
    const userId = await getCurrentUserId();

    const { error } = await supabase!
      .from("visited_sites")
      .upsert(
        { user_id: userId, url, visited_date: todayIso() },
        { onConflict: "user_id,url,visited_date" },
      );

    if (error) throw error;
  }

  async function createHistory(entry: VisitedSiteHistory): Promise<void> {
    const userId = await getCurrentUserId();

    const { error } = await supabase!.from("visited_site_history").upsert(
      {
        user_id: userId,
        date: entry.date,
        visited_urls: entry.visitedUrls,
        total_sites: entry.totalSites,
      },
      { onConflict: "user_id,date" },
    );

    if (error) throw error;
  }

  async function serialize(): Promise<{
    today: VisitedSites;
    history: VisitedSiteHistory[];
  }> {
    const [today, history] = await Promise.all([
      getByDate(todayIso()),
      getHistoryAll(),
    ]);

    return {
      today: today ?? { date: todayIso(), visited: [] },
      history,
    };
  }

  async function hydrate(data: {
    today: VisitedSites;
    history: VisitedSiteHistory[];
  }): Promise<void> {
    if (!data.today?.date || !Array.isArray(data.today.visited)) {
      throw new Error("Invalid VisitedSites format");
    }

    await reset();

    if (data.today.visited.length > 0) {
      const userId = await getCurrentUserId();

      const rows = data.today.visited.map(url => ({
        user_id: userId,
        url,
        visited_date: data.today.date,
      }));

      const { error } = await supabase!
        .from("visited_sites")
        .upsert(rows, { onConflict: "user_id,url,visited_date" });

      if (error) throw error;
    }

    // upsert all history entries — idempotent on re-run
    for (const entry of data.history) {
      await createHistory(entry);
    }
  }

  return {
    reset,
    getByDate,
    getHistoryAll,
    getHistoryByDate,
    getHistoryRange,
    getHistoryAllDates,
    clearHistory,
    markVisited,
    createHistory,
    serialize,
    hydrate,
  };
}
