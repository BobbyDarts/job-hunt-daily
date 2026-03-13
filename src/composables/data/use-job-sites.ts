// /src/composables/data/use-job-sites.ts

import { computed, ref } from "vue";

import type { DataSourceParam } from "@/composables/types";
import type { JobHuntData, JobSite } from "@/types";

import { useJobSitesRepository } from "./use-job-sites-repository";

interface JobSiteWithCategory extends JobSite {
  category: string;
}

export function useJobSites(params: DataSourceParam = {}) {
  const repo = useJobSitesRepository(params);
  const data = ref<JobHuntData | null>(null);

  void repo.getData().then(d => {
    data.value = d;
  });

  const siteById = computed(() => {
    const map = new Map<string, JobSite>();
    data.value?.categories.forEach(category => {
      category.sites.forEach(site => map.set(site.id, site));
    });
    return map;
  });

  const siteByUrl = computed(() => {
    const map = new Map<string, JobSite>();
    data.value?.categories.forEach(category => {
      category.sites.forEach(site => map.set(site.url, site));
    });
    return map;
  });

  const getSiteById = (id: string): JobSite | undefined =>
    siteById.value.get(id);
  const getSiteByUrl = (url: string): JobSite | undefined =>
    siteByUrl.value.get(url);

  const allSitesWithCategory = computed((): JobSiteWithCategory[] => {
    return (
      data.value?.categories.flatMap(category =>
        category.sites.map(site => ({ ...site, category: category.name })),
      ) ?? []
    );
  });

  const totalSites = computed(
    () =>
      data.value?.categories.reduce((sum, cat) => sum + cat.sites.length, 0) ??
      0,
  );

  const categories = computed(() => data.value?.categories ?? []);

  return {
    categories,
    siteById,
    siteByUrl,
    getSiteById,
    getSiteByUrl,
    allSitesWithCategory,
    totalSites,
  };
}
