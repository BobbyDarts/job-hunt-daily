import type { JobHuntData } from '@/types';
import { computed } from 'vue';

export function useCategoryProgress(data: JobHuntData, isSiteVisited: (url: string) => boolean) {
    const sortedCategories = computed(() =>
        [...data.categories].map(category => ({
            ...category,
            sites: [...category.sites].sort((a, b) => a.name.localeCompare(b.name))
        })).sort((a, b) => b.sites.length - a.sites.length)
    );

    const splitCategorySites = (category: typeof data.categories[0]) => {
        const unvisited = category.sites.filter(site => !isSiteVisited(site.url));
        const visited = category.sites.filter(site => isSiteVisited(site.url));
        return {
            unvisited: unvisited.sort((a, b) => a.name.localeCompare(b.name)),
            visited: visited.sort((a, b) => a.name.localeCompare(b.name))
        };
    };

    const getCategoryProgress = (category: typeof data.categories[0]) => {
        const visitedCount = category.sites.filter(site => isSiteVisited(site.url)).length;
        if (!category.sites.length) return 0;
        return Math.round((visitedCount / category.sites.length) * 100);
    };

    const getCategoryVisitedCount = (category: typeof data.categories[0]) =>
        category.sites.filter(site => isSiteVisited(site.url)).length;

    const maxCategoryHeight = computed(() => {
        const maxItems = Math.max(...data.categories.map(cat => cat.sites.length));
        return Math.min(maxItems, 6);
    });

    return { sortedCategories, splitCategorySites, getCategoryProgress, getCategoryVisitedCount, maxCategoryHeight };
}
