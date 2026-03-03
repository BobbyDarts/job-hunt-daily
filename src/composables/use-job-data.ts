// src/composables/use-job-data.ts
import jobData from "@/data/job-hunt-daily.json";
import type { JobHuntData } from "@/types";

import { useJobSites } from "./use-job-sites";

const data = jobData as JobHuntData;
const instance = useJobSites(data);

export function useJobData() {
  return {
    data,
    ...instance,
  };
}
