// /src/composables/data/use-visited-sites.ts

import { useWindowFocus, watchDebounced } from "@vueuse/core";
import { computed, ref } from "vue";

import { isSameDayIso, todayIso } from "@/lib/time";
import { getVisitedSitesRepository } from "@/services/repositories/visited-sites";
import type { VisitedSiteHistory, VisitedSites } from "@/types";

import { useJobSites } from "./use-job-sites";

// singleton state
const today = ref<VisitedSites>({ date: todayIso(), visited: [] });
const history = ref<VisitedSiteHistory[]>([]);
const initialized = ref(false);

export function useVisitedSites() {
  const { totalSites } = useJobSites();

  async function refresh(): Promise<void> {
    const repo = getVisitedSitesRepository();
    const [todayData, historyData] = await Promise.all([
      repo.getByDate(todayIso()),
      repo.getHistoryAll(),
    ]);
    today.value = todayData ?? { date: todayIso(), visited: [] };
    history.value = historyData;
  }

  async function init(): Promise<void> {
    await refresh();

    if (!isSameDayIso(today.value.date)) {
      await snapshotAndReset();
    }

    const needsReset = computed(() => !isSameDayIso(today.value.date));

    watchDebounced(
      needsReset,
      async shouldReset => {
        if (shouldReset) await snapshotAndReset();
      },
      { debounce: 100, immediate: true },
    );

    const focused = useWindowFocus();

    watchDebounced(
      focused,
      async isFocused => {
        if (isFocused && !isSameDayIso(today.value.date)) {
          await snapshotAndReset();
        }
      },
      { debounce: 100 },
    );

    initialized.value = true;
  }

  function assertInitialized(): void {
    if (!initialized.value) {
      throw new Error("useVisitedSites not initialized. Call init() first.");
    }
  }

  async function snapshotAndReset(): Promise<void> {
    const repo = getVisitedSitesRepository();
    if (today.value.visited.length > 0) {
      await repo.createHistory({
        date: today.value.date,
        visitedUrls: [...today.value.visited],
        totalSites: totalSites.value,
      });
    }
    await repo.reset();
    await refresh();
  }

  async function markVisited(url: string): Promise<void> {
    assertInitialized();
    const repo = getVisitedSitesRepository();
    await repo.markVisited(url);
    await refresh();
  }

  function isSiteVisited(url: string): boolean {
    assertInitialized();
    return visitedSites.value.has(url);
  }

  const visitedSites = computed(() => new Set(today.value.visited));
  const visitedCount = computed(() => visitedSites.value.size);
  const isComplete = computed(
    () => totalSites.value > 0 && visitedCount.value === totalSites.value,
  );

  async function serialize(): Promise<{
    today: VisitedSites;
    history: VisitedSiteHistory[];
  }> {
    assertInitialized();
    const repo = getVisitedSitesRepository();
    return repo.serialize();
  }

  async function hydrate(data: {
    today: VisitedSites;
    history: VisitedSiteHistory[];
  }): Promise<void> {
    assertInitialized();
    const repo = getVisitedSitesRepository();
    await repo.hydrate(data);
    await refresh();
  }

  return {
    refresh,
    today,
    history,
    initialized,
    init,
    markVisited,
    isSiteVisited,
    visitedSites,
    visitedCount,
    isComplete,
    serialize,
    hydrate,
  };
}
