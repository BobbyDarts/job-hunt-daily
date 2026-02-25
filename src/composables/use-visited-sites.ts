// /src/composables/use-visited-sites.ts

import { useLocalStorage, watchDebounced, useWindowFocus } from "@vueuse/core";
import type { Ref } from "vue";
import { computed } from "vue";

import { isSameDayIso, todayIso } from "@/lib/time";
import type { VisitedSites } from "@/types";

import { VISITED_SITES_STORAGE_KEY } from "./keys";

type UseVisitedSitesParams = {
  storageKey?: string;
  totalSites: Ref<number>;
  skipInitReset?: boolean;
};

export function useVisitedSites(params: UseVisitedSitesParams) {
  const {
    storageKey = VISITED_SITES_STORAGE_KEY,
    totalSites,
    skipInitReset = false,
  } = params;

  const storedData = useLocalStorage<VisitedSites>(
    storageKey,
    {
      date: todayIso(),
      visited: [],
    },
    { flush: "sync" },
  );

  const focused = useWindowFocus();

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
  const unwatchReset = watchDebounced(
    needsReset,
    shouldReset => {
      if (shouldReset) resetData();
    },
    { debounce: 100 },
  );

  // Also check when window regains focus (catches overnight tabs)
  const unwatchFocus = watchDebounced(
    focused,
    isFocused => {
      if (isFocused && needsReset.value) resetData();
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
    unwatchReset();
    unwatchFocus();

    storedData.value = {
      date: data.date,
      visited: [...data.visited],
    };

    // restart original watchers
    unwatchReset();
    unwatchFocus();
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
