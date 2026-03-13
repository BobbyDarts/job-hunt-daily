// /src/composables/data/use-job-sites-repository.test.ts

import { describe, it, expect } from "vitest";

import { mockJobHuntData } from "@/test-utils/mocks";
import type { JobHuntData } from "@/types";

import { useJobSitesRepository } from "./use-job-sites-repository";

describe("useJobSitesRepository", () => {
  describe("getData", () => {
    it("returns the injected data when provided", async () => {
      const repo = useJobSitesRepository({ data: mockJobHuntData });
      const result = await repo.getData();

      expect(result).toBe(mockJobHuntData);
    });

    it("returns data with expected shape", async () => {
      const repo = useJobSitesRepository({ data: mockJobHuntData });
      const result = await repo.getData();

      expect(result).toHaveProperty("categories");
      expect(Array.isArray(result.categories)).toBe(true);
    });

    it("returns categories with sites", async () => {
      const repo = useJobSitesRepository({ data: mockJobHuntData });
      const result = await repo.getData();

      expect(result.categories.length).toBeGreaterThan(0);
      result.categories.forEach(category => {
        expect(category).toHaveProperty("name");
        expect(category).toHaveProperty("sites");
        expect(Array.isArray(category.sites)).toBe(true);
      });
    });

    it("returns sites with expected fields", async () => {
      const repo = useJobSitesRepository({ data: mockJobHuntData });
      const result = await repo.getData();

      const firstSite = result.categories[0].sites[0];
      expect(firstSite).toHaveProperty("id");
      expect(firstSite).toHaveProperty("name");
      expect(firstSite).toHaveProperty("url");
    });

    it("handles empty categories array", async () => {
      const emptyData: JobHuntData = { categories: [] };
      const repo = useJobSitesRepository({ data: emptyData });
      const result = await repo.getData();

      expect(result.categories).toEqual([]);
    });

    it("handles categories with no sites", async () => {
      const data: JobHuntData = {
        categories: [{ name: "Empty Category", sites: [] }],
      };
      const repo = useJobSitesRepository({ data });
      const result = await repo.getData();

      expect(result.categories[0].sites).toEqual([]);
    });

    it("uses real job data when no data param provided", async () => {
      const repo = useJobSitesRepository();
      const result = await repo.getData();

      expect(result).toHaveProperty("categories");
      expect(result.categories.length).toBeGreaterThan(0);
    });

    it("returns the same data object on subsequent calls", async () => {
      const repo = useJobSitesRepository({ data: mockJobHuntData });

      const result1 = await repo.getData();
      const result2 = await repo.getData();

      expect(result1).toBe(result2);
    });
  });
});
