// /src/services/repositories/job-sites/create-job-sites-repository.ts

import { createRepository } from "@/services/repositories/factory";

import type { JobSitesRepository } from "./job-sites-repository";
import { createLocalJobSitesRepository } from "./local-job-sites-repository";
import { createSupabaseJobSitesRepository } from "./supabase-job-sites-repository";

let _repository: JobSitesRepository | null = null;

export function initJobSitesRepository(): void {
  _repository = createRepository({
    local: createLocalJobSitesRepository,
    supabase: createSupabaseJobSitesRepository,
  });
}

export function getJobSitesRepository(): JobSitesRepository {
  if (!_repository)
    throw new Error(
      "jobSitesRepository not initialized — call initJobSitesRepository() first",
    );
  return _repository;
}
