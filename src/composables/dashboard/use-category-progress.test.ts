// /src/composables/dashboard/use-category-progress.test.ts

import { vi, describe, it, expect, beforeEach } from "vitest";
import { ref } from "vue";

import { useJobSites } from "@/composables/data/use-job-sites";
import { useVisitedSites } from "@/composables/data/use-visited-sites";
import { mockJobHuntData, mockCategories, mockSites } from "@/test-utils/mocks";
import type { JobCategory, JobHuntData } from "@/types";

import { useCategoryProgress } from "./use-category-progress";

vi.mock("@/composables/data/use-job-sites");
vi.mock("@/composables/data/use-visited-sites");

const mockUseJobSites = vi.mocked(useJobSites);
const mockUseVisitedSites = vi.mocked(useVisitedSites);

function setupWithData(
  data = mockJobHuntData,
  isSiteVisited: (url: string) => boolean = () => false,
) {
  const categories = ref(data.categories);
  const sites = ref(data.sites);

  mockUseJobSites.mockReturnValue({
    categories,
    sites,
    getSitesByCategory: (categoryId: string) =>
      sites.value.filter(s => s.categoryId === categoryId),
  } as ReturnType<typeof useJobSites>);

  mockUseVisitedSites.mockReturnValue({
    isSiteVisited,
  } as ReturnType<typeof useVisitedSites>);

  return useCategoryProgress({ isSiteVisited });
}

describe("useCategoryProgress", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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

    const { getCategoryProgress } = setupWithData(mockJobHuntData, isVisited);

    // 2 of 5 visited → 40%
    expect(getCategoryProgress(mockCategories.techCompanies)).toBe(40);
  });

  it("returns 0 progress for category with no sites", () => {
    const data: JobHuntData = {
      categories: [
        {
          id: "empty",
          name: "Empty",
          createdAt: "2024-01-15T12:00:00Z",
          updatedAt: "2024-01-15T12:00:00Z",
        },
      ],
      sites: [],
    };

    const { getCategoryProgress } = setupWithData(data, () => true);

    expect(
      getCategoryProgress({
        id: "empty",
        name: "Empty",
        createdAt: "2024-01-15T12:00:00Z",
        updatedAt: "2024-01-15T12:00:00Z",
      }),
    ).toBe(0);
  });

  it("returns the correct visited site count for a category", () => {
    const isVisited = (url: string) => url === mockSites.workday.url;

    const { getCategoryVisitedCount } = setupWithData(
      mockJobHuntData,
      isVisited,
    );

    expect(getCategoryVisitedCount(mockCategories.techCompanies)).toBe(1);
  });

  it("calculates maxCategoryHeight capped at 6", () => {
    const data: JobHuntData = {
      categories: [
        {
          id: "huge",
          name: "Huge",
          createdAt: "2024-01-15T12:00:00Z",
          updatedAt: "2024-01-15T12:00:00Z",
        },
        {
          id: "small",
          name: "Small",
          createdAt: "2024-01-15T12:00:00Z",
          updatedAt: "2024-01-15T12:00:00Z",
        },
      ],
      sites: [
        ...Array.from({ length: 10 }, (_, i) => ({
          id: `huge-${i}`,
          name: `Site ${i}`,
          url: `https://huge${i}.com`,
          categoryId: "huge",
          createdAt: "2024-01-15T12:00:00Z",
          updatedAt: "2024-01-15T12:00:00Z",
        })),
        {
          id: "small-1",
          name: "One",
          url: "https://one.com",
          categoryId: "small",
          createdAt: "2024-01-15T12:00:00Z",
          updatedAt: "2024-01-15T12:00:00Z",
        },
      ],
    };

    const { maxCategoryHeight } = setupWithData(data);

    expect(maxCategoryHeight.value).toBe(6);
  });

  it("categoryStats contains all computed stats per category", () => {
    const isVisited = (url: string) =>
      url === mockSites.workday.url || url === mockSites.greenhouse.url;

    const { categoryStats } = setupWithData(mockJobHuntData, isVisited);

    const techStats = categoryStats.value.find(
      s => s.category.id === mockCategories.techCompanies.id,
    );

    expect(techStats).toBeDefined();
    expect(techStats?.visitedCount).toBe(2);
    expect(techStats?.progress).toBe(40);
  });

  it("getCategoryStats returns stats for existing category", () => {
    const isVisited = (url: string) => url === mockSites.workday.url;

    const { getCategoryStats } = setupWithData(mockJobHuntData, isVisited);

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
      createdAt: "2024-01-15T12:00:00Z",
      updatedAt: "2024-01-15T12:00:00Z",
    };
    expect(getCategoryStats(fakeCategory)).toBeUndefined();
  });

  it("getCategoryProgress returns 0 for non-existent category", () => {
    const { getCategoryProgress } = setupWithData();

    const fakeCategory: JobCategory = {
      id: "nonexistent",
      name: "Non-existent",
      createdAt: "2024-01-15T12:00:00Z",
      updatedAt: "2024-01-15T12:00:00Z",
    };
    expect(getCategoryProgress(fakeCategory)).toBe(0);
  });

  it("getCategoryVisitedCount returns 0 for non-existent category", () => {
    const { getCategoryVisitedCount } = setupWithData();

    const fakeCategory: JobCategory = {
      id: "nonexistent",
      name: "Non-existent",
      createdAt: "2024-01-15T12:00:00Z",
      updatedAt: "2024-01-15T12:00:00Z",
    };
    expect(getCategoryVisitedCount(fakeCategory)).toBe(0);
  });

  it("handles empty categories array gracefully", () => {
    const data: JobHuntData = { categories: [], sites: [] };

    const { sortedCategories, categoryStats, maxCategoryHeight } =
      setupWithData(data);

    expect(sortedCategories.value).toEqual([]);
    expect(categoryStats.value).toEqual([]);
    expect(maxCategoryHeight.value).toBe(0);
  });

  it("handles categories with no sites", () => {
    const data: JobHuntData = {
      categories: [
        {
          id: "empty-1",
          name: "Empty 1",
          createdAt: "2024-01-15T12:00:00Z",
          updatedAt: "2024-01-15T12:00:00Z",
        },
        {
          id: "empty-2",
          name: "Empty 2",
          createdAt: "2024-01-15T12:00:00Z",
          updatedAt: "2024-01-15T12:00:00Z",
        },
      ],
      sites: [],
    };

    const { maxCategoryHeight } = setupWithData(data);

    expect(maxCategoryHeight.value).toBe(0);
  });
});
