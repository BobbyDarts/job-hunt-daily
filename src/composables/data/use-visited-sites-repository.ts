// /src/composables/data/use-visited-sites-repository.ts

import { useLocalStorage, useWindowFocus, watchDebounced } from "@vueuse/core";
import { computed } from "vue";

import { isSameDayIso, todayIso } from "@/lib/time";
import type { VisitedSites } from "@/types";

import { VISITED_SITES_STORAGE_KEY } from "./keys";
import type { UseVisitedSitesParams } from "./types";

export function useVisitedSitesRepository(params: UseVisitedSitesParams = {}) {
  const { storageKey = VISITED_SITES_STORAGE_KEY, skipInitReset = false } =
    params;

  const focused = useWindowFocus();
  const storedData = useLocalStorage<VisitedSites>(
    storageKey,
    { date: todayIso(), visited: [] },
    { flush: "sync" },
  );

  const needsReset = computed(() => !isSameDayIso(storedData.value.date));

  const reset = () => {
    storedData.value = { date: todayIso(), visited: [] };
  };

  if (!skipInitReset && needsReset.value) {
    reset();
  }

  let hydrating = false;

  watchDebounced(
    needsReset,
    shouldReset => {
      if (!hydrating && shouldReset) reset();
    },
    { debounce: 100 },
  );

  watchDebounced(
    focused,
    isFocused => {
      if (!hydrating && isFocused && needsReset.value) reset();
    },
    { debounce: 100 },
  );

  async function getAll(): Promise<VisitedSites> {
    return storedData.value;
  }

  async function markVisited(url: string): Promise<void> {
    const newSet = new Set(storedData.value.visited);
    newSet.add(url);
    storedData.value = { date: todayIso(), visited: Array.from(newSet) };
  }

  async function serialize(): Promise<VisitedSites> {
    return {
      date: storedData.value.date,
      visited: [...storedData.value.visited],
    };
  }

  async function hydrate(data: VisitedSites): Promise<void> {
    if (!data.date || !Array.isArray(data.visited)) {
      throw new Error("Invalid VisitedSites format");
    }

    hydrating = true;
    storedData.value = { date: data.date, visited: [...data.visited] };
    hydrating = false;
  }

  return { visitedData: storedData, getAll, markVisited, serialize, hydrate };
}
