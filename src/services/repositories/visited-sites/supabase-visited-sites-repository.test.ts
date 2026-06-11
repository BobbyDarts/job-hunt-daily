// /src/services/repositories/visited-sites/supabase-visited-sites-repository.test.ts

import { describe, it, expect, beforeEach, vi } from "vitest";

import { withFrozenTime } from "@/test-utils/with-frozen-time";
import type { VisitedSiteHistory } from "@/types";

import { createSupabaseVisitedSitesRepository } from "./supabase-visited-sites-repository";

const mockGetCurrentUserId = vi.hoisted(() =>
  vi.fn().mockResolvedValue("user-123"),
);

vi.mock("@/services/supabase/auth", () => ({
  getCurrentUserId: mockGetCurrentUserId,
}));

const mockFrom = vi.hoisted(() => vi.fn());

vi.mock("@/services/supabase/client", () => ({
  supabase: { from: mockFrom },
}));

function makeSelectChain(data: unknown = [], error: unknown = null) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data, error }),
    maybeSingle: vi.fn().mockResolvedValue({ data, error }),
    then: (resolve: (v: unknown) => unknown) =>
      Promise.resolve({ data, error }).then(resolve),
  };
}

function makeUpsertChain(error: unknown = null) {
  return {
    upsert: vi.fn().mockResolvedValue({ error }),
  };
}

function makeDeleteChain(error: unknown = null) {
  return {
    delete: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error }),
      }),
    }),
  };
}

describe("createSupabaseVisitedSitesRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCurrentUserId.mockResolvedValue("user-123");
  });

  describe("getByDate", () => {
    it("returns visited sites for a given date", async () => {
      await withFrozenTime({
        now: "2026-04-18T10:00:00Z",
        fn: async () => {
          const rows = [{ url: "https://a.com" }, { url: "https://b.com" }];
          const chain = makeSelectChain(rows);
          chain.select.mockReturnThis();
          chain.eq.mockResolvedValue({ data: rows, error: null });
          mockFrom.mockReturnValue(chain);

          const repo = createSupabaseVisitedSitesRepository();
          const result = await repo.getByDate("2026-04-18");

          expect(mockFrom).toHaveBeenCalledWith("visited_sites");
          expect(result?.date).toBe("2026-04-18");
          expect(result?.visited).toEqual(["https://a.com", "https://b.com"]);
        },
      });
    });

    it("returns empty visited array when no rows", async () => {
      const chain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: [], error: null }),
      };
      mockFrom.mockReturnValue(chain);

      const repo = createSupabaseVisitedSitesRepository();
      const result = await repo.getByDate("2026-04-18");

      expect(result?.visited).toEqual([]);
    });

    it("throws on database error", async () => {
      const chain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "DB error" },
        }),
      };
      mockFrom.mockReturnValue(chain);

      const repo = createSupabaseVisitedSitesRepository();
      await expect(repo.getByDate("2026-04-18")).rejects.toEqual({
        message: "DB error",
      });
    });
  });

  describe("getHistoryAll", () => {
    it("returns mapped history entries", async () => {
      const rows = [
        {
          date: "2026-04-17",
          visited_urls: ["https://a.com"],
          total_sites: 5,
        },
      ];
      const chain = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: rows, error: null }),
      };
      mockFrom.mockReturnValue(chain);

      const repo = createSupabaseVisitedSitesRepository();
      const result = await repo.getHistoryAll();

      expect(mockFrom).toHaveBeenCalledWith("visited_site_history");
      expect(result).toHaveLength(1);
      expect(result[0].date).toBe("2026-04-17");
      expect(result[0].visitedUrls).toEqual(["https://a.com"]);
      expect(result[0].totalSites).toBe(5);
    });

    it("returns empty array when no history", async () => {
      const chain = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      };
      mockFrom.mockReturnValue(chain);

      const repo = createSupabaseVisitedSitesRepository();
      expect(await repo.getHistoryAll()).toEqual([]);
    });
  });

  describe("getHistoryByDate", () => {
    it("returns history entry for given date", async () => {
      const row = {
        date: "2026-04-17",
        visited_urls: ["https://a.com"],
        total_sites: 3,
      };
      const chain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: row, error: null }),
      };
      mockFrom.mockReturnValue(chain);

      const repo = createSupabaseVisitedSitesRepository();
      const result = await repo.getHistoryByDate("2026-04-17");

      expect(result?.date).toBe("2026-04-17");
      expect(result?.visitedUrls).toEqual(["https://a.com"]);
      expect(result?.totalSites).toBe(3);
    });

    it("returns null when not found", async () => {
      const chain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
      mockFrom.mockReturnValue(chain);

      const repo = createSupabaseVisitedSitesRepository();
      expect(await repo.getHistoryByDate("2026-01-01")).toBeNull();
    });
  });

  // append to supabase-visited-sites-repository.test.ts

  describe("getHistoryRange", () => {
    it("queries with gte/lte bounds and returns mapped entries", async () => {
      const rows = [
        { date: "2026-04-17", visited_urls: ["https://a.com"], total_sites: 5 },
      ];
      const chain = {
        select: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: rows, error: null }),
      };
      mockFrom.mockReturnValue(chain);

      const repo = createSupabaseVisitedSitesRepository();
      const result = await repo.getHistoryRange("2026-04-16", "2026-04-18");

      expect(mockFrom).toHaveBeenCalledWith("visited_site_history");
      expect(chain.gte).toHaveBeenCalledWith("date", "2026-04-16");
      expect(chain.lte).toHaveBeenCalledWith("date", "2026-04-18");
      expect(result).toHaveLength(1);
      expect(result[0].date).toBe("2026-04-17");
    });

    it("returns empty array when no entries in range", async () => {
      const chain = {
        select: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      };
      mockFrom.mockReturnValue(chain);

      const repo = createSupabaseVisitedSitesRepository();
      expect(await repo.getHistoryRange("2026-04-16", "2026-04-18")).toEqual(
        [],
      );
    });
  });

  describe("getHistoryAllDates", () => {
    it("returns dates sorted ascending", async () => {
      const rows = [{ date: "2026-04-15" }, { date: "2026-04-17" }];
      const chain = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: rows, error: null }),
      };
      mockFrom.mockReturnValue(chain);

      const repo = createSupabaseVisitedSitesRepository();
      const result = await repo.getHistoryAllDates();

      expect(mockFrom).toHaveBeenCalledWith("visited_site_history");
      expect(result).toEqual(["2026-04-15", "2026-04-17"]);
    });

    it("returns empty array when no history", async () => {
      const chain = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      };
      mockFrom.mockReturnValue(chain);

      const repo = createSupabaseVisitedSitesRepository();
      expect(await repo.getHistoryAllDates()).toEqual([]);
    });
  });

  describe("clearHistory", () => {
    it("deletes all history rows scoped to user", async () => {
      const deleteChain = {
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      };
      mockFrom.mockReturnValue(deleteChain);

      const repo = createSupabaseVisitedSitesRepository();
      await repo.clearHistory();

      expect(mockFrom).toHaveBeenCalledWith("visited_site_history");
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

      const repo = createSupabaseVisitedSitesRepository();
      await expect(repo.clearHistory()).rejects.toEqual({
        message: "delete failed",
      });
    });
  });

  describe("markVisited", () => {
    it("upserts with user_id, url, and today's date", async () => {
      await withFrozenTime({
        now: "2026-04-18T10:00:00Z",
        fn: async () => {
          const upsertChain = makeUpsertChain();
          mockFrom.mockReturnValue(upsertChain);

          const repo = createSupabaseVisitedSitesRepository();
          await repo.markVisited("https://a.com");

          expect(mockFrom).toHaveBeenCalledWith("visited_sites");
          expect(upsertChain.upsert).toHaveBeenCalledWith(
            {
              user_id: "user-123",
              url: "https://a.com",
              visited_date: "2026-04-18",
            },
            { onConflict: "user_id,url,visited_date" },
          );
        },
      });
    });

    it("throws on database error", async () => {
      const upsertChain = makeUpsertChain({ message: "upsert failed" });
      mockFrom.mockReturnValue(upsertChain);

      const repo = createSupabaseVisitedSitesRepository();
      await expect(repo.markVisited("https://a.com")).rejects.toEqual({
        message: "upsert failed",
      });
    });
  });

  describe("createHistory", () => {
    it("upserts history entry with user_id", async () => {
      const upsertChain = makeUpsertChain();
      mockFrom.mockReturnValue(upsertChain);

      const entry: VisitedSiteHistory = {
        date: "2026-04-17",
        visitedUrls: ["https://a.com"],
        totalSites: 5,
      };

      const repo = createSupabaseVisitedSitesRepository();
      await repo.createHistory(entry);

      expect(mockFrom).toHaveBeenCalledWith("visited_site_history");
      expect(upsertChain.upsert).toHaveBeenCalledWith(
        {
          user_id: "user-123",
          date: "2026-04-17",
          visited_urls: ["https://a.com"],
          total_sites: 5,
        },
        { onConflict: "user_id,date" },
      );
    });

    it("throws on database error", async () => {
      const upsertChain = makeUpsertChain({ message: "upsert failed" });
      mockFrom.mockReturnValue(upsertChain);

      const repo = createSupabaseVisitedSitesRepository();
      await expect(
        repo.createHistory({
          date: "2026-04-17",
          visitedUrls: [],
          totalSites: 0,
        }),
      ).rejects.toEqual({ message: "upsert failed" });
    });
  });

  describe("reset", () => {
    it("deletes today's rows scoped to user", async () => {
      await withFrozenTime({
        now: "2026-04-18T10:00:00Z",
        fn: async () => {
          const deleteChain = makeDeleteChain();
          mockFrom.mockReturnValue(deleteChain);

          const repo = createSupabaseVisitedSitesRepository();
          await repo.reset();

          expect(mockFrom).toHaveBeenCalledWith("visited_sites");
          expect(deleteChain.delete).toHaveBeenCalled();
        },
      });
    });
  });

  describe("serialize", () => {
    it("returns today and history", async () => {
      await withFrozenTime({
        now: "2026-04-18T10:00:00Z",
        fn: async () => {
          const visitedRows = [{ url: "https://a.com" }];
          const historyRows = [
            {
              date: "2026-04-17",
              visited_urls: ["https://b.com"],
              total_sites: 3,
            },
          ];

          const visitedChain = {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({
              data: visitedRows,
              error: null,
            }),
          };
          const historyChain = {
            select: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({
              data: historyRows,
              error: null,
            }),
          };

          mockFrom
            .mockReturnValueOnce(visitedChain)
            .mockReturnValueOnce(historyChain);

          const repo = createSupabaseVisitedSitesRepository();
          const result = await repo.serialize();

          expect(result.today.date).toBe("2026-04-18");
          expect(result.today.visited).toEqual(["https://a.com"]);
          expect(result.history).toHaveLength(1);
          expect(result.history[0].date).toBe("2026-04-17");
        },
      });
    });
  });

  describe("hydrate", () => {
    it("resets then inserts today's visits and history", async () => {
      await withFrozenTime({
        now: "2026-04-18T10:00:00Z",
        fn: async () => {
          const deleteChain = makeDeleteChain();
          const upsertVisitedChain = makeUpsertChain();
          const upsertHistoryChain = makeUpsertChain();

          mockFrom
            .mockReturnValueOnce(deleteChain) // reset
            .mockReturnValueOnce(upsertVisitedChain) // insert today's visits
            .mockReturnValueOnce(upsertHistoryChain); // createHistory

          const repo = createSupabaseVisitedSitesRepository();
          await repo.hydrate({
            today: { date: "2026-04-18", visited: ["https://a.com"] },
            history: [
              {
                date: "2026-04-17",
                visitedUrls: ["https://b.com"],
                totalSites: 3,
              },
            ],
          });

          expect(upsertVisitedChain.upsert).toHaveBeenCalledWith(
            [
              {
                user_id: "user-123",
                url: "https://a.com",
                visited_date: "2026-04-18",
              },
            ],
            { onConflict: "user_id,url,visited_date" },
          );
          expect(upsertHistoryChain.upsert).toHaveBeenCalledWith(
            {
              user_id: "user-123",
              date: "2026-04-17",
              visited_urls: ["https://b.com"],
              total_sites: 3,
            },
            { onConflict: "user_id,date" },
          );
        },
      });
    });

    it("throws for invalid format", async () => {
      const repo = createSupabaseVisitedSitesRepository();
      await expect(
        repo.hydrate({
          today: { date: "", visited: [] },
          history: [],
        }),
      ).rejects.toThrow("Invalid VisitedSites format");
    });
  });
});
