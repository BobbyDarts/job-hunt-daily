// /src/services/repositories/applications/create-applications-repository.ts

import { createRepository } from "@/services/repositories/factory";

import type { ApplicationsRepository } from "./applications-repository";
import { createLocalApplicationsRepository } from "./local-applications-repository";
import { createSupabaseApplicationsRepository } from "./supabase-applications-repository";

let _repository: ApplicationsRepository | null = null;

export function initApplicationsRepository(): void {
  _repository = createRepository({
    local: createLocalApplicationsRepository,
    supabase: createSupabaseApplicationsRepository,
  });
}

export function getApplicationsRepository(): ApplicationsRepository {
  if (!_repository)
    throw new Error(
      "applicationsRepository not initialized — call initApplicationsRepository() first",
    );
  return _repository;
}
