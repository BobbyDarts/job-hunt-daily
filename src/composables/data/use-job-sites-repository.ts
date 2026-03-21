// /src/composables/data/use-job-sites-repository.ts

import { useLocalStorage } from "@vueuse/core";

import jobData from "@/data/job-hunt-daily.json";
import { generateCategoryId, generateSiteId } from "@/lib/generate-id";
import type { JobCategory, JobHuntData, JobSite } from "@/types";

import { JOB_SITES_STORAGE_KEY } from "./keys";

interface UseJobSitesRepositoryParams {
  storageKey?: string;
}

export function useJobSitesRepository(
  params: UseJobSitesRepositoryParams = {},
) {
  const { storageKey = JOB_SITES_STORAGE_KEY } = params;

  const jobHuntData = useLocalStorage<JobHuntData>(storageKey, () => {
    // Seed from JSON on first load
    return jobData as JobHuntData;
  });

  // -------------------------
  // Sites
  // -------------------------

  async function getSites(): Promise<JobSite[]> {
    return jobHuntData.value.sites;
  }

  async function getSiteById(id: string): Promise<JobSite | null> {
    return jobHuntData.value.sites.find(s => s.id === id) ?? null;
  }

  async function createSite(data: Omit<JobSite, "id">): Promise<JobSite> {
    const id = generateSiteId(data.name, data.url, data.atsType);
    const site: JobSite = { ...data, id };
    jobHuntData.value = {
      ...jobHuntData.value,
      sites: [...jobHuntData.value.sites, site],
    };
    return site;
  }

  async function updateSite(
    id: string,
    updates: Partial<Omit<JobSite, "id">>,
  ): Promise<JobSite | null> {
    const index = jobHuntData.value.sites.findIndex(s => s.id === id);
    if (index === -1) return null;

    const updated = { ...jobHuntData.value.sites[index], ...updates };
    const sites = [...jobHuntData.value.sites];
    sites[index] = updated;
    jobHuntData.value = { ...jobHuntData.value, sites };
    return updated;
  }

  async function removeSite(id: string): Promise<boolean> {
    const exists = jobHuntData.value.sites.some(s => s.id === id);
    if (!exists) return false;

    jobHuntData.value = {
      ...jobHuntData.value,
      sites: jobHuntData.value.sites.filter(s => s.id !== id),
    };
    return true;
  }

  // -------------------------
  // Categories
  // -------------------------

  async function getCategories(): Promise<JobCategory[]> {
    return jobHuntData.value.categories;
  }

  async function getCategoryById(id: string): Promise<JobCategory | null> {
    return jobHuntData.value.categories.find(c => c.id === id) ?? null;
  }

  async function createCategory(
    data: Omit<JobCategory, "id">,
  ): Promise<JobCategory> {
    const id = generateCategoryId(data.name);
    const category: JobCategory = { ...data, id };
    jobHuntData.value = {
      ...jobHuntData.value,
      categories: [...jobHuntData.value.categories, category],
    };
    return category;
  }

  async function updateCategory(
    id: string,
    updates: Partial<Omit<JobCategory, "id">>,
  ): Promise<JobCategory | null> {
    const index = jobHuntData.value.categories.findIndex(c => c.id === id);
    if (index === -1) return null;

    const updated = { ...jobHuntData.value.categories[index], ...updates };
    const categories = [...jobHuntData.value.categories];
    categories[index] = updated;
    jobHuntData.value = { ...jobHuntData.value, categories };
    return updated;
  }

  async function removeCategory(id: string): Promise<boolean> {
    const exists = jobHuntData.value.categories.some(c => c.id === id);
    if (!exists) return false;

    jobHuntData.value = {
      ...jobHuntData.value,
      categories: jobHuntData.value.categories.filter(c => c.id !== id),
      sites: jobHuntData.value.sites.filter(s => s.categoryId !== id),
    };
    return true;
  }

  // -------------------------
  // Bulk
  // -------------------------

  async function setAll(data: JobHuntData): Promise<void> {
    jobHuntData.value = data;
  }

  return {
    jobHuntData,
    getSites,
    getSiteById,
    createSite,
    updateSite,
    removeSite,
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    removeCategory,
    setAll,
  };
}
