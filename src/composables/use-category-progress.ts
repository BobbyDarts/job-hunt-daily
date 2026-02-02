import { computed } from "vue";

import type { JobCategory, JobHuntData } from "@/types";

export function useCategoryProgress(
  data: JobHuntData,
  isSiteVisited: (url: string) => boolean,
) {
  const sortedCategories = computed(() =>
    [...data.categories]
      .map(category => ({
        ...category,
        sites: [...category.sites].sort((a, b) => a.name.localeCompare(b.name)),
      }))
      .sort((a, b) => b.sites.length - a.sites.length),
  );

  // Cache category stats to avoid recalculating
  const categoryStats = computed(() => {
    return sortedCategories.value.map(category => {
      const visited = category.sites.filter(site => isSiteVisited(site.url));
      const unvisited = category.sites.filter(site => !isSiteVisited(site.url));

      return {
        category,
        visited: visited.sort((a, b) => a.name.localeCompare(b.name)),
        unvisited: unvisited.sort((a, b) => a.name.localeCompare(b.name)),
        visitedCount: visited.length,
        progress: category.sites.length
          ? Math.round((visited.length / category.sites.length) * 100)
          : 0,
      };
    });
  });

  // Now these become lookups instead of recalculations
  const getCategoryStats = (category: JobCategory) => {
    return categoryStats.value.find(s => s.category.name === category.name);
  };

  const splitCategorySites = (category: JobCategory) => {
    const stats = getCategoryStats(category);
    return stats
      ? { unvisited: stats.unvisited, visited: stats.visited }
      : { unvisited: [], visited: [] };
  };

  const getCategoryProgress = (category: JobCategory) => {
    return getCategoryStats(category)?.progress ?? 0;
  };

  const getCategoryVisitedCount = (category: JobCategory) => {
    return getCategoryStats(category)?.visitedCount ?? 0;
  };

  const maxCategoryHeight = computed(() => {
    if (
      !data.categories.length ||
      !data.categories.some(cat => cat.sites.length > 0)
    ) {
      return 0;
    }

    const maxItems = Math.max(...data.categories.map(cat => cat.sites.length));
    return Math.min(maxItems, 6);
  });

  return {
    sortedCategories,
    categoryStats,
    splitCategorySites,
    getCategoryProgress,
    getCategoryStats,
    getCategoryVisitedCount,
    maxCategoryHeight,
  };
}
