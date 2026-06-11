// /src/types/storage.ts

export interface VisitedSites {
  date: string;
  visited: string[]; // array of site URLs
}

export interface VisitedSiteHistory {
  date: string;
  visitedUrls: string[];
  totalSites: number;
}
