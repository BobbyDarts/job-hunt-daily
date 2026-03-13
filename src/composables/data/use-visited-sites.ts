// /src/composables/data/use-visited-sites.ts

import { computed } from "vue";

import type { VisitedSites } from "@/types";

import type { UseVisitedSitesParams } from "./types";
import { useJobSites } from "./use-job-sites";
import { useVisitedSitesRepository } from "./use-visited-sites-repository";

export function useVisitedSites(params: UseVisitedSitesParams = {}) {
  const repo = useVisitedSitesRepository(params);
  const { totalSites } = useJobSites();

  const visitedSites = computed(() => new Set(repo.visitedData.value.visited));
  const visitedCount = computed(() => visitedSites.value.size);
  const isComplete = computed(
    () => totalSites.value > 0 && visitedCount.value === totalSites.value,
  );

  const isSiteVisited = (url: string) => visitedSites.value.has(url);

  const markVisited = async (url: string): Promise<void> => {
    await repo.markVisited(url);
  };

  const serialize = async (): Promise<VisitedSites> => {
    return repo.serialize();
  };

  const hydrate = async (data: VisitedSites): Promise<void> => {
    await repo.hydrate(data);
  };

  return {
    visitedSites,
    visitedCount,
    isComplete,
    markVisited,
    isSiteVisited,
    serialize,
    hydrate,
  };
}
