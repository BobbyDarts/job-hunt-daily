// /src/composables/data/use-job-sites-repository.ts

import type { DataSourceParam } from "@/composables/types";
import jobData from "@/data/job-hunt-daily.json";
import type { JobHuntData } from "@/types";

export function useJobSitesRepository(params: DataSourceParam = {}) {
  const { data = jobData as JobHuntData } = params;

  async function getData(): Promise<JobHuntData> {
    return data;
  }

  return { getData };
}
