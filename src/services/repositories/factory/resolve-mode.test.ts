// /src/services/repositories/factory/resolve-mode.test.ts

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";

import { resolveRepositoryMode } from "./resolve-mode";

describe("resolveRepositoryMode", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    localStorage.clear();
  });

  describe("user preference takes priority", () => {
    it("returns local when preference is local, even if env wants supabase", () => {
      vi.stubEnv("VITE_USE_SUPABASE", "true");
      localStorage.setItem("job-hunt-mode", "local");
      expect(resolveRepositoryMode()).toBe("local");
    });

    it("returns supabase when preference is supabase, even if env is unset", () => {
      vi.stubEnv("VITE_USE_SUPABASE", "");
      localStorage.setItem("job-hunt-mode", "supabase");
      expect(resolveRepositoryMode()).toBe("supabase");
    });
  });

  describe("env var fallback when no preference set", () => {
    it("returns supabase when VITE_USE_SUPABASE=true", () => {
      vi.stubEnv("VITE_USE_SUPABASE", "true");
      expect(resolveRepositoryMode()).toBe("supabase");
    });

    it("returns local when VITE_USE_SUPABASE is unset", () => {
      vi.stubEnv("VITE_USE_SUPABASE", "");
      expect(resolveRepositoryMode()).toBe("local");
    });
  });
});
