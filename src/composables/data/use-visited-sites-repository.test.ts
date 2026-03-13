// /src/composables/data/use-visited-sites-repository.test.ts

import { describe, it, expect, beforeEach, vi } from "vitest";

import { withFrozenTime } from "@/test-utils/with-frozen-time";
import type { VisitedSites } from "@/types";

import { TEST_VISITED_SITES_STORAGE_KEY } from "./keys";
import { useVisitedSitesRepository } from "./use-visited-sites-repository";

describe("useVisitedSitesRepository", () => {
  const repoParams = {
    storageKey: TEST_VISITED_SITES_STORAGE_KEY,
    skipInitReset: true,
  };

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe("initialization", () => {
    it("starts with empty visited list for today", async () => {
      await withFrozenTime({
        now: "2026-02-03T10:00:00Z",
        fn: async () => {
          const { visitedData } = useVisitedSitesRepository(repoParams);

          expect(visitedData.value.visited).toEqual([]);
          expect(visitedData.value.date).toBe("2026-02-03");
        },
      });
    });

    it("reads existing data from localStorage on init", async () => {
      await withFrozenTime({
        now: "2026-02-03T10:00:00Z",
        fn: async () => {
          const existing: VisitedSites = {
            date: "2026-02-03",
            visited: ["https://example.com"],
          };
          localStorage.setItem(
            TEST_VISITED_SITES_STORAGE_KEY,
            JSON.stringify(existing),
          );

          const { visitedData } = useVisitedSitesRepository(repoParams);

          expect(visitedData.value).toEqual(existing);
        },
      });
    });

    it("resets stale data from a previous day when skipInitReset is false", async () => {
      await withFrozenTime({
        now: "2026-02-03T10:00:00Z",
        fn: async () => {
          const stale: VisitedSites = {
            date: "2026-02-02",
            visited: ["https://yesterday.com"],
          };
          localStorage.setItem(
            TEST_VISITED_SITES_STORAGE_KEY,
            JSON.stringify(stale),
          );

          const { visitedData } = useVisitedSitesRepository({
            storageKey: TEST_VISITED_SITES_STORAGE_KEY,
            skipInitReset: false,
          });

          expect(visitedData.value.visited).toEqual([]);
          expect(visitedData.value.date).toBe("2026-02-03");
        },
      });
    });

    it("does not reset stale data when skipInitReset is true", async () => {
      await withFrozenTime({
        now: "2026-02-03T10:00:00Z",
        fn: async () => {
          const stale: VisitedSites = {
            date: "2026-02-02",
            visited: ["https://yesterday.com"],
          };
          localStorage.setItem(
            TEST_VISITED_SITES_STORAGE_KEY,
            JSON.stringify(stale),
          );

          const { visitedData } = useVisitedSitesRepository({
            storageKey: TEST_VISITED_SITES_STORAGE_KEY,
            skipInitReset: true,
          });

          expect(visitedData.value.visited).toEqual(["https://yesterday.com"]);
        },
      });
    });
  });

  describe("getAll", () => {
    it("returns current visited sites data", async () => {
      await withFrozenTime({
        now: "2026-02-03T10:00:00Z",
        fn: async () => {
          const existing: VisitedSites = {
            date: "2026-02-03",
            visited: ["https://example.com"],
          };
          localStorage.setItem(
            TEST_VISITED_SITES_STORAGE_KEY,
            JSON.stringify(existing),
          );

          const repo = useVisitedSitesRepository(repoParams);
          const result = await repo.getAll();

          expect(result).toEqual(existing);
        },
      });
    });
  });

  describe("markVisited", () => {
    it("adds a URL to the visited list", async () => {
      await withFrozenTime({
        now: "2026-02-03T10:00:00Z",
        fn: async () => {
          const repo = useVisitedSitesRepository(repoParams);
          await repo.markVisited("https://example.com");

          expect(repo.visitedData.value.visited).toContain(
            "https://example.com",
          );
        },
      });
    });

    it("does not add duplicate URLs", async () => {
      await withFrozenTime({
        now: "2026-02-03T10:00:00Z",
        fn: async () => {
          const repo = useVisitedSitesRepository(repoParams);
          await repo.markVisited("https://example.com");
          await repo.markVisited("https://example.com");

          expect(repo.visitedData.value.visited).toHaveLength(1);
        },
      });
    });

    it("can mark multiple different URLs", async () => {
      await withFrozenTime({
        now: "2026-02-03T10:00:00Z",
        fn: async () => {
          const repo = useVisitedSitesRepository(repoParams);
          await repo.markVisited("https://site1.com");
          await repo.markVisited("https://site2.com");
          await repo.markVisited("https://site3.com");

          expect(repo.visitedData.value.visited).toHaveLength(3);
        },
      });
    });

    it("persists to localStorage", async () => {
      await withFrozenTime({
        now: "2026-02-03T10:00:00Z",
        fn: async () => {
          const repo = useVisitedSitesRepository(repoParams);
          await repo.markVisited("https://example.com");

          const stored = JSON.parse(
            localStorage.getItem(TEST_VISITED_SITES_STORAGE_KEY)!,
          );
          expect(stored.visited).toContain("https://example.com");
        },
      });
    });

    it("preserves existing visited sites when adding new one", async () => {
      await withFrozenTime({
        now: "2026-02-03T10:00:00Z",
        fn: async () => {
          const existing: VisitedSites = {
            date: "2026-02-03",
            visited: ["https://existing.com"],
          };
          localStorage.setItem(
            TEST_VISITED_SITES_STORAGE_KEY,
            JSON.stringify(existing),
          );

          const repo = useVisitedSitesRepository(repoParams);
          await repo.markVisited("https://new.com");

          expect(repo.visitedData.value.visited).toContain(
            "https://existing.com",
          );
          expect(repo.visitedData.value.visited).toContain("https://new.com");
        },
      });
    });
  });

  describe("serialize", () => {
    it("returns a copy of the current data", async () => {
      await withFrozenTime({
        now: "2026-02-03T10:00:00Z",
        fn: async () => {
          const existing: VisitedSites = {
            date: "2026-02-03",
            visited: ["https://example.com"],
          };
          localStorage.setItem(
            TEST_VISITED_SITES_STORAGE_KEY,
            JSON.stringify(existing),
          );

          const repo = useVisitedSitesRepository(repoParams);
          const serialized = await repo.serialize();

          expect(serialized).toEqual(existing);
        },
      });
    });

    it("returns a shallow copy — mutations do not affect stored data", async () => {
      await withFrozenTime({
        now: "2026-02-03T10:00:00Z",
        fn: async () => {
          const repo = useVisitedSitesRepository(repoParams);
          await repo.markVisited("https://example.com");

          const serialized = await repo.serialize();
          serialized.visited.push("https://mutated.com");

          expect(repo.visitedData.value.visited).not.toContain(
            "https://mutated.com",
          );
        },
      });
    });

    it("serializes empty state correctly", async () => {
      await withFrozenTime({
        now: "2026-02-03T10:00:00Z",
        fn: async () => {
          const repo = useVisitedSitesRepository(repoParams);
          const serialized = await repo.serialize();

          expect(serialized.visited).toEqual([]);
          expect(serialized.date).toBe("2026-02-03");
        },
      });
    });
  });

  describe("hydrate", () => {
    it("replaces current data with provided data", async () => {
      await withFrozenTime({
        now: "2026-02-03T10:00:00Z",
        fn: async () => {
          const repo = useVisitedSitesRepository(repoParams);
          await repo.markVisited("https://old.com");

          const newData: VisitedSites = {
            date: "2026-02-01",
            visited: ["https://imported.com"],
          };

          await repo.hydrate(newData);

          expect(repo.visitedData.value).toEqual(newData);
        },
      });
    });

    it("persists hydrated data to localStorage", async () => {
      await withFrozenTime({
        now: "2026-02-03T10:00:00Z",
        fn: async () => {
          const repo = useVisitedSitesRepository(repoParams);
          const newData: VisitedSites = {
            date: "2026-02-01",
            visited: ["https://imported.com"],
          };

          await repo.hydrate(newData);

          const stored = JSON.parse(
            localStorage.getItem(TEST_VISITED_SITES_STORAGE_KEY)!,
          );
          expect(stored).toEqual(newData);
        },
      });
    });

    it("hydrates empty visited list", async () => {
      await withFrozenTime({
        now: "2026-02-03T10:00:00Z",
        fn: async () => {
          const repo = useVisitedSitesRepository(repoParams);
          await repo.markVisited("https://existing.com");

          await repo.hydrate({ date: "2026-02-03", visited: [] });

          expect(repo.visitedData.value.visited).toEqual([]);
        },
      });
    });

    it("rejects data missing date field", async () => {
      const repo = useVisitedSitesRepository(repoParams);

      await expect(
        repo.hydrate({ visited: ["https://example.com"] } as VisitedSites),
      ).rejects.toThrow();
    });

    it("rejects data with non-array visited field", async () => {
      const repo = useVisitedSitesRepository(repoParams);

      await expect(
        repo.hydrate({
          date: "2026-02-03",
          visited: null as unknown as string[],
        }),
      ).rejects.toThrow();
    });

    it("does not trigger reset during hydration of stale data", async () => {
      await withFrozenTime({
        now: "2026-02-03T10:00:00Z",
        fn: async () => {
          const repo = useVisitedSitesRepository({
            storageKey: TEST_VISITED_SITES_STORAGE_KEY,
            skipInitReset: false,
          });

          const oldData: VisitedSites = {
            date: "2026-01-01",
            visited: ["https://old.com"],
          };

          await repo.hydrate(oldData);

          // Data should be exactly what was hydrated, not reset to today
          expect(repo.visitedData.value).toEqual(oldData);
        },
      });
    });
  });
});
