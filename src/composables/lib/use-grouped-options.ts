// /src/composables/lib/use-grouped-options.ts

import { computed, type Ref } from "vue";

export interface GroupableOption {
  value: string;
  label: string;
  category?: string;
  color?: string;
  description?: string;
}

export function useGroupedOptions<T extends GroupableOption>(
  getOptions: () => T[],
  config: {
    groupByCategory?: Ref<boolean> | boolean;
    searchQuery?: Ref<string>;
    sortWithin?: boolean;
  } = {},
) {
  const getGroupBy = () =>
    typeof config.groupByCategory === "object"
      ? config.groupByCategory.value
      : (config.groupByCategory ?? false);

  const filtered = computed(() => {
    const query = config.searchQuery?.value?.toLowerCase() ?? "";
    if (!query) return getOptions();
    return getOptions().filter(o => o.label.toLowerCase().includes(query));
  });

  const grouped = computed(() => {
    const opts = config.sortWithin
      ? [...filtered.value].sort((a, b) => a.label.localeCompare(b.label))
      : filtered.value;

    if (!getGroupBy()) {
      return [{ category: null as string | null, options: opts }];
    }

    const map = new Map<string, T[]>();
    for (const opt of opts) {
      const key = opt.category ?? "Other";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(opt);
    }

    return Array.from(map.entries()).map(([category, options]) => ({
      category,
      options,
    }));
  });

  const isEmpty = computed(() =>
    grouped.value.every(g => g.options.length === 0),
  );

  const selectedCountByCategory = (isSelected: (val: string) => boolean) =>
    computed(() =>
      Object.fromEntries(
        grouped.value.map(g => [
          g.category,
          g.options.filter(o => isSelected(o.value)).length,
        ]),
      ),
    );

  return { filtered, grouped, isEmpty, selectedCountByCategory };
}
