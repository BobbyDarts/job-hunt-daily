// /src/composables/data/use-visited-sites.test.ts

import { describe, it, expect, beforeEach, vi } from "vitest";
import { nextTick } from "vue";

import { getToday, todayIso } from "@/lib/time";
import { withFrozenTime } from "@/test-utils/with-frozen-time";

import { TEST_VISITED_SITES_STORAGE_KEY } from "./keys";
import { useVisitedSites } from "./use-visited-sites";

describe("useVisitedSites", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllTimers();
  });

  it("starts with no visited sites", async () => {
    await withFrozenTime({
      now: "2026-02-19T15:00:00Z",
      fn: async () => {
        const { visitedCount, isComplete } = useVisitedSites({
          storageKey: TEST_VISITED_SITES_STORAGE_KEY,
        });

        expect(visitedCount.value).toBe(0);
        expect(isComplete.value).toBe(false);
      },
    });
  });

  it("marks a site as visited and persists it", async () => {
    await withFrozenTime({
      now: "2026-02-19T15:00:00Z",
      fn: async () => {
        const today = todayIso();

        const { markVisited, isSiteVisited, visitedCount } = useVisitedSites({
          storageKey: TEST_VISITED_SITES_STORAGE_KEY,
        });

        await markVisited("https://example.com");
        await nextTick();

        expect(isSiteVisited("https://example.com")).toBe(true);
        expect(visitedCount.value).toBe(1);

        const stored = JSON.parse(
          localStorage.getItem(TEST_VISITED_SITES_STORAGE_KEY)!,
        );
        expect(stored.visited).toContain("https://example.com");
        expect(stored.date).toBe(today);
      },
    });
  });

  it("does not duplicate visited sites", async () => {
    await withFrozenTime({
      now: "2026-02-19T15:00:00Z",
      fn: async () => {
        const { markVisited, visitedCount } = useVisitedSites({
          storageKey: TEST_VISITED_SITES_STORAGE_KEY,
        });

        await markVisited("https://example.com");
        await markVisited("https://example.com");

        await nextTick();
        expect(visitedCount.value).toBe(1);
      },
    });
  });

  it("loads visited sites from localStorage on mount (same day)", async () => {
    await withFrozenTime({
      now: "2026-02-19T15:00:00Z",
      fn: async () => {
        const today = todayIso();

        localStorage.setItem(
          TEST_VISITED_SITES_STORAGE_KEY,
          JSON.stringify({
            date: today,
            visited: ["https://example1.com", "https://example2.com"],
          }),
        );

        const { visitedCount, isSiteVisited } = useVisitedSites({
          storageKey: TEST_VISITED_SITES_STORAGE_KEY,
        });

        expect(visitedCount.value).toBe(2);
        expect(isSiteVisited("https://example1.com")).toBe(true);
        expect(isSiteVisited("https://example2.com")).toBe(true);
      },
    });
  });

  it("resets visited sites if stored date is from a previous day", async () => {
    await withFrozenTime({
      now: "2026-02-19T15:00:00Z",
      fn: async () => {
        const today = todayIso();
        const yesterday = getToday().subtract({ days: 1 }).toString();

        localStorage.setItem(
          TEST_VISITED_SITES_STORAGE_KEY,
          JSON.stringify({
            date: yesterday,
            visited: ["https://example1.com", "https://example2.com"],
          }),
        );

        const { visitedCount } = useVisitedSites({
          storageKey: TEST_VISITED_SITES_STORAGE_KEY,
        });

        await nextTick();

        expect(visitedCount.value).toBe(0);

        const stored = JSON.parse(
          localStorage.getItem(TEST_VISITED_SITES_STORAGE_KEY)!,
        );
        expect(stored.visited).toEqual([]);
        expect(stored.date).toBe(today);
      },
    });
  });
});
