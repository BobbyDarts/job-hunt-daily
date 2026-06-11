// /src/services/repositories/job-sites/supabase-job-sites-repository.test.ts

import { describe, it, expect, beforeEach, vi } from "vitest";

import { getCurrentUserId } from "@/services/supabase/auth";
import { supabase } from "@/services/supabase/client";
import { withFrozenTime } from "@/test-utils/with-frozen-time";
import type { JobCategoryDb, JobSiteDb } from "@/types";

import { createSupabaseJobSitesRepository } from "./supabase-job-sites-repository";

vi.mock("@/services/supabase/auth", () => ({
  getCurrentUserId: vi.fn().mockResolvedValue("user-123"),
}));

vi.mock("@/services/supabase/client", () => ({
  supabase: { from: vi.fn() },
}));

const mockGetCurrentUserId = vi.mocked(getCurrentUserId);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockFrom = vi.mocked(supabase!.from) as unknown as any;

function makeDbSite(overrides: Partial<JobSiteDb> = {}): JobSiteDb {
  return {
    id: "site-1",
    user_id: "user-123",
    name: "LinkedIn",
    url: "https://linkedin.com",
    category_id: "cat-1",
    created_at: "2026-02-03T10:00:00Z",
    updated_at: "2026-02-03T10:00:00Z",
    ...overrides,
  };
}

function makeDbCategory(overrides: Partial<JobCategoryDb> = {}): JobCategoryDb {
  return {
    id: "cat-1",
    user_id: "user-123",
    name: "Tech",
    created_at: "2026-02-03T10:00:00Z",
    updated_at: "2026-02-03T10:00:00Z",
    ...overrides,
  };
}

function makeSelectChain(data: unknown, error: unknown = null) {
  const resolved = { data, error };
  return {
    select: vi.fn().mockReturnValue({
      then: (resolve: (v: unknown) => unknown) =>
        Promise.resolve(resolved).then(resolve),
      catch: (reject: (v: unknown) => unknown) =>
        Promise.resolve(resolved).catch(reject),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue(resolved),
    }),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue(resolved),
    delete: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    }),
    update: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue(resolved),
        }),
      }),
    }),
    insert: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue(resolved),
      }),
    }),
    upsert: vi.fn().mockResolvedValue({ error: null }),
  };
}

describe("createSupabaseJobSitesRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCurrentUserId.mockResolvedValue("user-123");
  });

  describe("getSites", () => {
    it("queries job_sites and maps to domain objects", async () => {
      const dbSites = [makeDbSite()];
      mockFrom.mockReturnValue(makeSelectChain(dbSites));

      const repo = createSupabaseJobSitesRepository();
      const result = await repo.getSites();

      expect(mockFrom).toHaveBeenCalledWith("job_sites");
      expect(result).toHaveLength(1);
      expect(result[0].categoryId).toBe("cat-1");
      expect(result[0].createdAt).toBe("2026-02-03T10:00:00Z");
      expect((result[0] as unknown as JobSiteDb).category_id).toBeUndefined();
    });

    it("throws on database error", async () => {
      mockFrom.mockReturnValue(makeSelectChain(null, { message: "DB error" }));

      const repo = createSupabaseJobSitesRepository();
      await expect(repo.getSites()).rejects.toEqual({ message: "DB error" });
    });
  });

  describe("getSiteById", () => {
    it("returns site by id", async () => {
      const dbSite = makeDbSite();
      const chain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: dbSite, error: null }),
      };
      mockFrom.mockReturnValue(chain);

      const repo = createSupabaseJobSitesRepository();
      const result = await repo.getSiteById("site-1");

      expect(chain.eq).toHaveBeenCalledWith("id", "site-1");
      expect(result?.id).toBe("site-1");
      expect(result?.categoryId).toBe("cat-1");
    });

    it("returns null when not found", async () => {
      const chain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
      mockFrom.mockReturnValue(chain);

      const repo = createSupabaseJobSitesRepository();
      expect(await repo.getSiteById("nonexistent")).toBeNull();
    });
  });

  describe("createSite", () => {
    it("inserts snake_case row and returns camelCase domain object", async () => {
      await withFrozenTime({
        now: "2026-02-03T10:00:00Z",
        fn: async () => {
          const dbSite = makeDbSite({ ats_type: "greenhouse" });

          const insertResult = {
            single: vi.fn().mockResolvedValue({ data: dbSite, error: null }),
          };
          const insertSelectChain = {
            select: vi.fn().mockReturnValue(insertResult),
          };
          const insertChain = {
            insert: vi.fn().mockReturnValue(insertSelectChain),
          };

          mockFrom.mockReturnValueOnce(insertChain);

          const repo = createSupabaseJobSitesRepository();
          const result = await repo.createSite({
            name: "LinkedIn",
            url: "https://linkedin.com",
            categoryId: "cat-1",
            atsType: "greenhouse",
          });

          const payload = insertChain.insert.mock.calls[0][0];
          expect(payload).toHaveProperty("category_id", "cat-1");
          expect(payload).toHaveProperty("ats_type", "greenhouse");
          expect(payload).not.toHaveProperty("categoryId");
          expect(payload).toHaveProperty("user_id", "user-123");

          expect(result.categoryId).toBe("cat-1");
          expect(result.atsType).toBe("greenhouse");
        },
      });
    });
  });

  describe("updateSite", () => {
    it("updates with snake_case payload", async () => {
      await withFrozenTime({
        now: "2026-02-03T10:00:01Z",
        fn: async () => {
          const updatedDb = makeDbSite({
            name: "LinkedIn Jobs",
            updated_at: "2026-02-03T10:00:01Z",
          });

          const updateResult = {
            single: vi.fn().mockResolvedValue({ data: updatedDb, error: null }),
          };
          const eqChain = {
            select: vi.fn().mockReturnValue(updateResult),
          };
          const updateChain = {
            update: vi
              .fn()
              .mockReturnValue({ eq: vi.fn().mockReturnValue(eqChain) }),
          };
          mockFrom.mockReturnValue(updateChain);

          const repo = createSupabaseJobSitesRepository();
          const result = await repo.updateSite("site-1", {
            name: "LinkedIn Jobs",
          });

          const payload = updateChain.update.mock.calls[0][0];
          expect(payload).not.toHaveProperty("updatedAt");
          expect(result.name).toBe("LinkedIn Jobs");
        },
      });
    });
  });

  describe("removeSite", () => {
    it("deletes by id", async () => {
      const deleteChain = {
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      };
      mockFrom.mockReturnValue(deleteChain);

      const repo = createSupabaseJobSitesRepository();
      await repo.removeSite("site-1");

      expect(deleteChain.delete).toHaveBeenCalled();
    });

    it("throws on database error", async () => {
      const deleteChain = {
        delete: vi.fn().mockReturnValue({
          eq: vi
            .fn()
            .mockResolvedValue({ error: { message: "delete failed" } }),
        }),
      };
      mockFrom.mockReturnValue(deleteChain);

      const repo = createSupabaseJobSitesRepository();
      await expect(repo.removeSite("site-1")).rejects.toEqual({
        message: "delete failed",
      });
    });
  });

  describe("getCategories", () => {
    it("queries job_categories and maps to domain objects", async () => {
      const dbCats = [makeDbCategory()];
      mockFrom.mockReturnValue(makeSelectChain(dbCats));

      const repo = createSupabaseJobSitesRepository();
      const result = await repo.getCategories();

      expect(mockFrom).toHaveBeenCalledWith("job_categories");
      expect(result).toHaveLength(1);
      expect(result[0].createdAt).toBe("2026-02-03T10:00:00Z");
      expect(
        (result[0] as unknown as JobCategoryDb).created_at,
      ).toBeUndefined();
    });
  });

  describe("createCategory", () => {
    it("inserts snake_case row and returns camelCase domain object", async () => {
      await withFrozenTime({
        now: "2026-02-03T10:00:00Z",
        fn: async () => {
          const dbCat = makeDbCategory({ description: "Tech companies" });

          const getCatsChain = makeSelectChain([]);

          const insertResult = {
            single: vi.fn().mockResolvedValue({ data: dbCat, error: null }),
          };
          const insertChain = {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue(insertResult),
            }),
          };

          mockFrom
            .mockReturnValueOnce(getCatsChain)
            .mockReturnValueOnce(insertChain);

          const repo = createSupabaseJobSitesRepository();
          const result = await repo.createCategory({
            name: "Tech",
            description: "Tech companies",
          });

          const payload = insertChain.insert.mock.calls[0][0];
          expect(payload).toHaveProperty("user_id", "user-123");
          expect(payload).not.toHaveProperty("createdAt");

          expect(result.createdAt).toBe("2026-02-03T10:00:00Z");
        },
      });
    });
  });

  describe("removeCategory", () => {
    it("deletes by id", async () => {
      const deleteChain = {
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      };
      mockFrom.mockReturnValue(deleteChain);

      const repo = createSupabaseJobSitesRepository();
      await repo.removeCategory("cat-1");

      expect(deleteChain.delete).toHaveBeenCalled();
    });
  });

  describe("setState", () => {
    it("deletes existing data then rebuilds categories and sites", async () => {
      await withFrozenTime({
        now: "2026-02-03T10:00:00Z",
        fn: async () => {
          const deleteEqChain = {
            eq: vi.fn().mockResolvedValue({ error: null }),
          };
          const deleteChain = {
            delete: vi.fn().mockReturnValue(deleteEqChain),
          };
          const insertChain = {
            insert: vi.fn().mockResolvedValue({ error: null }),
          };

          mockFrom
            .mockReturnValueOnce(deleteChain)
            .mockReturnValueOnce(deleteChain)
            .mockReturnValueOnce(insertChain)
            .mockReturnValueOnce(insertChain);

          const repo = createSupabaseJobSitesRepository();
          await repo.setState({
            categories: [
              {
                id: "cat-1",
                name: "Tech",
                createdAt: "2026-02-03T10:00:00Z",
                updatedAt: "2026-02-03T10:00:00Z",
              },
            ],
            sites: [
              {
                id: "site-1",
                name: "LinkedIn",
                url: "https://linkedin.com",
                categoryId: "cat-1",
                createdAt: "2026-02-03T10:00:00Z",
                updatedAt: "2026-02-03T10:00:00Z",
              },
            ],
          });

          expect(deleteChain.delete).toHaveBeenCalledTimes(2);
          expect(insertChain.insert).toHaveBeenCalledTimes(2);

          const catPayload = insertChain.insert.mock.calls[0][0];
          expect(catPayload[0]).toHaveProperty("user_id", "user-123");
          expect(catPayload[0]).not.toHaveProperty("createdAt");

          const sitePayload = insertChain.insert.mock.calls[1][0];
          expect(sitePayload[0]).toHaveProperty("category_id", "cat-1");
          expect(sitePayload[0]).not.toHaveProperty("categoryId");
        },
      });
    });
  });
});
