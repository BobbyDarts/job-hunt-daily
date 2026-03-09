// src/composables/use-job-data.ts
import { useJobSites } from "@/composables/use-job-sites";
import jobData from "@/data/job-hunt-daily.json";
import type { JobHuntData } from "@/types";

const data = jobData as JobHuntData;
const instance = useJobSites(data);

export function useJobData() {
  return {
    data,
    ...instance,
  };
}
