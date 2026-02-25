// /src/types/job-sites.ts

import type { ATSType } from "./ats";

export interface JobSite {
  id: string;
  name: string;
  url: string;
  atsType?: ATSType;
}

export interface JobCategory {
  name: string;
  description?: string;
  sites: JobSite[];
}

export interface JobHuntData {
  categories: JobCategory[];
}
