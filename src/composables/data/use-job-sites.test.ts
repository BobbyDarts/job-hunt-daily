// /src/composables/data/use-job-sites.test.ts

import { useLocalStorage } from "@vueuse/core";
import { describe, it, expect } from "vitest";

import { mockJobHuntData, mockSites } from "@/test-utils/mocks";

import { TEST_JOB_SITES_STORAGE_KEY } from "./keys";
import { useJobSites } from "./use-job-sites";

function setupWithMockData(
  data = mockJobHuntData,
  key = TEST_JOB_SITES_STORAGE_KEY,
) {
  const storage = useLocalStorage(key, data);
  storage.value = data;
  return useJobSites({ storageKey: key });
}

describe("useJobSites", () => {
  describe("getSiteById", () => {
    it("returns site when ID exists", () => {
      const { getSiteById } = setupWithMockData();

      const site = getSiteById(mockSites.workday.id);
      expect(site).toBeDefined();
      expect(site?.name).toBe("Workday Company");
      expect(site?.url).toBe("https://company.wd1.myworkdayjobs.com/jobs");
    });

    it("returns undefined when ID does not exist", () => {
      const { getSiteById } = setupWithMockData();

      expect(getSiteById("nonexistent-id")).toBeUndefined();
    });

    it("finds sites across all categories", () => {
      const { getSiteById } = setupWithMockData();

      expect(getSiteById(mockSites.workday.id)).toBeDefined();
      expect(getSiteById(mockSites.greenhouse.id)).toBeDefined();
      expect(getSiteById(mockSites.lever.id)).toBeDefined();
    });
  });

  describe("getSiteByUrl", () => {
    it("returns site when URL exists", () => {
      const { getSiteByUrl } = setupWithMockData();

      const site = getSiteByUrl(mockSites.workday.url);
      expect(site).toBeDefined();
      expect(site?.name).toBe("Workday Company");
      expect(site?.id).toBe(mockSites.workday.id);
    });

    it("returns undefined when URL does not exist", () => {
      const { getSiteByUrl } = setupWithMockData();

      expect(getSiteByUrl("https://nonexistent.com")).toBeUndefined();
    });

    it("uses exact URL matching", () => {
      const { getSiteByUrl } = setupWithMockData();

      expect(getSiteByUrl("https://company.com")).toBeUndefined();
    });
  });

  describe("siteById map", () => {
    it("creates a complete map of all sites by ID", () => {
      const { siteById } = setupWithMockData();

      expect(siteById.value.size).toBeGreaterThan(0);
      expect(siteById.value.has(mockSites.workday.id)).toBe(true);
      expect(siteById.value.has(mockSites.greenhouse.id)).toBe(true);
      expect(siteById.value.has(mockSites.lever.id)).toBe(true);
    });

    it("allows direct map access", () => {
      const { siteById } = setupWithMockData();

      const site = siteById.value.get(mockSites.workday.id);
      expect(site?.name).toBe("Workday Company");
    });
  });

  describe("siteByUrl map", () => {
    it("creates a complete map of all sites by URL", () => {
      const { siteByUrl } = setupWithMockData();

      expect(siteByUrl.value.size).toBeGreaterThan(0);
      expect(siteByUrl.value.has(mockSites.workday.url)).toBe(true);
      expect(siteByUrl.value.has(mockSites.greenhouse.url)).toBe(true);
    });
  });

  describe("totalSites", () => {
    it("returns the total number of sites", () => {
      const { totalSites } = setupWithMockData();

      // mockJobHuntData has 8 sites
      expect(totalSites.value).toBe(8);
    });

    it("returns 0 for empty data", () => {
      const { totalSites } = setupWithMockData(
        { categories: [], sites: [] },
        "test-job-sites-empty",
      );

      expect(totalSites.value).toBe(0);
    });
  });

  describe("edge cases", () => {
    it("handles empty data", () => {
      const { getSiteById, getSiteByUrl } = setupWithMockData(
        { categories: [], sites: [] },
        "test-job-sites-edge",
      );

      expect(getSiteById("any-id")).toBeUndefined();
      expect(getSiteByUrl("https://any.url")).toBeUndefined();
    });
  });
});
