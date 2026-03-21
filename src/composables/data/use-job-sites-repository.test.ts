// /src/composables/data/use-job-sites-repository.test.ts

import { useLocalStorage } from "@vueuse/core";
import { describe, it, expect, beforeEach } from "vitest";

import { mockJobHuntData, mockSites, mockCategories } from "@/test-utils/mocks";
import type { JobHuntData } from "@/types";

import { TEST_JOB_SITES_STORAGE_KEY } from "./keys";
import { useJobSitesRepository } from "./use-job-sites-repository";

function setupRepo(data: JobHuntData = mockJobHuntData) {
  const storage = useLocalStorage<JobHuntData>(
    TEST_JOB_SITES_STORAGE_KEY,
    data,
  );
  storage.value = data;
  return useJobSitesRepository({ storageKey: TEST_JOB_SITES_STORAGE_KEY });
}

beforeEach(() => {
  const storage = useLocalStorage<JobHuntData>(
    TEST_JOB_SITES_STORAGE_KEY,
    mockJobHuntData,
  );
  storage.value = { ...mockJobHuntData };
});

describe("useJobSitesRepository", () => {
  describe("getSites", () => {
    it("returns all sites", async () => {
      const repo = setupRepo();
      const sites = await repo.getSites();
      expect(sites.length).toBe(mockJobHuntData.sites.length);
    });

    it("returns empty array for empty data", async () => {
      const emptyKey = "test-job-sites-empty-sites";
      const storage = useLocalStorage<JobHuntData>(emptyKey, {
        categories: [],
        sites: [],
      });
      storage.value = { categories: [], sites: [] };
      const repo = useJobSitesRepository({ storageKey: emptyKey });
      const sites = await repo.getSites();
      expect(sites).toEqual([]);
    });
  });

  describe("getSiteById", () => {
    it("returns site when ID exists", async () => {
      const repo = setupRepo();
      const site = await repo.getSiteById(mockSites.workday.id);
      expect(site).not.toBeNull();
      expect(site?.name).toBe("Workday Company");
    });

    it("returns null when ID does not exist", async () => {
      const repo = setupRepo();
      const site = await repo.getSiteById("nonexistent-id");
      expect(site).toBeNull();
    });
  });

  describe("createSite", () => {
    it("adds a new site and returns it", async () => {
      const repo = setupRepo();
      const newSite = await repo.createSite({
        name: "New Site",
        url: "https://newsite.com",
        categoryId: mockCategories.techCompanies.id,
      });

      expect(newSite.name).toBe("New Site");
      expect(newSite.id).toBeDefined();

      const sites = await repo.getSites();
      expect(sites.some(s => s.id === newSite.id)).toBe(true);
    });

    it("generates a stable ID from name and url", async () => {
      const repo = setupRepo();
      const site = await repo.createSite({
        name: "Stable ID Site",
        url: "https://stable.com",
        categoryId: mockCategories.techCompanies.id,
      });

      expect(site.id).toBe("stable-id-site");
    });
  });

  describe("updateSite", () => {
    it("updates an existing site", async () => {
      const repo = setupRepo();
      const updated = await repo.updateSite(mockSites.workday.id, {
        name: "Updated Workday",
      });

      expect(updated).not.toBeNull();
      expect(updated?.name).toBe("Updated Workday");
    });

    it("returns null for nonexistent site", async () => {
      const repo = setupRepo();
      const result = await repo.updateSite("nonexistent-id", { name: "X" });
      expect(result).toBeNull();
    });

    it("preserves unchanged fields", async () => {
      const repo = setupRepo();
      const updated = await repo.updateSite(mockSites.workday.id, {
        name: "New Name",
      });

      expect(updated?.url).toBe(mockSites.workday.url);
      expect(updated?.categoryId).toBe(mockSites.workday.categoryId);
    });
  });

  describe("removeSite", () => {
    it("removes an existing site", async () => {
      const repo = setupRepo();
      const result = await repo.removeSite(mockSites.workday.id);

      expect(result).toBe(true);
      const site = await repo.getSiteById(mockSites.workday.id);
      expect(site).toBeNull();
    });

    it("returns false for nonexistent site", async () => {
      const repo = setupRepo();
      const result = await repo.removeSite("nonexistent-id");
      expect(result).toBe(false);
    });
  });

  describe("getCategories", () => {
    it("returns all categories", async () => {
      const repo = setupRepo();
      const categories = await repo.getCategories();
      expect(categories.length).toBe(mockJobHuntData.categories.length);
    });

    it("returns empty array for empty data", async () => {
      const emptyKey = "test-job-sites-empty-categories";
      const storage = useLocalStorage<JobHuntData>(emptyKey, {
        categories: [],
        sites: [],
      });
      storage.value = { categories: [], sites: [] };
      const repo = useJobSitesRepository({ storageKey: emptyKey });
      const categories = await repo.getCategories();
      expect(categories).toEqual([]);
    });
  });

  describe("getCategoryById", () => {
    it("returns category when ID exists", async () => {
      const repo = setupRepo();
      const category = await repo.getCategoryById(
        mockCategories.techCompanies.id,
      );
      expect(category).not.toBeNull();
      expect(category?.name).toBe("Tech Companies");
    });

    it("returns null when ID does not exist", async () => {
      const repo = setupRepo();
      const category = await repo.getCategoryById("nonexistent-id");
      expect(category).toBeNull();
    });
  });

  describe("createCategory", () => {
    it("adds a new category and returns it", async () => {
      const repo = setupRepo();
      const newCategory = await repo.createCategory({ name: "New Category" });

      expect(newCategory.name).toBe("New Category");
      expect(newCategory.id).toBe("new-category");

      const categories = await repo.getCategories();
      expect(categories.some(c => c.id === newCategory.id)).toBe(true);
    });
  });

  describe("updateCategory", () => {
    it("updates an existing category", async () => {
      const repo = setupRepo();
      const updated = await repo.updateCategory(
        mockCategories.techCompanies.id,
        { name: "Updated Tech" },
      );

      expect(updated).not.toBeNull();
      expect(updated?.name).toBe("Updated Tech");
    });

    it("returns null for nonexistent category", async () => {
      const repo = setupRepo();
      const result = await repo.updateCategory("nonexistent-id", {
        name: "X",
      });
      expect(result).toBeNull();
    });
  });

  describe("removeCategory", () => {
    it("removes an existing category", async () => {
      const repo = setupRepo();
      const result = await repo.removeCategory(mockCategories.techCompanies.id);

      expect(result).toBe(true);
      const category = await repo.getCategoryById(
        mockCategories.techCompanies.id,
      );
      expect(category).toBeNull();
    });

    it("also removes all sites in the category", async () => {
      const repo = setupRepo();
      await repo.removeCategory(mockCategories.techCompanies.id);

      const sites = await repo.getSites();
      const techSites = sites.filter(
        s => s.categoryId === mockCategories.techCompanies.id,
      );
      expect(techSites).toHaveLength(0);
    });

    it("returns false for nonexistent category", async () => {
      const repo = setupRepo();
      const result = await repo.removeCategory("nonexistent-id");
      expect(result).toBe(false);
    });
  });

  describe("setAll", () => {
    it("replaces all data", async () => {
      const repo = setupRepo();
      const newData: JobHuntData = {
        categories: [{ id: "new-cat", name: "New Category" }],
        sites: [
          {
            id: "new-site",
            name: "New Site",
            url: "https://new.com",
            categoryId: "new-cat",
          },
        ],
      };

      await repo.setAll(newData);

      const categories = await repo.getCategories();
      const sites = await repo.getSites();
      expect(categories).toHaveLength(1);
      expect(sites).toHaveLength(1);
      expect(categories[0].name).toBe("New Category");
    });
  });
});
