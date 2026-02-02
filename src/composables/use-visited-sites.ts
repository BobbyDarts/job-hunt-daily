import { useLocalStorage, watchDebounced, useWindowFocus } from "@vueuse/core";
import type { Ref } from "vue";
import { computed } from "vue";

import type { VisitedSites } from "@/types";

export function useVisitedSites(storageKey: string, totalSites: Ref<number>) {
  const getTodayDate = () => new Date().toISOString().split("T")[0];

  const storedData = useLocalStorage<VisitedSites>(storageKey, {
    date: getTodayDate(),
    visited: [],
  });

  const focused = useWindowFocus();

  const visitedSites = computed({
    get: () => new Set(storedData.value.visited),
    set: (newSet: Set<string>) => {
      storedData.value = {
        date: getTodayDate(),
        visited: Array.from(newSet),
      };
    },
  });

  const visitedCount = computed(() => visitedSites.value.size);
  const isComplete = computed(() => visitedCount.value === totalSites.value);

  const needsReset = computed(() => {
    const today = getTodayDate();
    return storedData.value.date !== today;
  });

  const resetData = () => {
    storedData.value = {
      date: getTodayDate(),
      visited: [],
    };
  };

  // Check immediately on initialization
  if (needsReset.value) {
    resetData();
  }

  // Auto-reset when day changes
  watchDebounced(
    needsReset,
    shouldReset => {
      if (shouldReset) {
        resetData();
      }
    },
    { debounce: 500 },
  );

  // Also check when window regains focus (catches overnight tabs)
  watchDebounced(
    focused,
    isFocused => {
      if (isFocused && needsReset.value) {
        resetData();
      }
    },
    { debounce: 300 },
  );

  const markVisited = (url: string) => {
    const newSet = new Set(storedData.value.visited);
    newSet.add(url);
    storedData.value = {
      date: getTodayDate(),
      visited: Array.from(newSet),
    };
  };

  const isSiteVisited = (url: string) => visitedSites.value.has(url);

  return {
    visitedSites,
    visitedCount,
    isComplete,
    markVisited,
    isSiteVisited,
  };
}
