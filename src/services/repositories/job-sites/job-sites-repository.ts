// /src/services/repositories/job-sites/job-sites-repository.ts

import type {
  JobCategory,
  JobCategoryCreateData,
  JobCategoryUpdateData,
  JobSite,
  JobSiteCreateData,
  JobSiteUpdateData,
} from "@/types";

import type { RepositoryState } from "./types";

export interface JobSitesRepository {
  // state hydration
  setState(state: RepositoryState): Promise<void>;

  // queries (sites)
  getSites(): Promise<JobSite[]>;
  getSiteById(id: string): Promise<JobSite | null>;

  // mutations (sites)
  createSite(data: JobSiteCreateData): Promise<JobSite>;
  updateSite(id: string, updates: JobSiteUpdateData): Promise<JobSite>;
  removeSite(id: string): Promise<void>;

  // queries (categories)
  getCategories(): Promise<JobCategory[]>;
  getCategoryById(id: string): Promise<JobCategory | null>;

  // mutations (categories)
  createCategory(data: JobCategoryCreateData): Promise<JobCategory>;
  updateCategory(
    id: string,
    updates: JobCategoryUpdateData,
  ): Promise<JobCategory>;
  removeCategory(id: string): Promise<void>;
}
