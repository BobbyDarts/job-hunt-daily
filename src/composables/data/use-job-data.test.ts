// /src/composables/data/use-job-data.test.ts

import { describe, expect, it } from "vitest";

import { useJobData } from "./use-job-data";

describe("useJobData", () => {
  it("returns data", () => {
    const { data } = useJobData();
    expect(data).toBeDefined();
    expect(data.categories).toBeDefined();
    expect(Array.isArray(data.categories)).toBe(true);
    expect(data.categories.length).toBeGreaterThan(0);
  });

  it("data has categories with sites", () => {
    const { data } = useJobData();
    data.categories.forEach(category => {
      expect(category.name).toBeDefined();
      expect(Array.isArray(category.sites)).toBe(true);
    });
  });

  it("returns totalSites", () => {
    const { totalSites, data } = useJobData();
    const expected = data.categories.reduce(
      (sum, cat) => sum + cat.sites.length,
      0,
    );
    expect(totalSites.value).toBe(expected);
  });

  it("returns allSitesWithCategory", () => {
    const { allSitesWithCategory, data } = useJobData();
    const expected = data.categories.reduce(
      (sum, cat) => sum + cat.sites.length,
      0,
    );
    expect(allSitesWithCategory.value.length).toBe(expected);
  });

  it("allSitesWithCategory entries have category property", () => {
    const { allSitesWithCategory } = useJobData();
    allSitesWithCategory.value.forEach(site => {
      expect(site.category).toBeDefined();
      expect(typeof site.category).toBe("string");
    });
  });

  it("getSiteById returns correct site", () => {
    const { getSiteById, data } = useJobData();
    const firstSite = data.categories[0].sites[0];
    const result = getSiteById(firstSite.id);
    expect(result).toBeDefined();
    expect(result?.id).toBe(firstSite.id);
  });

  it("getSiteById returns undefined for unknown id", () => {
    const { getSiteById } = useJobData();
    expect(getSiteById("does-not-exist")).toBeUndefined();
  });

  it("is a singleton — same instance returned each call", () => {
    const instance1 = useJobData();
    const instance2 = useJobData();
    expect(instance1.data).toBe(instance2.data);
    expect(instance1.totalSites).toBe(instance2.totalSites);
  });
});
