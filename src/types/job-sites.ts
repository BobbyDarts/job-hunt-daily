// /src/types/job-sites.ts

import type { ATSType } from "@/types";

export interface JobSite {
  id: string;
  name: string;
  url: string;
  categoryId: string;
  atsType?: ATSType;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type JobSiteCreateData = Omit<JobSite, "id" | "createdAt" | "updatedAt">;

export type JobSiteUpdateData = Partial<Omit<JobSite, "id" | "createdAt">>;

export type JobSiteDb = {
  id: string;
  user_id: string;
  name: string;
  url: string;
  category_id: string;
  ats_type?: ATSType;
  notes?: string;
  created_at: string;
  updated_at: string;
};

export interface JobCategory {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export type JobCategoryCreateData = Omit<
  JobCategory,
  "id" | "createdAt" | "updatedAt"
>;

export type JobCategoryUpdateData = Partial<
  Omit<JobCategory, "id" | "createdAt">
>;

export type JobCategoryDb = {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
};

export interface JobHuntData {
  categories: JobCategory[];
  sites: JobSite[];
}
