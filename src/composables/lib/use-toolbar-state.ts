// /src/composables/lib/use-toolbar-state.ts

import { computed } from "vue";

type FilterValue = string | unknown[] | undefined | null;

export function useToolbarState<TFilters extends Record<string, FilterValue>>(
  filters: TFilters,
) {
  const hasActiveFilters = computed(() =>
    Object.values(filters).some(v => {
      if (Array.isArray(v)) return v.length > 0;
      return v !== undefined && v !== null && v !== "" && v !== "all";
    }),
  );

  function clear() {
    (Object.keys(filters) as (keyof TFilters)[]).forEach(key => {
      const value = filters[key];

      if (Array.isArray(value)) {
        filters[key] = [] as unknown as TFilters[typeof key];
      } else {
        filters[key] = "" as TFilters[typeof key];
      }
    });
  }

  return {
    hasActiveFilters,
    clear,
  };
}
