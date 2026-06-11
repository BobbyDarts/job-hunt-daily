// /src/services/repositories/visited-sites/create-visited-sites-repository.ts

import { createRepository } from "@/services/repositories/factory";

import { createLocalVisitedSitesRepository } from "./local-visited-sites-repository";
import { createSupabaseVisitedSitesRepository } from "./supabase-visited-sites-repository";
import type { VisitedSitesRepository } from "./visited-sites-repository";

let _repository: VisitedSitesRepository | null = null;

export function initVisitedSitesRepository(): void {
  _repository = createRepository({
    local: createLocalVisitedSitesRepository,
    supabase: createSupabaseVisitedSitesRepository,
  });
}

export function getVisitedSitesRepository(): VisitedSitesRepository {
  if (!_repository)
    throw new Error(
      "visitedSitesRepository not initialized — call initVisitedSitesRepository() first",
    );
  return _repository;
}
