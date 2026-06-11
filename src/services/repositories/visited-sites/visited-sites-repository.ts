// /src/services/repositories/visited-sites/visited-sites-repository.ts

import type { VisitedSiteHistory, VisitedSites } from "@/types";

export interface VisitedSitesRepository {
  // state
  reset(): Promise<void>;

  // queries (visited sites)
  getByDate(dt: string): Promise<VisitedSites | null>;

  // queries (history)
  getHistoryAll(): Promise<VisitedSiteHistory[]>;
  getHistoryByDate(dt: string): Promise<VisitedSiteHistory | null>;
  getHistoryRange(from: string, to: string): Promise<VisitedSiteHistory[]>;
  getHistoryAllDates(): Promise<string[]>;
  clearHistory(): Promise<void>;

  // mutations (visited sites)
  markVisited(url: string): Promise<void>;

  // mutations (history)
  createHistory(entry: VisitedSiteHistory): Promise<void>;

  // export/import
  serialize(): Promise<{ today: VisitedSites; history: VisitedSiteHistory[] }>;
  hydrate(data: {
    today: VisitedSites;
    history: VisitedSiteHistory[];
  }): Promise<void>;
}
