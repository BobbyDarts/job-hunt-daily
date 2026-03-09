// /src/composables/data/use-job-sites.test.ts

import { describe, it, expect } from "vitest";

import { mockJobHuntData } from "@/test-utils/mocks";

import { useJobSites } from "./use-job-sites";

describe("useJobSites", () => {
  describe("getSiteById", () => {
    it("returns site when ID exists", () => {
      const { getSiteById } = useJobSites(mockJobHuntData);

      const site = getSiteById("workday-company");
      expect(site).toBeDefined();
      expect(site?.name).toBe("Workday Company");
      expect(site?.url).toBe("https://company.wd1.myworkdayjobs.com/jobs");
    });

    it("returns undefined when ID does not exist", () => {
      const { getSiteById } = useJobSites(mockJobHuntData);

      const site = getSiteById("nonexistent-id");
      expect(site).toBeUndefined();
    });

    it("finds sites across all categories", () => {
      const { getSiteById } = useJobSites(mockJobHuntData);

      expect(getSiteById("workday-company")).toBeDefined();
      expect(getSiteById("greenhouse-company")).toBeDefined();
      expect(getSiteById("lever-company")).toBeDefined();
    });
  });

  describe("getSiteByUrl", () => {
    it("returns site when URL exists", () => {
      const { getSiteByUrl } = useJobSites(mockJobHuntData);

      const site = getSiteByUrl("https://company.wd1.myworkdayjobs.com/jobs");
      expect(site).toBeDefined();
      expect(site?.name).toBe("Workday Company");
      expect(site?.id).toBe("workday-company");
    });

    it("returns undefined when URL does not exist", () => {
      const { getSiteByUrl } = useJobSites(mockJobHuntData);

      const site = getSiteByUrl("https://nonexistent.com");
      expect(site).toBeUndefined();
    });

    it("uses exact URL matching", () => {
      const { getSiteByUrl } = useJobSites(mockJobHuntData);

      // Should not find with partial URL
      expect(getSiteByUrl("https://company.com")).toBeUndefined();
    });
  });

  describe("siteById map", () => {
    it("creates a complete map of all sites by ID", () => {
      const { siteById } = useJobSites(mockJobHuntData);

      expect(siteById.value.size).toBeGreaterThan(0);
      expect(siteById.value.has("workday-company")).toBe(true);
      expect(siteById.value.has("greenhouse-company")).toBe(true);
      expect(siteById.value.has("lever-company")).toBe(true);
    });

    it("allows direct map access", () => {
      const { siteById } = useJobSites(mockJobHuntData);

      const site = siteById.value.get("workday-company");
      expect(site?.name).toBe("Workday Company");
    });
  });

  describe("siteByUrl map", () => {
    it("creates a complete map of all sites by URL", () => {
      const { siteByUrl } = useJobSites(mockJobHuntData);

      expect(siteByUrl.value.size).toBeGreaterThan(0);
      expect(
        siteByUrl.value.has("https://company.wd1.myworkdayjobs.com/jobs"),
      ).toBe(true);
      expect(siteByUrl.value.has("https://my.greenhouse.io")).toBe(true);
    });
  });

  describe("totalSites", () => {
    it("returns the total number of sites across all categories", () => {
      const { totalSites } = useJobSites(mockJobHuntData);
      // mockJobHuntData has 5 + 2 + 1 = 8 sites
      expect(totalSites.value).toBe(8);
    });

    it("returns 0 for empty data", () => {
      const { totalSites } = useJobSites({ categories: [] });
      expect(totalSites.value).toBe(0);
    });
  });

  describe("edge cases", () => {
    it("handles empty categories array", () => {
      const emptyData = { categories: [] };
      const { getSiteById, getSiteByUrl } = useJobSites(emptyData);

      expect(getSiteById("any-id")).toBeUndefined();
      expect(getSiteByUrl("https://any.url")).toBeUndefined();
    });
  });
});
