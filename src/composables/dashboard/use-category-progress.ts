// /src/composables/dashboard/use-category-progress.ts

import { computed } from "vue";

import { useJobSites, useVisitedSites } from "@/composables/data";
import type { JobCategory } from "@/types";

interface UseCategoryProgressParams {
  storageKey?: string;
  isSiteVisited?: (url: string) => boolean;
}

export function useCategoryProgress(params: UseCategoryProgressParams = {}) {
  const { isSiteVisited: isSiteVisitedOverride, storageKey } = params;

  const { categories, getSitesByCategory } = useJobSites({ storageKey });
  const resolvedIsSiteVisited =
    isSiteVisitedOverride ?? useVisitedSites().isSiteVisited;

  const sortedCategories = computed(() =>
    [...categories.value].sort(
      (a, b) =>
        getSitesByCategory(b.id).length - getSitesByCategory(a.id).length,
    ),
  );

  const categoryStats = computed(() =>
    sortedCategories.value.map(category => {
      const sites = getSitesByCategory(category.id);
      const sortedSites = [...sites].sort((a, b) =>
        a.name.localeCompare(b.name),
      );
      const visitedCount = sortedSites.filter(site =>
        resolvedIsSiteVisited(site.url),
      ).length;

      return {
        category,
        sites: sortedSites,
        visitedCount,
        progress: sortedSites.length
          ? Math.round((visitedCount / sortedSites.length) * 100)
          : 0,
      };
    }),
  );

  const getCategoryStats = (category: JobCategory) =>
    categoryStats.value.find(s => s.category.id === category.id);

  const getCategoryProgress = (category: JobCategory) =>
    getCategoryStats(category)?.progress ?? 0;

  const getCategoryVisitedCount = (category: JobCategory) =>
    getCategoryStats(category)?.visitedCount ?? 0;

  const maxCategoryHeight = computed(() => {
    if (!categories.value.length) return 0;
    const maxItems = Math.max(
      ...categories.value.map(c => getSitesByCategory(c.id).length),
    );
    return maxItems > 0 ? Math.min(maxItems, 6) : 0;
  });

  return {
    sortedCategories,
    categoryStats,
    getCategoryProgress,
    getCategoryStats,
    getCategoryVisitedCount,
    maxCategoryHeight,
  };
}
