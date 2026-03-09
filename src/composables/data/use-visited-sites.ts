// /src/composables/data/use-visited-sites.ts

import { useLocalStorage, useWindowFocus, watchDebounced } from "@vueuse/core";
import { computed } from "vue";

import { VISITED_SITES_STORAGE_KEY } from "@/composables/keys";
import { isSameDayIso, todayIso } from "@/lib/time";
import type { VisitedSites } from "@/types";

import { useJobData } from "./use-job-data";

type UseVisitedSitesParams = {
  storageKey?: string;
  skipInitReset?: boolean;
};

export function useVisitedSites(params: UseVisitedSitesParams = {}) {
  const { storageKey = VISITED_SITES_STORAGE_KEY, skipInitReset = false } =
    params;

  // composables
  const focused = useWindowFocus();
  const storedData = useLocalStorage<VisitedSites>(
    storageKey,
    {
      date: todayIso(),
      visited: [],
    },
    { flush: "sync" },
  );

  const { totalSites } = useJobData();

  const visitedSites = computed({
    get: () => new Set(storedData.value.visited),
    set: (newSet: Set<string>) => {
      storedData.value = {
        ...storedData.value,
        visited: Array.from(newSet),
      };
    },
  });

  const visitedCount = computed(() => visitedSites.value.size);
  const isComplete = computed(
    () => totalSites.value > 0 && visitedCount.value === totalSites.value,
  );

  const needsReset = computed(() => !isSameDayIso(storedData.value.date));
  const resetData = () => {
    storedData.value = {
      date: todayIso(),
      visited: [],
    };
  };

  // **Optional immediate reset on init**
  if (!skipInitReset && needsReset.value) {
    resetData();
  }

  // Auto-reset when day changes
  let hydrating = false;

  watchDebounced(
    needsReset,
    shouldReset => {
      if (!hydrating && shouldReset) resetData();
    },
    { debounce: 100 },
  );

  watchDebounced(
    focused,
    isFocused => {
      if (!hydrating && isFocused && needsReset.value) resetData();
    },
    { debounce: 100 },
  );

  const markVisited = (url: string) => {
    const newSet = new Set(storedData.value.visited);
    newSet.add(url);

    storedData.value = {
      date: todayIso(),
      visited: Array.from(newSet),
    };
  };

  const isSiteVisited = (url: string) => visitedSites.value.has(url);

  const serialize = (): VisitedSites => ({
    date: storedData.value.date,
    visited: [...storedData.value.visited],
  });

  const hydrate = (data: VisitedSites) => {
    if (!data.date || !Array.isArray(data.visited)) {
      throw new Error("Invalid VisitedSites format");
    }

    // Temporarily stop watchers during hydration
    hydrating = true;

    storedData.value = {
      date: data.date,
      visited: [...data.visited],
    };

    // restart original watchers
    hydrating = false;
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
