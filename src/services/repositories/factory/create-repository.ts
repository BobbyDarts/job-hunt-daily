// /src/services/repositories/factory/create-repository.ts

import type { RepositoryMode } from "@/services/repositories/types";

import { resolveRepositoryMode } from "./resolve-mode";

export function createRepository<T>(
  factories: Record<RepositoryMode, () => T>,
): T {
  const mode = resolveRepositoryMode();
  return factories[mode]();
}
