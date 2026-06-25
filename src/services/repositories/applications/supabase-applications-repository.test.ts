// /src/services/repositories/applications/supabase-applications-repository.test.ts

import { describe, it, expect, beforeEach, vi } from "vitest";

import { getCurrentUserId } from "@/services/supabase/auth";
import { supabase } from "@/services/supabase/client";
import { withFrozenTime } from "@/test-utils/with-frozen-time";
import type {
  Application,
  ApplicationCreateData,
  ApplicationDb,
  ApplicationHistory,
  ApplicationHistoryDb,
} from "@/types";

import { createSupabaseApplicationsRepository } from "./supabase-applications-repository";

vi.mock("@/services/supabase/auth", () => ({
  getCurrentUserId: vi.fn().mockResolvedValue("user-123"),
}));

vi.mock("@/services/supabase/client", () => ({
  supabase: { from: vi.fn() },
}));

const mockGetCurrentUserId = vi.mocked(getCurrentUserId);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockFrom = vi.mocked(supabase!.from) as unknown as any;

function makeDbApp(overrides: Partial<ApplicationDb> = {}): ApplicationDb {
  return {
    id: "app_1",
    user_id: "user-123",
    company: "Tech Co",
    position: "Developer",
    job_site_id: "techco",
    job_site_url: "https://techco.com",
    status: "applied",
    applied_date: "2026-02-03",
    created_at: "2026-02-03T10:00:00Z",
    updated_at: "2026-02-03T10:00:00Z",
    ...overrides,
  };
}

function makeDbHistory(
  overrides: Partial<ApplicationHistoryDb> = {},
): ApplicationHistoryDb {
  return {
    id: "hist_1",
    user_id: "user-123",
    application_id: "app_1",
    history_timestamp: "2026-02-03T10:00:00Z",
    reason: "updated",
    company: "Tech Co",
    position: "Developer",
    job_site_id: "techco",
    job_site_url: "https://techco.com",
    status: "applied",
    applied_date: "2026-02-03",
    created_at: "2026-02-03T10:00:00Z",
    updated_at: "2026-02-03T10:00:00Z",
    ...overrides,
  };
}

function makeSelectChain(result: { data?: unknown; error?: unknown } = {}) {
  const resolved = {
    data: result.data ?? [],
    error: result.error ?? null,
  };
  const chain: Record<string, unknown> = {
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({
      data: result.data,
      error: result.error ?? null,
    }),
    then: (resolve: (v: unknown) => unknown) =>
      Promise.resolve(resolved).then(resolve),
    catch: (reject: (v: unknown) => unknown) =>
      Promise.resolve(resolved).catch(reject),
  };
  return chain;
}

function makeQueryChain(result: { data?: unknown; error?: unknown } = {}) {
  const selectChain = makeSelectChain(result);
  const chain = {
    select: vi.fn().mockReturnValue(selectChain),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    upsert: vi
      .fn()
      .mockResolvedValue({ data: null, error: result.error ?? null }),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(result),
    maybeSingle: vi.fn().mockResolvedValue(result),
  };
  chain.insert.mockReturnValue({
    select: vi.fn().mockReturnValue({
      single: vi.fn().mockResolvedValue(result),
    }),
  });
  chain.update.mockReturnValue({
    eq: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue(result),
      }),
    }),
  });
  chain.delete.mockReturnValue({
    eq: vi.fn().mockResolvedValue({ error: result.error ?? null }),
  });
  return chain;
}

describe("createSupabaseApplicationsRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCurrentUserId.mockResolvedValue("user-123");
  });

  describe("getAll", () => {
    it("queries applications table and maps rows to domain objects", async () => {
      const dbApps = [makeDbApp(), makeDbApp({ id: "app_2", company: "B" })];
      const chain = makeQueryChain({ data: dbApps });
      mockFrom.mockReturnValue(chain);

      const repo = createSupabaseApplicationsRepository();
      const result = await repo.getAll();

      expect(mockFrom).toHaveBeenCalledWith("applications");
      expect(result).toHaveLength(2);
      expect(result[0].company).toBe("Tech Co");
      expect(result[0].jobSiteId).toBe("techco");
      expect(result[0].createdAt).toBe("2026-02-03T10:00:00Z");
    });

    it("returns empty array when no applications", async () => {
      const chain = makeQueryChain({ data: [] });
      mockFrom.mockReturnValue(chain);

      const repo = createSupabaseApplicationsRepository();
      expect(await repo.getAll()).toEqual([]);
    });

    it("throws on database error", async () => {
      const chain = makeQueryChain({ error: { message: "DB error" } });
      mockFrom.mockReturnValue(chain);

      const repo = createSupabaseApplicationsRepository();
      await expect(repo.getAll()).rejects.toEqual({ message: "DB error" });
    });
  });

  describe("getById", () => {
    it("queries by id and maps row to domain object", async () => {
      const dbApp = makeDbApp();
      const chain = makeQueryChain({ data: dbApp });
      const selectResult = chain.select.mock.results;
      mockFrom.mockReturnValue(chain);

      const repo = createSupabaseApplicationsRepository();
      const result = await repo.getById("app_1");

      const selectChain = selectResult[0].value as Record<
        string,
        ReturnType<typeof vi.fn>
      >;
      expect(selectChain.eq).toHaveBeenCalledWith("id", "app_1");
      expect(result?.id).toBe("app_1");
      expect(result?.jobSiteId).toBe("techco");
    });

    it("returns null when not found", async () => {
      const chain = makeQueryChain({ data: null });
      mockFrom.mockReturnValue(chain);

      const repo = createSupabaseApplicationsRepository();
      expect(await repo.getById("nonexistent")).toBeNull();
    });
  });

  describe("getHistoryAll", () => {
    it("queries application_history table and maps rows", async () => {
      const dbHistory = [makeDbHistory()];
      const chain = makeQueryChain({ data: dbHistory });
      mockFrom.mockReturnValue(chain);

      const repo = createSupabaseApplicationsRepository();
      const result = await repo.getHistoryAll();

      expect(mockFrom).toHaveBeenCalledWith("application_history");
      expect(result).toHaveLength(1);
      expect(result[0].applicationId).toBe("app_1");
      expect(result[0].historyTimestamp).toBe("2026-02-03T10:00:00Z");
    });
  });

  describe("create", () => {
    it("inserts snake_case row and returns camelCase domain object", async () => {
      await withFrozenTime({
        now: "2026-02-03T10:00:00Z",
        fn: async () => {
          const dbApp = makeDbApp();
          const insertChain = {
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: dbApp, error: null }),
            }),
          };
          const chain = { insert: vi.fn().mockReturnValue(insertChain) };
          mockFrom.mockReturnValue(chain);

          const data: ApplicationCreateData = {
            company: "Tech Co",
            position: "Developer",
            jobSiteId: "techco",
            jobSiteUrl: "https://techco.com",
            status: "applied",
            appliedDate: "2026-02-03",
          };

          const repo = createSupabaseApplicationsRepository();
          const result = await repo.create(data);

          const insertCall = chain.insert.mock.calls[0][0];
          expect(insertCall).toHaveProperty("job_site_id");
          expect(insertCall).toHaveProperty("applied_date");
          expect(insertCall).not.toHaveProperty("jobSiteId");

          expect(result.company).toBe("Tech Co");
          expect(result.jobSiteId).toBe("techco");
        },
      });
    });

    it("throws on database error", async () => {
      const insertChain = {
        select: vi.fn().mockReturnValue({
          single: vi
            .fn()
            .mockResolvedValue({ data: null, error: { message: "DB error" } }),
        }),
      };
      mockFrom.mockReturnValue({
        insert: vi.fn().mockReturnValue(insertChain),
      });

      const repo = createSupabaseApplicationsRepository();
      await expect(
        repo.create({
          company: "X",
          position: "Y",
          jobSiteId: "z",
          jobSiteUrl: "https://z.com",
          status: "applied",
          appliedDate: "2026-02-03",
        }),
      ).rejects.toEqual({ message: "DB error" });
    });
  });

  describe("update", () => {
    it("archives existing, then updates with snake_case payload", async () => {
      await withFrozenTime({
        now: "2026-02-03T10:00:01Z",
        fn: async () => {
          const dbApp = makeDbApp();
          const updatedDb = makeDbApp({
            status: "interviewing",
            updated_at: "2026-02-03T10:00:01Z",
          });

          const maybeSingleChain = {
            maybeSingle: vi
              .fn()
              .mockResolvedValue({ data: dbApp, error: null }),
          };
          const eqForSelect = vi.fn().mockReturnValue(maybeSingleChain);
          const selectChain = { eq: eqForSelect };
          const fromSelect = { select: vi.fn().mockReturnValue(selectChain) };

          const updateResultChain = {
            single: vi.fn().mockResolvedValue({ data: updatedDb, error: null }),
          };
          const eqForUpdate = vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue(updateResultChain),
          });
          const updateChain = { eq: eqForUpdate };
          const fromUpdate = {
            update: vi.fn().mockReturnValue(updateChain),
          };

          const insertChain = {
            insert: vi.fn().mockResolvedValue({ data: null, error: null }),
          };

          mockFrom
            .mockReturnValueOnce(fromSelect)
            .mockReturnValueOnce(insertChain)
            .mockReturnValueOnce(fromUpdate);

          const repo = createSupabaseApplicationsRepository();
          const result = await repo.update("app_1", {
            status: "interviewing",
          });

          expect(result.status).toBe("interviewing");
          expect(insertChain.insert).toHaveBeenCalled();
          const updatePayload = fromUpdate.update.mock.calls[0][0];
          expect(updatePayload).not.toHaveProperty("updatedAt");
          expect(updatePayload).toHaveProperty("status", "interviewing");
        },
      });
    });

    it("throws when application not found", async () => {
      const chain = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      };
      mockFrom.mockReturnValue(chain);

      const repo = createSupabaseApplicationsRepository();
      await expect(
        repo.update("nonexistent", { status: "interviewing" }),
      ).rejects.toThrow("Not found");
    });
  });

  describe("remove", () => {
    it("archives then deletes", async () => {
      const dbApp = makeDbApp();

      const maybeSingleChain = {
        maybeSingle: vi.fn().mockResolvedValue({ data: dbApp, error: null }),
      };
      const fromSelect = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue(maybeSingleChain),
        }),
      };
      const insertChain = {
        insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
      const deleteChain = {
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      };

      mockFrom
        .mockReturnValueOnce(fromSelect)
        .mockReturnValueOnce(insertChain)
        .mockReturnValueOnce(deleteChain);

      const repo = createSupabaseApplicationsRepository();
      await repo.remove("app_1");

      expect(insertChain.insert).toHaveBeenCalled();
      expect(deleteChain.delete).toHaveBeenCalled();
    });

    it("throws when application not found", async () => {
      const chain = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      };
      mockFrom.mockReturnValue(chain);

      const repo = createSupabaseApplicationsRepository();
      await expect(repo.remove("nonexistent")).rejects.toThrow("Not found");
    });
  });

  describe("setState", () => {
    it("inserts applications and history", async () => {
      const deleteChain = {
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      };
      const insertChain = {
        insert: vi.fn().mockResolvedValue({ error: null }),
      };
      mockFrom
        .mockReturnValueOnce(deleteChain) // delete history
        .mockReturnValueOnce(deleteChain) // delete applications
        .mockReturnValue(insertChain); // insert applications + history

      const apps: Application[] = [
        {
          id: "app_1",
          company: "Tech Co",
          position: "Dev",
          jobSiteId: "techco",
          jobSiteUrl: "https://techco.com",
          status: "applied",
          appliedDate: "2026-02-03",
          createdAt: "2026-02-03T10:00:00Z",
          updatedAt: "2026-02-03T10:00:00Z",
        },
      ];

      const history: ApplicationHistory[] = [
        {
          id: "hist_1",
          applicationId: "app_1",
          historyTimestamp: "2026-02-03T10:00:00Z",
          reason: "updated",
          company: "Tech Co",
          position: "Dev",
          jobSiteId: "techco",
          jobSiteUrl: "https://techco.com",
          status: "applied",
          appliedDate: "2026-02-03",
          createdAt: "2026-02-03T10:00:00Z",
          updatedAt: "2026-02-03T10:00:00Z",
        },
      ];

      const repo = createSupabaseApplicationsRepository();
      await repo.setState({ applications: apps, history });

      expect(mockFrom).toHaveBeenCalledWith("applications");
      expect(mockFrom).toHaveBeenCalledWith("application_history");
      expect(insertChain.insert).toHaveBeenCalledTimes(2);
    });

    it("preserves UUID ids on round-trip", async () => {
      const deleteChain = {
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      };
      const insertChain = {
        insert: vi.fn().mockResolvedValue({ error: null }),
      };
      mockFrom
        .mockReturnValueOnce(deleteChain)
        .mockReturnValueOnce(deleteChain)
        .mockReturnValue(insertChain);

      const uuidApp: Application = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        company: "Tech Co",
        position: "Dev",
        jobSiteId: "techco",
        jobSiteUrl: "https://techco.com",
        status: "applied",
        appliedDate: "2026-02-03",
        createdAt: "2026-02-03T10:00:00Z",
        updatedAt: "2026-02-03T10:00:00Z",
      };

      const repo = createSupabaseApplicationsRepository();
      await repo.setState({ applications: [uuidApp], history: [] });

      const payload = insertChain.insert.mock.calls[0][0];
      expect(payload[0].id).toBe("550e8400-e29b-41d4-a716-446655440000");
      expect(payload[0].created_at).toBe("2026-02-03T10:00:00Z");
    });

    it("throws on applications insert error", async () => {
      const deleteChain = {
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      };

      const insertChain = {
        insert: vi
          .fn()
          .mockResolvedValue({ error: { message: "insert failed" } }),
      };
      mockFrom
        .mockReturnValueOnce(deleteChain) // delete history
        .mockReturnValueOnce(deleteChain) // delete applications
        .mockReturnValue(insertChain);

      const repo = createSupabaseApplicationsRepository();
      await expect(
        repo.setState({ applications: [], history: [] }),
      ).rejects.toEqual({ message: "insert failed" });
    });
  });

  describe("camelCase ↔ snake_case transform", () => {
    it("fromDbApplication maps snake_case to camelCase correctly", async () => {
      const dbApp = makeDbApp({
        job_site_id: "my-site",
        job_site_url: "https://mysite.com",
        job_posting_url: "https://mysite.com/jobs/123",
        follow_up_date: "2026-03-01",
        ats_type: "greenhouse",
        applied_date: "2026-02-03",
        created_at: "2026-02-03T10:00:00Z",
        updated_at: "2026-02-03T10:00:00Z",
      });

      const chain = makeQueryChain({ data: [dbApp] });
      mockFrom.mockReturnValue(chain);

      const repo = createSupabaseApplicationsRepository();
      const [result] = await repo.getAll();

      expect(result.jobSiteId).toBe("my-site");
      expect(result.jobSiteUrl).toBe("https://mysite.com");
      expect(result.jobPostingUrl).toBe("https://mysite.com/jobs/123");
      expect(result.followUpDate).toBe("2026-03-01");
      expect(result.atsType).toBe("greenhouse");
      expect(result.appliedDate).toBe("2026-02-03");
      expect(result.createdAt).toBe("2026-02-03T10:00:00Z");
      expect(result.updatedAt).toBe("2026-02-03T10:00:00Z");
      expect((result as unknown as ApplicationDb).job_site_id).toBeUndefined();
    });
  });
});
