// /src/services/repositories/factory/resolve-mode.ts

import { STORAGE_KEYS } from "@/constants/storage-keys";
import type { RepositoryMode } from "@/services/repositories/types";

export function resolveRepositoryMode(): RepositoryMode {
  // User preference always wins
  const stored = localStorage.getItem(STORAGE_KEYS.APP_MODE);
  if (stored === "supabase") return "supabase";
  if (stored === "local") return "local";

  // No preference — fall back to env var
  if (import.meta.env.VITE_USE_SUPABASE === "true") return "supabase";

  return "local";
}
