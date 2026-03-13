// /src/composables/dashboard/use-category-progress.ts

import { computed } from "vue";

import { useJobSites, useVisitedSites } from "@/composables/data";
import type { DataSourceParam } from "@/composables/types";
import type { JobCategory } from "@/types";

type UseCategoryProgressParams = DataSourceParam & {
  isSiteVisited?: (url: string) => boolean;
};

export function useCategoryProgress(params: UseCategoryProgressParams = {}) {
  const { isSiteVisited: isSiteVisitedOverride, ...repoParams } = params;

  const { categories } = useJobSites(repoParams);
  const resolvedIsSiteVisited =
    isSiteVisitedOverride ?? useVisitedSites().isSiteVisited;

  const sortedCategories = computed(() =>
    [...categories.value]
      .map(category => ({
        ...category,
        sites: [...category.sites].sort((a, b) => a.name.localeCompare(b.name)),
      }))
      .sort((a, b) => b.sites.length - a.sites.length),
  );

  const categoryStats = computed(() => {
    return sortedCategories.value.map(category => {
      const visitedCount = category.sites.filter(site =>
        resolvedIsSiteVisited(site.url),
      ).length;

      return {
        category,
        visitedCount,
        progress: category.sites.length
          ? Math.round((visitedCount / category.sites.length) * 100)
          : 0,
      };
    });
  });

  const getCategoryStats = (category: JobCategory) => {
    return categoryStats.value.find(s => s.category.name === category.name);
  };

  const getCategoryProgress = (category: JobCategory) => {
    return getCategoryStats(category)?.progress ?? 0;
  };

  const getCategoryVisitedCount = (category: JobCategory) => {
    return getCategoryStats(category)?.visitedCount ?? 0;
  };

  const maxCategoryHeight = computed(() => {
    if (
      !categories.value.length ||
      !categories.value.some(cat => cat.sites.length > 0)
    ) {
      return 0;
    }

    const maxItems = Math.max(...categories.value.map(cat => cat.sites.length));
    return Math.min(maxItems, 6);
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
