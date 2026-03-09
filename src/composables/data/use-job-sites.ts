// /src/composables/data/use-job-sites.ts

import { computed } from "vue";

import type { JobHuntData, JobSite } from "@/types";

export interface JobSiteWithCategory extends JobSite {
  category: string;
}

/**
 * Composable for working with job sites
 * Provides lookup by ID and URL
 */
export function useJobSites(data: JobHuntData) {
  // Create a map of ID -> JobSite for quick lookups
  const siteById = computed(() => {
    const map = new Map<string, JobSite>();
    data.categories.forEach(category => {
      category.sites.forEach(site => {
        map.set(site.id, site);
      });
    });
    return map;
  });

  // Create a map of URL -> JobSite for backwards compatibility
  const siteByUrl = computed(() => {
    const map = new Map<string, JobSite>();
    data.categories.forEach(category => {
      category.sites.forEach(site => {
        map.set(site.url, site);
      });
    });
    return map;
  });

  // Get site by ID
  const getSiteById = (id: string): JobSite | undefined => {
    return siteById.value.get(id);
  };

  // Get site by URL (for backwards compatibility)
  const getSiteByUrl = (url: string): JobSite | undefined => {
    return siteByUrl.value.get(url);
  };

  const allSitesWithCategory = computed((): JobSiteWithCategory[] => {
    return data.categories.flatMap(category =>
      category.sites.map(site => ({
        ...site,
        category: category.name,
      })),
    );
  });

  const totalSites = computed(() =>
    data.categories.reduce((sum, cat) => sum + cat.sites.length, 0),
  );

  return {
    siteById,
    siteByUrl,
    getSiteById,
    getSiteByUrl,
    allSitesWithCategory,
    totalSites,
  };
}
