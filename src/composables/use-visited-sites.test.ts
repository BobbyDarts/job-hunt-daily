import { describe, it, expect, beforeEach, vi } from "vitest";
import { ref, nextTick } from "vue";

import { useVisitedSites } from "./use-visited-sites";

const STORAGE_KEY = "test-visited-sites";

describe("useVisitedSites", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllTimers();
  });

  const getTodayDate = () => new Date().toISOString().split("T")[0];

  it("starts with no visited sites", () => {
    const totalSites = ref(5);
    const { visitedCount, isComplete } = useVisitedSites(
      STORAGE_KEY,
      totalSites,
    );

    expect(visitedCount.value).toBe(0);
    expect(isComplete.value).toBe(false);
  });

  it("marks a site as visited and persists it", async () => {
    const totalSites = ref(5);
    const { markVisited, isSiteVisited, visitedCount } = useVisitedSites(
      STORAGE_KEY,
      totalSites,
    );

    markVisited("https://example.com");

    // Wait for reactivity to settle
    await nextTick();

    expect(isSiteVisited("https://example.com")).toBe(true);
    expect(visitedCount.value).toBe(1);

    // Check localStorage - VueUse stores the exact structure we defined
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored.visited).toContain("https://example.com");
    expect(stored.date).toBe(getTodayDate());
  });

  it("does not duplicate visited sites", async () => {
    const totalSites = ref(5);
    const { markVisited, visitedCount } = useVisitedSites(
      STORAGE_KEY,
      totalSites,
    );

    markVisited("https://example.com");
    markVisited("https://example.com");

    await nextTick();

    expect(visitedCount.value).toBe(1);
  });

  it("calculates completion correctly", async () => {
    const totalSites = ref(2);
    const { markVisited, isComplete } = useVisitedSites(
      STORAGE_KEY,
      totalSites,
    );

    expect(isComplete.value).toBe(false);

    markVisited("https://example1.com");
    await nextTick();
    expect(isComplete.value).toBe(false);

    markVisited("https://example2.com");
    await nextTick();
    expect(isComplete.value).toBe(true);
  });

  it("loads visited sites from localStorage on mount (same day)", () => {
    const today = getTodayDate();

    // Pre-populate localStorage
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        date: today,
        visited: ["https://example1.com", "https://example2.com"],
      }),
    );

    const totalSites = ref(5);
    const { visitedCount, isSiteVisited } = useVisitedSites(
      STORAGE_KEY,
      totalSites,
    );

    expect(visitedCount.value).toBe(2);
    expect(isSiteVisited("https://example1.com")).toBe(true);
    expect(isSiteVisited("https://example2.com")).toBe(true);
  });

  it("resets visited sites if stored date is from a previous day", async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayDate = yesterday.toISOString().split("T")[0];

    // Pre-populate with yesterday's data
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        date: yesterdayDate,
        visited: ["https://example1.com", "https://example2.com"],
      }),
    );

    const totalSites = ref(5);
    const { visitedCount } = useVisitedSites(STORAGE_KEY, totalSites);

    // Wait for reactivity to settle after the reset
    await nextTick();

    // Should reset immediately on initialization
    expect(visitedCount.value).toBe(0);

    // Verify localStorage was updated
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored.visited).toEqual([]);
    expect(stored.date).toBe(getTodayDate());
  });

  it("updates isComplete reactively when totalSites changes", async () => {
    const totalSites = ref(2);
    const { markVisited, isComplete } = useVisitedSites(
      STORAGE_KEY,
      totalSites,
    );

    markVisited("https://example1.com");
    markVisited("https://example2.com");
    await nextTick();

    expect(isComplete.value).toBe(true);

    // Increase total sites
    totalSites.value = 3;
    await nextTick();

    expect(isComplete.value).toBe(false);
  });
});
