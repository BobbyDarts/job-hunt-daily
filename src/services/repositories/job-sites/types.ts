// /src/services/repositories/job-sites/types.ts

import type { JobCategory, JobSite } from "@/types";

export type RepositoryState = {
  sites: JobSite[];
  categories: JobCategory[];
};
