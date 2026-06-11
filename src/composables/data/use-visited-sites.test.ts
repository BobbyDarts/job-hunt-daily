// /src/composables/data/use-visited-sites.test.ts

import { flushPromises } from "@vue/test-utils";
import { describe, it, expect, beforeEach, vi } from "vitest";

import { todayIso } from "@/lib/time";
import { withFrozenTime } from "@/test-utils/with-frozen-time";
import type { VisitedSiteHistory, VisitedSites } from "@/types";

import { useVisitedSites } from "./use-visited-sites";

const mockRepo = vi.hoisted(() => ({
  getByDate: vi.fn(),
  getHistoryAll: vi.fn(),
  markVisited: vi.fn(),
  createHistory: vi.fn(),
  reset: vi.fn(),
  serialize: vi.fn(),
  hydrate: vi.fn(),
}));

vi.mock(
  "@/services/repositories/visited-sites/create-visited-sites-repository",
  () => ({
    getVisitedSitesRepository: vi.fn(() => mockRepo),
  }),
);

vi.mock("@/composables/data/use-job-sites", () => ({
  useJobSites: () => ({
    totalSites: { value: 3 },
  }),
}));

function makeToday(visited: string[] = []): VisitedSites {
  return { date: todayIso(), visited };
}

function makeHistory(entries: Partial<VisitedSiteHistory>[] = []) {
  return entries.map(e => ({
    date: e.date ?? todayIso(),
    visitedUrls: e.visitedUrls ?? [],
    totalSites: e.totalSites ?? 3,
  }));
}

describe("useVisitedSites", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRepo.getByDate.mockResolvedValue(makeToday());
    mockRepo.getHistoryAll.mockResolvedValue([]);
    mockRepo.markVisited.mockResolvedValue(undefined);
    mockRepo.createHistory.mockResolvedValue(undefined);
    mockRepo.reset.mockResolvedValue(undefined);
    mockRepo.serialize.mockResolvedValue({ today: makeToday(), history: [] });
    mockRepo.hydrate.mockResolvedValue(undefined);
  });

  describe("initialization", () => {
    it("starts with empty visited sites before init", () => {
      const { visitedCount, isComplete } = useVisitedSites();
      expect(visitedCount.value).toBe(0);
      expect(isComplete.value).toBe(false);
    });

    it("loads today's visited sites on init", async () => {
      mockRepo.getByDate.mockResolvedValue(
        makeToday(["https://a.com", "https://b.com"]),
      );

      const { visitedCount, isSiteVisited } = useVisitedSites();
      await useVisitedSites().init();
      await flushPromises();

      expect(visitedCount.value).toBe(2);
      expect(isSiteVisited("https://a.com")).toBe(true);
      expect(isSiteVisited("https://b.com")).toBe(true);
    });

    it("resets and snapshots if stored date is stale", async () => {
      await withFrozenTime({
        now: "2026-04-19T10:00:00Z",
        fn: async () => {
          mockRepo.getByDate.mockResolvedValue({
            date: "2026-04-18",
            visited: ["https://a.com"],
          });

          await useVisitedSites().init();
          await flushPromises();

          expect(mockRepo.createHistory).toHaveBeenCalledWith({
            date: "2026-04-18",
            visitedUrls: ["https://a.com"],
            totalSites: 3,
          });
          expect(mockRepo.reset).toHaveBeenCalled();
        },
      });
    });

    it("does not snapshot if stale date has no visits", async () => {
      await withFrozenTime({
        now: "2026-04-19T10:00:00Z",
        fn: async () => {
          mockRepo.getByDate.mockResolvedValue({
            date: "2026-04-18",
            visited: [],
          });

          await useVisitedSites().init();
          await flushPromises();

          expect(mockRepo.createHistory).not.toHaveBeenCalled();
          expect(mockRepo.reset).toHaveBeenCalled();
        },
      });
    });
  });

  describe("markVisited", () => {
    it("calls repo.markVisited and refreshes", async () => {
      await useVisitedSites().init();
      await flushPromises();

      mockRepo.getByDate.mockResolvedValue(makeToday(["https://a.com"]));

      const { markVisited, isSiteVisited } = useVisitedSites();
      await markVisited("https://a.com");
      await flushPromises();

      expect(mockRepo.markVisited).toHaveBeenCalledWith("https://a.com");
      expect(isSiteVisited("https://a.com")).toBe(true);
    });

    it("does not duplicate visited sites", async () => {
      await useVisitedSites().init();
      await flushPromises();

      const { markVisited } = useVisitedSites();
      await markVisited("https://a.com");
      await markVisited("https://a.com");

      expect(mockRepo.markVisited).toHaveBeenCalledTimes(2);
    });
  });

  describe("isSiteVisited", () => {
    it("returns true for visited site", async () => {
      mockRepo.getByDate.mockResolvedValue(makeToday(["https://a.com"]));

      await useVisitedSites().init();
      await flushPromises();

      expect(useVisitedSites().isSiteVisited("https://a.com")).toBe(true);
    });

    it("returns false for unvisited site", async () => {
      await useVisitedSites().init();
      await flushPromises();

      expect(useVisitedSites().isSiteVisited("https://a.com")).toBe(false);
    });
  });

  describe("isComplete", () => {
    it("returns false when no sites visited", async () => {
      await useVisitedSites().init();
      await flushPromises();

      expect(useVisitedSites().isComplete.value).toBe(false);
    });

    it("returns true when all sites visited", async () => {
      mockRepo.getByDate.mockResolvedValue(
        makeToday(["https://a.com", "https://b.com", "https://c.com"]),
      );

      await useVisitedSites().init();
      await flushPromises();

      expect(useVisitedSites().isComplete.value).toBe(true);
    });
  });

  describe("serialize", () => {
    it("delegates to repo.serialize", async () => {
      const expected = {
        today: makeToday(["https://a.com"]),
        history: makeHistory([{ date: "2026-04-18" }]),
      };
      mockRepo.serialize.mockResolvedValue(expected);

      await useVisitedSites().init();
      await flushPromises();

      const result = await useVisitedSites().serialize();
      expect(mockRepo.serialize).toHaveBeenCalled();
      expect(result).toEqual(expected);
    });
  });

  describe("hydrate", () => {
    it("delegates to repo.hydrate and refreshes", async () => {
      await useVisitedSites().init();
      await flushPromises();

      const data = {
        today: makeToday(["https://a.com"]),
        history: [],
      };

      mockRepo.getByDate.mockResolvedValue(data.today);

      await useVisitedSites().hydrate(data);
      await flushPromises();

      expect(mockRepo.hydrate).toHaveBeenCalledWith(data);
      expect(useVisitedSites().isSiteVisited("https://a.com")).toBe(true);
    });
  });
});
