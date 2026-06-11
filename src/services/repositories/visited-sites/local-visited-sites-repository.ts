// /src/services/repositories/visited-sites/local-visited-sites-repository.ts

import { useLocalStorage } from "@vueuse/core";

import { STORAGE_KEYS } from "@/constants/storage-keys";
import { todayIso } from "@/lib/time";
import type { VisitedSiteHistory, VisitedSites } from "@/types";

import type { VisitedSitesRepository } from "./visited-sites-repository";

type Params = {
  storageKey?: string;
  historyStorageKey?: string;
};

export function createLocalVisitedSitesRepository({
  storageKey = STORAGE_KEYS.VISITED_SITES,
  historyStorageKey = STORAGE_KEYS.VISITED_SITES_HISTORY,
}: Params = {}): VisitedSitesRepository {
  const visitedSites = useLocalStorage<VisitedSites>(
    storageKey,
    { date: todayIso(), visited: [] },
    { flush: "sync" },
  );

  const visitedSitesHistory = useLocalStorage<VisitedSiteHistory[]>(
    historyStorageKey,
    [],
    { flush: "sync" },
  );

  // state
  async function reset(): Promise<void> {
    visitedSites.value = { date: todayIso(), visited: [] };
  }

  // queries (visited sites)
  async function getByDate(dt: string): Promise<VisitedSites | null> {
    if (visitedSites.value.date === dt) return visitedSites.value;
    return null;
  }

  // queries (history)
  async function getHistoryAll(): Promise<VisitedSiteHistory[]> {
    return visitedSitesHistory.value;
  }

  async function getHistoryByDate(
    dt: string,
  ): Promise<VisitedSiteHistory | null> {
    return visitedSitesHistory.value.find(h => h.date === dt) ?? null;
  }

  async function getHistoryRange(
    from: string,
    to: string,
  ): Promise<VisitedSiteHistory[]> {
    return visitedSitesHistory.value
      .filter(h => h.date >= from && h.date <= to)
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async function getHistoryAllDates(): Promise<string[]> {
    return visitedSitesHistory.value
      .map(h => h.date)
      .sort((a, b) => a.localeCompare(b));
  }

  async function clearHistory(): Promise<void> {
    visitedSitesHistory.value = [];
  }

  // mutations (visited sites)
  async function markVisited(url: string): Promise<void> {
    const newSet = new Set(visitedSites.value.visited);
    newSet.add(url);
    visitedSites.value = { date: todayIso(), visited: Array.from(newSet) };
  }

  // mutations (history)
  async function createHistory(entry: VisitedSiteHistory): Promise<void> {
    const existing = await getHistoryByDate(entry.date);
    if (!existing) {
      visitedSitesHistory.value.push(entry);
    }
  }

  // export/import
  async function serialize(): Promise<{
    today: VisitedSites;
    history: VisitedSiteHistory[];
  }> {
    return {
      today: {
        date: visitedSites.value.date,
        visited: [...visitedSites.value.visited],
      },
      history: [...visitedSitesHistory.value],
    };
  }

  async function hydrate(data: {
    today: VisitedSites;
    history: VisitedSiteHistory[];
  }): Promise<void> {
    if (!data.today?.date || !Array.isArray(data.today.visited)) {
      throw new Error("Invalid VisitedSites format");
    }
    visitedSites.value = {
      date: data.today.date,
      visited: [...data.today.visited],
    };
    visitedSitesHistory.value = [...data.history];
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
