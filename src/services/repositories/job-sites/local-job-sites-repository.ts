// /src/services/repositories/job-sites/local-job-sites-repository.ts

import { useLocalStorage } from "@vueuse/core";

import { STORAGE_KEYS } from "@/constants/storage-keys";
import jobData from "@/data/job-hunt-daily.json";
import { generateCategoryId, generateSiteId } from "@/lib/generate-id";
import { getNow } from "@/lib/time";
import type {
  JobCategory,
  JobCategoryCreateData,
  JobCategoryUpdateData,
  JobHuntData,
  JobSite,
  JobSiteCreateData,
  JobSiteUpdateData,
} from "@/types";

import type { JobSitesRepository } from "./job-sites-repository";
import type { RepositoryState } from "./types";

type Params = {
  storageKey?: string;
};

export function createLocalJobSitesRepository({
  storageKey = STORAGE_KEYS.JOB_SITES,
}: Params = {}): JobSitesRepository {
  const jobSites = useLocalStorage<JobHuntData>(
    storageKey,
    () => jobData as JobHuntData,
  );

  // state hydration
  async function setState(data: RepositoryState): Promise<void> {
    jobSites.value = data;
  }

  // queries (sites)
  async function getSites(): Promise<JobSite[]> {
    return jobSites.value.sites;
  }

  async function getSiteById(id: string): Promise<JobSite | null> {
    return jobSites.value.sites.find(s => s.id === id) ?? null;
  }

  // mutations (sites)
  async function createSite(data: JobSiteCreateData): Promise<JobSite> {
    const now = getNow().toString();
    const jobSite: JobSite = {
      ...data,
      id: generateSiteId(data.name, data.url, data.atsType),
      createdAt: now,
      updatedAt: now,
    };

    jobSites.value = {
      ...jobSites.value,
      sites: [...jobSites.value.sites, jobSite],
    };

    return jobSite;
  }

  async function updateSite(
    id: string,
    updates: JobSiteUpdateData,
  ): Promise<JobSite> {
    const existing = await getSiteById(id);
    if (!existing) throw new Error(`Site with id ${id} not found`);

    const updated: JobSite = {
      ...existing,
      ...updates,
      updatedAt: getNow().toString(),
    };

    const sites = [...jobSites.value.sites];
    const index = sites.findIndex(s => s.id === id);
    sites[index] = updated;
    jobSites.value = { ...jobSites.value, sites };

    return updated;
  }

  async function removeSite(id: string): Promise<void> {
    const existing = await getSiteById(id);
    if (!existing) throw new Error(`Site with id ${id} not found`);

    jobSites.value = {
      ...jobSites.value,
      sites: jobSites.value.sites.filter(s => s.id !== id),
    };
  }

  // queries (categories)
  async function getCategories(): Promise<JobCategory[]> {
    return jobSites.value.categories;
  }

  async function getCategoryById(id: string): Promise<JobCategory | null> {
    return jobSites.value.categories.find(c => c.id === id) ?? null;
  }

  // mutations (categories)
  async function createCategory(
    data: JobCategoryCreateData,
  ): Promise<JobCategory> {
    const now = getNow().toString();

    const existingIds = new Set((await getCategories()).map(c => c.id));
    const category: JobCategory = {
      ...data,
      id: generateCategoryId(data.name, existingIds),
      createdAt: now,
      updatedAt: now,
    };
    jobSites.value = {
      ...jobSites.value,
      categories: [...jobSites.value.categories, category],
    };

    return category;
  }

  async function updateCategory(
    id: string,
    updates: JobCategoryUpdateData,
  ): Promise<JobCategory> {
    const existing = await getCategoryById(id);
    if (!existing) throw new Error(`Category with id ${id} not found`);

    const updated: JobCategory = {
      ...existing,
      ...updates,
      updatedAt: getNow().toString(),
    };

    const categories = [...jobSites.value.categories];
    const index = categories.findIndex(c => c.id === id);
    categories[index] = updated;
    jobSites.value = { ...jobSites.value, categories };

    return updated;
  }

  async function removeCategory(id: string): Promise<void> {
    const existing = await getCategoryById(id);
    if (!existing) throw new Error(`Category with id ${id} not found`);

    jobSites.value = {
      ...jobSites.value,
      categories: jobSites.value.categories.filter(c => c.id !== id),
      sites: jobSites.value.sites.filter(s => s.categoryId !== id),
    };
  }

  return {
    // state hydration
    setState,

    // queries (sites)
    getSites,
    getSiteById,

    // mutations (sites)
    createSite,
    updateSite,
    removeSite,

    // queries (categories)
    getCategories,
    getCategoryById,

    // mutations (categories)
    createCategory,
    updateCategory,
    removeCategory,
  };
}
