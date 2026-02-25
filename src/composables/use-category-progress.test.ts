// /src/composables/use-category-progress.test.ts

import { describe, expect, it } from "vitest";

import { mockJobHuntData } from "@/test-utils/mocks";
import type { JobHuntData } from "@/types";

import { useCategoryProgress } from "./use-category-progress";

describe("useCategoryProgress", () => {
  it("sorts categories by site count and sites alphabetically", () => {
    const isVisited = () => false;

    const { sortedCategories } = useCategoryProgress(
      mockJobHuntData,
      isVisited,
    );

    // Tech Companies has 5 sites, Startups has 2, Small Category has 1
    expect(sortedCategories.value[0].name).toBe("Tech Companies");
    expect(sortedCategories.value[1].name).toBe("Startups");
    expect(sortedCategories.value[2].name).toBe("Small Category");

    // Sites within Tech Companies should be alphabetically sorted
    const siteNames = sortedCategories.value[0].sites.map(s => s.name);
    expect(siteNames).toEqual([
      "Alpha Inc",
      "Greenhouse Company",
      "Regular Site",
      "Workday Company",
      "Zebra Corp",
    ]);
  });

  it("splits category sites into visited and unvisited", () => {
    const isVisited = (url: string) =>
      url === "https://my.greenhouse.io" || url === "https://alpha.com/jobs";

    const { splitCategorySites } = useCategoryProgress(
      mockJobHuntData,
      isVisited,
    );

    const category = mockJobHuntData.categories[0]; // Tech Companies
    const result = splitCategorySites(category);

    expect(result.visited.map(s => s.name)).toEqual([
      "Alpha Inc",
      "Greenhouse Company",
    ]);
    expect(result.unvisited.map(s => s.name)).toEqual([
      "Regular Site",
      "Workday Company",
      "Zebra Corp",
    ]);
  });

  it("calculates category progress correctly", () => {
    const isVisited = (url: string) =>
      url === "https://company.wd1.myworkdayjobs.com/jobs" ||
      url === "https://my.greenhouse.io";

    const { getCategoryProgress } = useCategoryProgress(
      mockJobHuntData,
      isVisited,
    );

    const category = mockJobHuntData.categories[0]; // Tech Companies

    // 2 of 5 visited → 40%
    expect(getCategoryProgress(category)).toBe(40);
  });

  it("returns 0 progress for empty categories", () => {
    const isVisited = () => true;

    const data: JobHuntData = {
      categories: [{ name: "Empty", sites: [] }],
    };

    const { getCategoryProgress } = useCategoryProgress(data, isVisited);

    expect(getCategoryProgress(data.categories[0])).toBe(0);
  });

  it("returns the correct visited site count for a category", () => {
    const isVisited = (url: string) =>
      url === "https://company.wd1.myworkdayjobs.com/jobs";

    const { getCategoryVisitedCount } = useCategoryProgress(
      mockJobHuntData,
      isVisited,
    );

    const category = mockJobHuntData.categories[0]; // Tech Companies

    expect(getCategoryVisitedCount(category)).toBe(1);
  });

  it("calculates maxCategoryHeight capped at 6", () => {
    const isVisited = () => false;

    const data: JobHuntData = {
      categories: [
        {
          name: "Huge",
          sites: Array.from({ length: 10 }, (_, i) => ({
            id: `huge-${i}`,
            name: `Site ${i}`,
            url: `${i}.com`,
          })),
        },
        {
          name: "Small",
          sites: [{ id: `small-1`, name: "One", url: "1.com" }],
        },
      ],
    };

    const { maxCategoryHeight } = useCategoryProgress(data, isVisited);

    expect(maxCategoryHeight.value).toBe(6);
  });

  it("categoryStats contains all computed stats per category", () => {
    const isVisited = (url: string) =>
      url === "https://company.wd1.myworkdayjobs.com/jobs" ||
      url === "https://my.greenhouse.io";

    const { categoryStats } = useCategoryProgress(mockJobHuntData, isVisited);

    const techCategoryStats = categoryStats.value.find(
      s => s.category.name === "Tech Companies",
    );

    expect(techCategoryStats).toBeDefined();
    expect(techCategoryStats?.visitedCount).toBe(2);
    expect(techCategoryStats?.progress).toBe(40);
    expect(techCategoryStats?.visited).toHaveLength(2);
    expect(techCategoryStats?.unvisited).toHaveLength(3);
  });

  it("categoryStats sorts visited and unvisited sites alphabetically", () => {
    const isVisited = (url: string) =>
      url === "https://zebra.com/careers" || url === "https://alpha.com/jobs";

    const { categoryStats } = useCategoryProgress(mockJobHuntData, isVisited);

    const techCategoryStats = categoryStats.value.find(
      s => s.category.name === "Tech Companies",
    );

    expect(techCategoryStats?.visited.map(s => s.name)).toEqual([
      "Alpha Inc",
      "Zebra Corp",
    ]);
    expect(techCategoryStats?.unvisited.map(s => s.name)).toEqual([
      "Greenhouse Company",
      "Regular Site",
      "Workday Company",
    ]);
  });

  it("getCategoryStats returns stats for existing category", () => {
    const isVisited = (url: string) =>
      url === "https://company.wd1.myworkdayjobs.com/jobs";

    const { getCategoryStats } = useCategoryProgress(
      mockJobHuntData,
      isVisited,
    );

    const category = mockJobHuntData.categories[0]; // Tech Companies
    const stats = getCategoryStats(category);

    expect(stats).toBeDefined();
    expect(stats?.category.name).toBe("Tech Companies");
    expect(stats?.visitedCount).toBe(1);
  });

  it("getCategoryStats returns undefined for non-existent category", () => {
    const isVisited = () => false;

    const { getCategoryStats } = useCategoryProgress(
      mockJobHuntData,
      isVisited,
    );

    const fakeCategory = { name: "Non-existent", sites: [] };
    const stats = getCategoryStats(fakeCategory);

    expect(stats).toBeUndefined();
  });

  it("splitCategorySites returns empty arrays for non-existent category", () => {
    const isVisited = () => false;

    const { splitCategorySites } = useCategoryProgress(
      mockJobHuntData,
      isVisited,
    );

    const fakeCategory = { name: "Non-existent", sites: [] };
    const result = splitCategorySites(fakeCategory);

    expect(result.visited).toEqual([]);
    expect(result.unvisited).toEqual([]);
  });

  it("getCategoryProgress returns 0 for non-existent category", () => {
    const isVisited = () => false;

    const { getCategoryProgress } = useCategoryProgress(
      mockJobHuntData,
      isVisited,
    );

    const fakeCategory = { name: "Non-existent", sites: [] };

    expect(getCategoryProgress(fakeCategory)).toBe(0);
  });

  it("getCategoryVisitedCount returns 0 for non-existent category", () => {
    const isVisited = () => false;

    const { getCategoryVisitedCount } = useCategoryProgress(
      mockJobHuntData,
      isVisited,
    );

    const fakeCategory = { name: "Non-existent", sites: [] };

    expect(getCategoryVisitedCount(fakeCategory)).toBe(0);
  });

  it("handles empty categories array gracefully", () => {
    const isVisited = () => false;

    const data: JobHuntData = { categories: [] };

    const { maxCategoryHeight, sortedCategories, categoryStats } =
      useCategoryProgress(data, isVisited);

    expect(sortedCategories.value).toEqual([]);
    expect(categoryStats.value).toEqual([]);
    expect(maxCategoryHeight.value).toBe(0);
  });

  it("handles categories with all empty sites arrays", () => {
    const isVisited = () => false;

    const data: JobHuntData = {
      categories: [
        { name: "Empty 1", sites: [] },
        { name: "Empty 2", sites: [] },
      ],
    };

    const { maxCategoryHeight } = useCategoryProgress(data, isVisited);

    expect(maxCategoryHeight.value).toBe(0);
  });
});
