// /src/composables/dashboard/use-category-progress.test.ts

import { useLocalStorage } from "@vueuse/core";
import { describe, expect, it } from "vitest";

import { TEST_JOB_SITES_STORAGE_KEY } from "@/composables/data/keys";
import { mockJobHuntData, mockCategories, mockSites } from "@/test-utils/mocks";
import type { JobCategory, JobHuntData } from "@/types";

import { useCategoryProgress } from "./use-category-progress";

function setupWithData(
  data: JobHuntData = mockJobHuntData,
  key = TEST_JOB_SITES_STORAGE_KEY,
  isSiteVisited: (url: string) => boolean = () => false,
) {
  const storage = useLocalStorage<JobHuntData>(key, data);
  storage.value = data;
  return useCategoryProgress({ storageKey: key, isSiteVisited });
}

describe("useCategoryProgress", () => {
  it("sorts categories by site count descending", () => {
    const { sortedCategories } = setupWithData();

    // Tech Companies has 5, Startups has 2, Small Category has 1
    expect(sortedCategories.value[0].name).toBe("Tech Companies");
    expect(sortedCategories.value[1].name).toBe("Startups");
    expect(sortedCategories.value[2].name).toBe("Small Category");
  });

  it("sorts sites alphabetically within categoryStats", () => {
    const { categoryStats } = setupWithData();

    const techStats = categoryStats.value.find(
      s => s.category.id === mockCategories.techCompanies.id,
    );
    const siteNames = techStats?.sites.map(s => s.name);
    expect(siteNames).toEqual([
      "Alpha Inc",
      "Greenhouse Company",
      "Regular Site",
      "Workday Company",
      "Zebra Corp",
    ]);
  });

  it("calculates category progress correctly", () => {
    const isVisited = (url: string) =>
      url === mockSites.workday.url || url === mockSites.greenhouse.url;

    const { getCategoryProgress } = setupWithData(
      mockJobHuntData,
      "test-progress-calc",
      isVisited,
    );

    // 2 of 5 visited → 40%
    expect(getCategoryProgress(mockCategories.techCompanies)).toBe(40);
  });

  it("returns 0 progress for category with no sites", () => {
    const data: JobHuntData = {
      categories: [{ id: "empty", name: "Empty" }],
      sites: [],
    };

    const { getCategoryProgress } = setupWithData(
      data,
      "test-progress-empty",
      () => true,
    );

    expect(getCategoryProgress({ id: "empty", name: "Empty" })).toBe(0);
  });

  it("returns the correct visited site count for a category", () => {
    const isVisited = (url: string) => url === mockSites.workday.url;

    const { getCategoryVisitedCount } = setupWithData(
      mockJobHuntData,
      "test-visited-count",
      isVisited,
    );

    expect(getCategoryVisitedCount(mockCategories.techCompanies)).toBe(1);
  });

  it("calculates maxCategoryHeight capped at 6", () => {
    const data: JobHuntData = {
      categories: [
        { id: "huge", name: "Huge" },
        { id: "small", name: "Small" },
      ],
      sites: [
        ...Array.from({ length: 10 }, (_, i) => ({
          id: `huge-${i}`,
          name: `Site ${i}`,
          url: `https://huge${i}.com`,
          categoryId: "huge",
        })),
        {
          id: "small-1",
          name: "One",
          url: "https://one.com",
          categoryId: "small",
        },
      ],
    };

    const { maxCategoryHeight } = setupWithData(data, "test-max-height");

    expect(maxCategoryHeight.value).toBe(6);
  });

  it("categoryStats contains all computed stats per category", () => {
    const isVisited = (url: string) =>
      url === mockSites.workday.url || url === mockSites.greenhouse.url;

    const { categoryStats } = setupWithData(
      mockJobHuntData,
      "test-category-stats",
      isVisited,
    );

    const techStats = categoryStats.value.find(
      s => s.category.id === mockCategories.techCompanies.id,
    );

    expect(techStats).toBeDefined();
    expect(techStats?.visitedCount).toBe(2);
    expect(techStats?.progress).toBe(40);
  });

  it("getCategoryStats returns stats for existing category", () => {
    const isVisited = (url: string) => url === mockSites.workday.url;

    const { getCategoryStats } = setupWithData(
      mockJobHuntData,
      "test-get-stats",
      isVisited,
    );

    const stats = getCategoryStats(mockCategories.techCompanies);

    expect(stats).toBeDefined();
    expect(stats?.category.name).toBe("Tech Companies");
    expect(stats?.visitedCount).toBe(1);
  });

  it("getCategoryStats returns undefined for non-existent category", () => {
    const { getCategoryStats } = setupWithData();

    const fakeCategory: JobCategory = {
      id: "nonexistent",
      name: "Non-existent",
    };
    expect(getCategoryStats(fakeCategory)).toBeUndefined();
  });

  it("getCategoryProgress returns 0 for non-existent category", () => {
    const { getCategoryProgress } = setupWithData();

    const fakeCategory: JobCategory = {
      id: "nonexistent",
      name: "Non-existent",
    };
    expect(getCategoryProgress(fakeCategory)).toBe(0);
  });

  it("getCategoryVisitedCount returns 0 for non-existent category", () => {
    const { getCategoryVisitedCount } = setupWithData();

    const fakeCategory: JobCategory = {
      id: "nonexistent",
      name: "Non-existent",
    };
    expect(getCategoryVisitedCount(fakeCategory)).toBe(0);
  });

  it("handles empty categories array gracefully", () => {
    const data: JobHuntData = { categories: [], sites: [] };

    const { sortedCategories, categoryStats, maxCategoryHeight } =
      setupWithData(data, "test-empty-categories");

    expect(sortedCategories.value).toEqual([]);
    expect(categoryStats.value).toEqual([]);
    expect(maxCategoryHeight.value).toBe(0);
  });

  it("handles categories with no sites", () => {
    const data: JobHuntData = {
      categories: [
        { id: "empty-1", name: "Empty 1" },
        { id: "empty-2", name: "Empty 2" },
      ],
      sites: [],
    };

    const { maxCategoryHeight } = setupWithData(data, "test-empty-sites");

    expect(maxCategoryHeight.value).toBe(0);
  });
});
