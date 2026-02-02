import { describe, expect, it } from "vitest";

import type { JobHuntData } from "@/types";

import { useCategoryProgress } from "./use-category-progress";

const mockData: JobHuntData = {
  categories: [
    {
      name: "Big Category",
      sites: [
        { name: "Zebra", url: "z.com" },
        { name: "Alpha", url: "a.com" },
        { name: "Beta", url: "b.com" },
      ],
    },
    {
      name: "Small Category",
      sites: [{ name: "Delta", url: "d.com" }],
    },
  ],
};

describe("useCategoryProgress", () => {
  it("sorts categories by site count and sites alphabetically", () => {
    const isVisited = () => false;

    const { sortedCategories } = useCategoryProgress(mockData, isVisited);

    expect(sortedCategories.value[0].name).toBe("Big Category");
    expect(sortedCategories.value[1].name).toBe("Small Category");

    const siteNames = sortedCategories.value[0].sites.map(s => s.name);
    expect(siteNames).toEqual(["Alpha", "Beta", "Zebra"]);
  });

  it("splits category sites into visited and unvisited", () => {
    const isVisited = (url: string) => url === "b.com";

    const { splitCategorySites } = useCategoryProgress(mockData, isVisited);

    const category = mockData.categories[0];
    const result = splitCategorySites(category);

    expect(result.visited.map(s => s.name)).toEqual(["Beta"]);
    expect(result.unvisited.map(s => s.name)).toEqual(["Alpha", "Zebra"]);
  });

  it("calculates category progress correctly", () => {
    const isVisited = (url: string) => url === "a.com" || url === "b.com";

    const { getCategoryProgress } = useCategoryProgress(mockData, isVisited);

    const category = mockData.categories[0];

    // 2 of 3 visited → 67%
    expect(getCategoryProgress(category)).toBe(67);
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
    const isVisited = (url: string) => url === "a.com";

    const { getCategoryVisitedCount } = useCategoryProgress(
      mockData,
      isVisited,
    );

    const category = mockData.categories[0];

    expect(getCategoryVisitedCount(category)).toBe(1);
  });

  it("calculates maxCategoryHeight capped at 6", () => {
    const isVisited = () => false;

    const data: JobHuntData = {
      categories: [
        {
          name: "Huge",
          sites: Array.from({ length: 10 }, (_, i) => ({
            name: `Site ${i}`,
            url: `${i}.com`,
          })),
        },
        {
          name: "Small",
          sites: [{ name: "One", url: "1.com" }],
        },
      ],
    };

    const { maxCategoryHeight } = useCategoryProgress(data, isVisited);

    expect(maxCategoryHeight.value).toBe(6);
  });

  it("categoryStats contains all computed stats per category", () => {
    const isVisited = (url: string) => url === "a.com" || url === "b.com";

    const { categoryStats } = useCategoryProgress(mockData, isVisited);

    const bigCategoryStats = categoryStats.value.find(
      s => s.category.name === "Big Category",
    );

    expect(bigCategoryStats).toBeDefined();
    expect(bigCategoryStats?.visitedCount).toBe(2);
    expect(bigCategoryStats?.progress).toBe(67);
    expect(bigCategoryStats?.visited).toHaveLength(2);
    expect(bigCategoryStats?.unvisited).toHaveLength(1);
  });

  it("categoryStats sorts visited and unvisited sites alphabetically", () => {
    const isVisited = (url: string) => url === "z.com" || url === "a.com";

    const { categoryStats } = useCategoryProgress(mockData, isVisited);

    const bigCategoryStats = categoryStats.value.find(
      s => s.category.name === "Big Category",
    );

    expect(bigCategoryStats?.visited.map(s => s.name)).toEqual([
      "Alpha",
      "Zebra",
    ]);
    expect(bigCategoryStats?.unvisited.map(s => s.name)).toEqual(["Beta"]);
  });

  it("getCategoryStats returns stats for existing category", () => {
    const isVisited = (url: string) => url === "a.com";

    const { getCategoryStats } = useCategoryProgress(mockData, isVisited);

    const category = mockData.categories[0];
    const stats = getCategoryStats(category);

    expect(stats).toBeDefined();
    expect(stats?.category.name).toBe("Big Category");
    expect(stats?.visitedCount).toBe(1);
  });

  it("getCategoryStats returns undefined for non-existent category", () => {
    const isVisited = () => false;

    const { getCategoryStats } = useCategoryProgress(mockData, isVisited);

    const fakeCategory = { name: "Non-existent", sites: [] };
    const stats = getCategoryStats(fakeCategory);

    expect(stats).toBeUndefined();
  });

  it("splitCategorySites returns empty arrays for non-existent category", () => {
    const isVisited = () => false;

    const { splitCategorySites } = useCategoryProgress(mockData, isVisited);

    const fakeCategory = { name: "Non-existent", sites: [] };
    const result = splitCategorySites(fakeCategory);

    expect(result.visited).toEqual([]);
    expect(result.unvisited).toEqual([]);
  });

  it("getCategoryProgress returns 0 for non-existent category", () => {
    const isVisited = () => false;

    const { getCategoryProgress } = useCategoryProgress(mockData, isVisited);

    const fakeCategory = { name: "Non-existent", sites: [] };

    expect(getCategoryProgress(fakeCategory)).toBe(0);
  });

  it("getCategoryVisitedCount returns 0 for non-existent category", () => {
    const isVisited = () => false;

    const { getCategoryVisitedCount } = useCategoryProgress(
      mockData,
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
