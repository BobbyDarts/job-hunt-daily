// /src/services/repositories/visited-sites/local-visited-sites-repository.test.ts

import { describe, it, expect, beforeEach } from "vitest";

import { TEST_STORAGE_KEYS } from "@/constants/storage-keys";
import { todayIso } from "@/lib/time";
import { withFrozenTime } from "@/test-utils/with-frozen-time";
import type { VisitedSiteHistory, VisitedSites } from "@/types";

import { createLocalVisitedSitesRepository } from "./local-visited-sites-repository";

const repoParams = {
  storageKey: TEST_STORAGE_KEYS.VISITED_SITES,
  historyStorageKey: TEST_STORAGE_KEYS.VISITED_SITES_HISTORY,
};

beforeEach(() => {
  localStorage.clear();
});

describe("createLocalVisitedSitesRepository", () => {
  describe("initialization", () => {
    it("starts with today's date and empty visited list", async () => {
      await withFrozenTime({
        now: "2026-04-18T10:00:00Z",
        fn: async () => {
          const repo = createLocalVisitedSitesRepository(repoParams);
          const today = await repo.getByDate("2026-04-18");
          expect(today).not.toBeNull();
          expect(today!.visited).toEqual([]);
          expect(today!.date).toBe("2026-04-18");
        },
      });
    });

    it("reads existing data from localStorage on init", async () => {
      await withFrozenTime({
        now: "2026-04-18T10:00:00Z",
        fn: async () => {
          const existing: VisitedSites = {
            date: "2026-04-18",
            visited: ["https://a.com", "https://b.com"],
          };

          localStorage.setItem(
            TEST_STORAGE_KEYS.VISITED_SITES,
            JSON.stringify(existing),
          );

          const repo = createLocalVisitedSitesRepository(repoParams);
          const today = await repo.getByDate("2026-04-18");
          expect(today).toEqual(existing);
        },
      });
    });
  });

  describe("getByDate", () => {
    it("returns today's data when date matches", async () => {
      await withFrozenTime({
        now: "2026-04-18T10:00:00Z",
        fn: async () => {
          const repo = createLocalVisitedSitesRepository(repoParams);
          await repo.markVisited("https://a.com");

          const result = await repo.getByDate("2026-04-18");
          expect(result).not.toBeNull();
          expect(result!.visited).toContain("https://a.com");
        },
      });
    });

    it("returns null when date does not match stored date", async () => {
      await withFrozenTime({
        now: "2026-04-18T10:00:00Z",
        fn: async () => {
          const repo = createLocalVisitedSitesRepository(repoParams);
          expect(await repo.getByDate("2026-04-17")).toBeNull();
        },
      });
    });
  });

  describe("markVisited", () => {
    it("adds url to visited list", async () => {
      await withFrozenTime({
        now: "2026-04-18T10:00:00Z",
        fn: async () => {
          const repo = createLocalVisitedSitesRepository(repoParams);
          await repo.markVisited("https://a.com");

          const today = await repo.getByDate("2026-04-18");
          expect(today!.visited).toContain("https://a.com");
        },
      });
    });

    it("does not duplicate urls", async () => {
      await withFrozenTime({
        now: "2026-04-18T10:00:00Z",
        fn: async () => {
          const repo = createLocalVisitedSitesRepository(repoParams);
          await repo.markVisited("https://a.com");
          await repo.markVisited("https://a.com");

          const today = await repo.getByDate("2026-04-18");
          expect(today!.visited).toHaveLength(1);
        },
      });
    });

    it("persists to localStorage", async () => {
      await withFrozenTime({
        now: "2026-04-18T10:00:00Z",
        fn: async () => {
          const repo = createLocalVisitedSitesRepository(repoParams);
          await repo.markVisited("https://a.com");

          const stored = JSON.parse(
            localStorage.getItem(TEST_STORAGE_KEYS.VISITED_SITES)!,
          );
          expect(stored.visited).toContain("https://a.com");
          expect(stored.date).toBe("2026-04-18");
        },
      });
    });
  });

  describe("reset", () => {
    it("clears visited list and sets today's date", async () => {
      await withFrozenTime({
        now: "2026-04-18T10:00:00Z",
        fn: async () => {
          const repo = createLocalVisitedSitesRepository(repoParams);
          await repo.markVisited("https://a.com");
          await repo.reset();

          const today = await repo.getByDate("2026-04-18");
          expect(today!.visited).toEqual([]);
        },
      });
    });

    it("persists reset to localStorage", async () => {
      await withFrozenTime({
        now: "2026-04-18T10:00:00Z",
        fn: async () => {
          const repo = createLocalVisitedSitesRepository(repoParams);
          await repo.markVisited("https://a.com");
          await repo.reset();

          const stored = JSON.parse(
            localStorage.getItem(TEST_STORAGE_KEYS.VISITED_SITES)!,
          );
          expect(stored.visited).toEqual([]);
          expect(stored.date).toBe("2026-04-18");
        },
      });
    });
  });

  describe("getHistoryAll / getHistoryByDate", () => {
    it("returns empty history initially", async () => {
      const repo = createLocalVisitedSitesRepository(repoParams);
      expect(await repo.getHistoryAll()).toEqual([]);
    });

    it("returns history entry by date", async () => {
      const repo = createLocalVisitedSitesRepository(repoParams);
      const entry: VisitedSiteHistory = {
        date: "2026-04-17",
        visitedUrls: ["https://a.com"],
        totalSites: 5,
      };

      await repo.createHistory(entry);
      expect(await repo.getHistoryByDate("2026-04-17")).toEqual(entry);
    });

    it("returns null for nonexistent date", async () => {
      const repo = createLocalVisitedSitesRepository(repoParams);
      expect(await repo.getHistoryByDate("2026-01-01")).toBeNull();
    });
  });

  // append to local-visited-sites-repository.test.ts

  describe("getHistoryRange", () => {
    it("returns entries within inclusive date range sorted ascending", async () => {
      const repo = createLocalVisitedSitesRepository(repoParams);
      await repo.createHistory({
        date: "2026-04-15",
        visitedUrls: ["https://a.com"],
        totalSites: 5,
      });
      await repo.createHistory({
        date: "2026-04-17",
        visitedUrls: ["https://b.com"],
        totalSites: 5,
      });
      await repo.createHistory({
        date: "2026-04-19",
        visitedUrls: ["https://c.com"],
        totalSites: 5,
      });

      const result = await repo.getHistoryRange("2026-04-16", "2026-04-18");
      expect(result).toHaveLength(1);
      expect(result[0].date).toBe("2026-04-17");
    });

    it("includes entries on boundary dates", async () => {
      const repo = createLocalVisitedSitesRepository(repoParams);
      await repo.createHistory({
        date: "2026-04-16",
        visitedUrls: [],
        totalSites: 5,
      });
      await repo.createHistory({
        date: "2026-04-18",
        visitedUrls: [],
        totalSites: 5,
      });

      const result = await repo.getHistoryRange("2026-04-16", "2026-04-18");
      expect(result).toHaveLength(2);
      expect(result[0].date).toBe("2026-04-16");
      expect(result[1].date).toBe("2026-04-18");
    });

    it("returns empty array when no entries in range", async () => {
      const repo = createLocalVisitedSitesRepository(repoParams);
      await repo.createHistory({
        date: "2026-04-10",
        visitedUrls: [],
        totalSites: 5,
      });

      const result = await repo.getHistoryRange("2026-04-15", "2026-04-20");
      expect(result).toHaveLength(0);
    });
  });

  describe("getHistoryAllDates", () => {
    it("returns all dates sorted ascending", async () => {
      const repo = createLocalVisitedSitesRepository(repoParams);
      await repo.createHistory({
        date: "2026-04-17",
        visitedUrls: [],
        totalSites: 5,
      });
      await repo.createHistory({
        date: "2026-04-15",
        visitedUrls: [],
        totalSites: 5,
      });
      await repo.createHistory({
        date: "2026-04-19",
        visitedUrls: [],
        totalSites: 5,
      });

      const dates = await repo.getHistoryAllDates();
      expect(dates).toEqual(["2026-04-15", "2026-04-17", "2026-04-19"]);
    });

    it("returns empty array when no history", async () => {
      const repo = createLocalVisitedSitesRepository(repoParams);
      expect(await repo.getHistoryAllDates()).toEqual([]);
    });
  });

  describe("clearHistory", () => {
    it("removes all history entries", async () => {
      const repo = createLocalVisitedSitesRepository(repoParams);
      await repo.createHistory({
        date: "2026-04-17",
        visitedUrls: [],
        totalSites: 5,
      });
      await repo.createHistory({
        date: "2026-04-18",
        visitedUrls: [],
        totalSites: 5,
      });

      await repo.clearHistory();
      expect(await repo.getHistoryAll()).toEqual([]);
    });

    it("persists clear to localStorage", async () => {
      const repo = createLocalVisitedSitesRepository(repoParams);
      await repo.createHistory({
        date: "2026-04-17",
        visitedUrls: [],
        totalSites: 5,
      });

      await repo.clearHistory();
      const stored = JSON.parse(
        localStorage.getItem(TEST_STORAGE_KEYS.VISITED_SITES_HISTORY)!,
      );
      expect(stored).toEqual([]);
    });
  });

  describe("createHistory", () => {
    it("adds history entry", async () => {
      const repo = createLocalVisitedSitesRepository(repoParams);
      const entry: VisitedSiteHistory = {
        date: "2026-04-17",
        visitedUrls: ["https://a.com", "https://b.com"],
        totalSites: 5,
      };

      await repo.createHistory(entry);

      const all = await repo.getHistoryAll();
      expect(all).toHaveLength(1);
      expect(all[0]).toEqual(entry);
    });

    it("does not duplicate entries for the same date", async () => {
      const repo = createLocalVisitedSitesRepository(repoParams);
      const entry: VisitedSiteHistory = {
        date: "2026-04-17",
        visitedUrls: ["https://a.com"],
        totalSites: 5,
      };

      await repo.createHistory(entry);
      await repo.createHistory({ ...entry, visitedUrls: ["https://b.com"] });

      const all = await repo.getHistoryAll();
      expect(all).toHaveLength(1);
      expect(all[0].visitedUrls).toEqual(["https://a.com"]);
    });

    it("persists to localStorage", async () => {
      const repo = createLocalVisitedSitesRepository(repoParams);
      const entry: VisitedSiteHistory = {
        date: "2026-04-17",
        visitedUrls: ["https://a.com"],
        totalSites: 5,
      };

      await repo.createHistory(entry);

      const stored = JSON.parse(
        localStorage.getItem(TEST_STORAGE_KEYS.VISITED_SITES_HISTORY)!,
      );
      expect(stored).toHaveLength(1);
      expect(stored[0]).toEqual(entry);
    });
  });

  describe("serialize", () => {
    it("returns today and full history", async () => {
      await withFrozenTime({
        now: "2026-04-18T10:00:00Z",
        fn: async () => {
          const repo = createLocalVisitedSitesRepository(repoParams);
          await repo.markVisited("https://a.com");
          await repo.createHistory({
            date: "2026-04-17",
            visitedUrls: ["https://b.com"],
            totalSites: 3,
          });

          const result = await repo.serialize();
          expect(result.today.date).toBe("2026-04-18");
          expect(result.today.visited).toContain("https://a.com");
          expect(result.history).toHaveLength(1);
          expect(result.history[0].date).toBe("2026-04-17");
        },
      });
    });

    it("returns copies not references", async () => {
      await withFrozenTime({
        now: "2026-04-18T10:00:00Z",
        fn: async () => {
          const repo = createLocalVisitedSitesRepository(repoParams);
          await repo.markVisited("https://a.com");

          const result = await repo.serialize();
          result.today.visited.push("https://mutated.com");

          const today = await repo.getByDate("2026-04-18");
          expect(today!.visited).not.toContain("https://mutated.com");
        },
      });
    });
  });

  describe("hydrate", () => {
    it("restores today and history", async () => {
      await withFrozenTime({
        now: "2026-04-18T10:00:00Z",
        fn: async () => {
          const repo = createLocalVisitedSitesRepository(repoParams);
          const data = {
            today: {
              date: "2026-04-18",
              visited: ["https://a.com"],
            },
            history: [
              {
                date: "2026-04-17",
                visitedUrls: ["https://b.com"],
                totalSites: 5,
              },
            ],
          };

          await repo.hydrate(data);

          const today = await repo.getByDate("2026-04-18");
          expect(today!.visited).toContain("https://a.com");

          const history = await repo.getHistoryAll();
          expect(history).toHaveLength(1);
          expect(history[0].date).toBe("2026-04-17");
        },
      });
    });

    it("throws for invalid format", async () => {
      const repo = createLocalVisitedSitesRepository(repoParams);
      await expect(
        repo.hydrate({ today: { date: "", visited: [] }, history: [] }),
      ).rejects.toThrow("Invalid VisitedSites format");
    });

    it("throws when visited is not an array", async () => {
      const repo = createLocalVisitedSitesRepository(repoParams);
      await expect(
        repo.hydrate({
          today: { date: "2026-04-18", visited: "not-array" as never },
          history: [],
        }),
      ).rejects.toThrow("Invalid VisitedSites format");
    });
  });

  describe("persistence across instances", () => {
    it("data written by one instance is read by another", async () => {
      await withFrozenTime({
        now: "2026-04-18T10:00:00Z",
        fn: async () => {
          const repo1 = createLocalVisitedSitesRepository(repoParams);
          await repo1.markVisited("https://a.com");

          const repo2 = createLocalVisitedSitesRepository(repoParams);
          const today = await repo2.getByDate("2026-04-18");
          expect(today!.visited).toContain("https://a.com");
        },
      });
    });

    it("history written by one instance is visible in another", async () => {
      const repo1 = createLocalVisitedSitesRepository(repoParams);
      await repo1.createHistory({
        date: "2026-04-17",
        visitedUrls: ["https://a.com"],
        totalSites: 5,
      });

      const repo2 = createLocalVisitedSitesRepository(repoParams);
      const history = await repo2.getHistoryAll();
      expect(history).toHaveLength(1);
    });
  });

  describe("todayIso alignment", () => {
    it("markVisited uses current date consistently with getByDate", async () => {
      await withFrozenTime({
        now: "2026-04-18T10:00:00Z",
        fn: async () => {
          const repo = createLocalVisitedSitesRepository(repoParams);
          await repo.markVisited("https://a.com");

          const today = await repo.getByDate(todayIso());
          expect(today).not.toBeNull();
          expect(today!.visited).toContain("https://a.com");
        },
      });
    });
  });
});
