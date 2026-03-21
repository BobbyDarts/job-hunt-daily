// /src/composables/data/use-job-sites.ts

import { computed } from "vue";

import type { JobCategory, JobSite } from "@/types";

import { useJobSitesRepository } from "./use-job-sites-repository";

interface UseJobSitesRepositoryParams {
  storageKey?: string;
}

export interface JobSiteWithCategory extends JobSite {
  category: string;
}

export function useJobSites(params: UseJobSitesRepositoryParams = {}) {
  // composables
  const repo = useJobSitesRepository(params);

  // computeds
  const categories = computed(() => repo.jobHuntData.value.categories);

  const sites = computed(() => repo.jobHuntData.value.sites);

  const sitesByCategory = computed(() => {
    const map = new Map<string, JobSite[]>();
    categories.value.forEach(c => map.set(c.id, []));
    sites.value.forEach(site => {
      const bucket = map.get(site.categoryId);
      if (bucket) bucket.push(site);
    });
    return map;
  });

  const siteById = computed(() => {
    const map = new Map<string, JobSite>();
    sites.value.forEach(site => map.set(site.id, site));
    return map;
  });

  const siteByUrl = computed(() => {
    const map = new Map<string, JobSite>();
    sites.value.forEach(site => map.set(site.url, site));
    return map;
  });

  const categoryById = computed(() => {
    const map = new Map<string, JobCategory>();
    categories.value.forEach(c => map.set(c.id, c));
    return map;
  });

  const allSitesWithCategory = computed((): JobSiteWithCategory[] =>
    sites.value.map(site => ({
      ...site,
      category: categoryById.value.get(site.categoryId)?.name ?? "",
    })),
  );

  const totalSites = computed(() => sites.value.length);

  // getters
  const getSiteById = (id: string): JobSite | undefined =>
    siteById.value.get(id);

  const getSiteByUrl = (url: string): JobSite | undefined =>
    siteByUrl.value.get(url);

  const getCategoryById = (id: string): JobCategory | undefined =>
    categoryById.value.get(id);

  const getSitesByCategory = (categoryId: string): JobSite[] =>
    sitesByCategory.value.get(categoryId) ?? [];

  // CRUD — Sites
  const addSite = (data: Omit<JobSite, "id">) => repo.createSite(data);

  const updateSite = (id: string, updates: Partial<Omit<JobSite, "id">>) =>
    repo.updateSite(id, updates);

  const deleteSite = (id: string) => repo.removeSite(id);

  // CRUD — Categories
  const addCategory = (data: Omit<JobCategory, "id">) =>
    repo.createCategory(data);

  const updateCategory = (
    id: string,
    updates: Partial<Omit<JobCategory, "id">>,
  ) => repo.updateCategory(id, updates);

  const deleteCategory = (id: string) => repo.removeCategory(id);

  // Bulk
  const setAll = (data: Parameters<typeof repo.setAll>[0]) => repo.setAll(data);

  return {
    // Computeds
    categories,
    sites,
    sitesByCategory,
    siteById,
    siteByUrl,
    categoryById,
    allSitesWithCategory,
    totalSites,
    // Lookups
    getSiteById,
    getSiteByUrl,
    getCategoryById,
    getSitesByCategory,
    // CRUD — Sites
    addSite,
    updateSite,
    deleteSite,
    // CRUD — Categories
    addCategory,
    updateCategory,
    deleteCategory,
    // Bulk
    setAll,
  };
}
