// /src/types/job-sites.ts

import type { ATSType } from "@/types";

export interface JobSite {
  id: string; // generated via generateSiteId
  name: string;
  url: string;
  categoryId: string; // points to JobCategory.id
  atsType?: ATSType;
  notes?: string;
}

export interface JobCategory {
  id: string; // generated via generateCategoryId
  name: string;
  description?: string;
}

export interface JobHuntData {
  categories: JobCategory[];
  sites: JobSite[];
}
