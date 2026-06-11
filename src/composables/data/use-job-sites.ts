// /src/composables/data/use-job-sites.ts

import { computed, ref } from "vue";

import { getJobSitesRepository } from "@/services/repositories/job-sites";
import type {
  JobCategory,
  JobCategoryCreateData,
  JobCategoryUpdateData,
  JobSite,
  JobSiteCreateData,
  JobSiteUpdateData,
} from "@/types";

export interface JobSiteWithCategory extends JobSite {
  category: string;
}

// singleton state
const sites = ref<JobSite[]>([]);
const categories = ref<JobCategory[]>([]);
const initialized = ref(false);

export function useJobSites() {
  async function refresh(): Promise<void> {
    const repo = getJobSitesRepository();
    const [_sites, _categories] = await Promise.all([
      repo.getSites(),
      repo.getCategories(),
    ]);
    sites.value = _sites;
    categories.value = _categories;
  }

  async function init(): Promise<void> {
    await refresh();
    initialized.value = true;
  }

  function assertInitialized() {
    if (!initialized.value) {
      throw new Error("useJobSites not initialized. Call init() first.");
    }
  }

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

  const categoryByName = computed(() => {
    const map = new Map<string, JobCategory>();
    categories.value.forEach(c => map.set(c.name.toLowerCase(), c));
    return map;
  });

  const allSitesWithCategory = computed((): JobSiteWithCategory[] =>
    sites.value.map(site => ({
      ...site,
      category: categoryById.value.get(site.categoryId)?.name ?? "",
    })),
  );

  const totalSites = computed(() => sites.value.length);

  function getSiteById(id: string): JobSite | undefined {
    assertInitialized();
    return siteById.value.get(id);
  }

  function getSiteByUrl(url: string): JobSite | undefined {
    assertInitialized();
    return siteByUrl.value.get(url);
  }

  function getCategoryById(id: string): JobCategory | undefined {
    assertInitialized();
    return categoryById.value.get(id);
  }

  function getCategoryByName(name: string): JobCategory | undefined {
    assertInitialized();
    return categoryByName.value.get(name.toLowerCase());
  }

  function getCategoryBySlug(name: string): JobCategory | undefined {
    assertInitialized();
    const slug =
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "unknown";
    return categoryById.value.get(slug);
  }

  function getSitesByCategory(categoryId: string): JobSite[] {
    assertInitialized();
    return sitesByCategory.value.get(categoryId) ?? [];
  }

  async function createSite(data: JobSiteCreateData): Promise<JobSite> {
    const repo = getJobSitesRepository();
    const created = await repo.createSite(data);
    await refresh();
    return getSiteById(created.id)!;
  }

  async function updateSite(
    id: string,
    updates: JobSiteUpdateData,
  ): Promise<JobSite | undefined> {
    const repo = getJobSitesRepository();
    const updated = await repo.updateSite(id, updates);
    await refresh();
    return getSiteById(updated.id);
  }

  async function removeSite(id: string): Promise<boolean> {
    const repo = getJobSitesRepository();
    await repo.removeSite(id);
    await refresh();
    return !sites.value.some(s => s.id === id);
  }

  async function createCategory(
    data: JobCategoryCreateData,
  ): Promise<JobCategory> {
    const repo = getJobSitesRepository();
    const created = await repo.createCategory(data);
    await refresh();
    return getCategoryById(created.id)!;
  }

  async function updateCategory(id: string, updates: JobCategoryUpdateData) {
    const repo = getJobSitesRepository();
    const updated = await repo.updateCategory(id, updates);
    await refresh();
    return getCategoryById(updated.id);
  }

  async function removeCategory(id: string): Promise<boolean> {
    const repo = getJobSitesRepository();
    await repo.removeCategory(id);
    await refresh();
    return !categories.value.some(c => c.id === id);
  }

  return {
    refresh,
    categories,
    sites,
    initialized,
    init,
    sitesByCategory,
    siteById,
    siteByUrl,
    allSitesWithCategory,
    totalSites,
    categoryById,
    categoryByName,
    getSiteById,
    getSiteByUrl,
    getCategoryById,
    getCategoryByName,
    getCategoryBySlug,
    getSitesByCategory,
    createSite,
    updateSite,
    removeSite,
    createCategory,
    updateCategory,
    removeCategory,
  };
}
