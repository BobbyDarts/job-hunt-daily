// /src/composables/data/use-job-sites.test.ts

import { flushPromises } from "@vue/test-utils";
import { describe, it, expect, beforeEach, vi } from "vitest";

import { mockCategories, mockJobHuntData, mockSites } from "@/test-utils/mocks";
import type { JobCategory, JobSite } from "@/types";

import { useJobSites } from "./use-job-sites";

const mockRepo = vi.hoisted(() => ({
  getSites: vi.fn(),
  getCategories: vi.fn(),
  getSiteById: vi.fn(),
  getCategoryById: vi.fn(),
  createSite: vi.fn(),
  updateSite: vi.fn(),
  removeSite: vi.fn(),
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
  removeCategory: vi.fn(),
  setState: vi.fn(),
}));

vi.mock(
  "@/services/repositories/job-sites/create-job-sites-repository",
  () => ({
    getJobSitesRepository: vi.fn(() => mockRepo),
  }),
);

describe("useJobSites", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    mockRepo.getSites.mockResolvedValue(mockJobHuntData.sites);
    mockRepo.getCategories.mockResolvedValue(mockJobHuntData.categories);
    mockRepo.setState.mockResolvedValue(undefined);

    await useJobSites().init();
    await flushPromises();
  });

  describe("getSiteById", () => {
    it("returns site when ID exists", () => {
      const { getSiteById } = useJobSites();
      const site = getSiteById(mockSites.workday.id);
      expect(site).toBeDefined();
      expect(site?.name).toBe("Workday Company");
    });

    it("returns undefined when ID does not exist", () => {
      expect(useJobSites().getSiteById("nonexistent")).toBeUndefined();
    });

    it("finds sites across all categories", () => {
      const { getSiteById } = useJobSites();
      expect(getSiteById(mockSites.workday.id)).toBeDefined();
      expect(getSiteById(mockSites.greenhouse.id)).toBeDefined();
      expect(getSiteById(mockSites.lever.id)).toBeDefined();
    });
  });

  describe("getSiteByUrl", () => {
    it("returns site when URL exists", () => {
      const site = useJobSites().getSiteByUrl(mockSites.workday.url);
      expect(site).toBeDefined();
      expect(site?.name).toBe("Workday Company");
    });

    it("returns undefined when URL does not exist", () => {
      expect(
        useJobSites().getSiteByUrl("https://nonexistent.com"),
      ).toBeUndefined();
    });
  });

  describe("siteById map", () => {
    it("creates a complete map of all sites by ID", () => {
      const { siteById } = useJobSites();
      expect(siteById.value.size).toBeGreaterThan(0);
      expect(siteById.value.has(mockSites.workday.id)).toBe(true);
      expect(siteById.value.has(mockSites.greenhouse.id)).toBe(true);
    });
  });

  describe("totalSites", () => {
    it("returns the total number of sites", () => {
      expect(useJobSites().totalSites.value).toBe(mockJobHuntData.sites.length);
    });

    it("returns 0 for empty data", async () => {
      mockRepo.getSites.mockResolvedValue([]);
      mockRepo.getCategories.mockResolvedValue([]);

      await useJobSites().init();
      await flushPromises();

      expect(useJobSites().totalSites.value).toBe(0);
    });
  });

  describe("createSite", () => {
    it("calls repo.createSite and refreshes", async () => {
      const newSite: JobSite = {
        ...mockSites.regular,
        id: "new-site",
        name: "New Site",
        url: "https://new.com",
      };

      mockRepo.createSite.mockResolvedValue(newSite);
      mockRepo.getSites.mockResolvedValue([...mockJobHuntData.sites, newSite]);

      const { createSite, sites } = useJobSites();
      await createSite({
        name: "New Site",
        url: "https://new.com",
        categoryId: mockCategories.techCompanies.id,
      });
      await flushPromises();

      expect(mockRepo.createSite).toHaveBeenCalled();
      expect(sites.value).toContainEqual(newSite);
    });
  });

  describe("updateSite", () => {
    it("calls repo.updateSite and refreshes", async () => {
      const updated: JobSite = {
        ...mockSites.workday,
        name: "Updated Workday",
      };

      mockRepo.updateSite.mockResolvedValue(updated);
      mockRepo.getSites.mockResolvedValue(
        mockJobHuntData.sites.map(s =>
          s.id === mockSites.workday.id ? updated : s,
        ),
      );

      const { updateSite, getSiteById } = useJobSites();
      await updateSite(mockSites.workday.id, { name: "Updated Workday" });
      await flushPromises();

      expect(mockRepo.updateSite).toHaveBeenCalledWith(mockSites.workday.id, {
        name: "Updated Workday",
      });
      expect(getSiteById(mockSites.workday.id)?.name).toBe("Updated Workday");
    });
  });

  describe("removeSite", () => {
    it("calls repo.removeSite and refreshes", async () => {
      mockRepo.removeSite.mockResolvedValue(undefined);
      mockRepo.getSites.mockResolvedValue(
        mockJobHuntData.sites.filter(s => s.id !== mockSites.workday.id),
      );

      const { removeSite, getSiteById } = useJobSites();
      const result = await removeSite(mockSites.workday.id);
      await flushPromises();

      expect(mockRepo.removeSite).toHaveBeenCalledWith(mockSites.workday.id);
      expect(result).toBe(true);
      expect(getSiteById(mockSites.workday.id)).toBeUndefined();
    });
  });

  describe("createCategory", () => {
    it("calls repo.createCategory and refreshes", async () => {
      const newCategory: JobCategory = {
        id: "new-cat",
        name: "New Category",
        createdAt: "2026-02-03T10:00:00Z",
        updatedAt: "2026-02-03T10:00:00Z",
      };

      mockRepo.createCategory.mockResolvedValue(newCategory);
      mockRepo.getCategories.mockResolvedValue([
        ...mockJobHuntData.categories,
        newCategory,
      ]);

      const { createCategory, categories } = useJobSites();
      await createCategory({ name: "New Category" });
      await flushPromises();

      expect(mockRepo.createCategory).toHaveBeenCalled();
      expect(categories.value).toContainEqual(newCategory);
    });
  });

  describe("updateCategory", () => {
    it("calls repo.updateCategory and refreshes", async () => {
      const updated: JobCategory = {
        ...mockCategories.techCompanies,
        name: "Updated Tech",
      };

      mockRepo.updateCategory.mockResolvedValue(updated);
      mockRepo.getCategories.mockResolvedValue(
        mockJobHuntData.categories.map(c =>
          c.id === mockCategories.techCompanies.id ? updated : c,
        ),
      );

      const { updateCategory, getCategoryById } = useJobSites();
      await updateCategory(mockCategories.techCompanies.id, {
        name: "Updated Tech",
      });
      await flushPromises();

      expect(mockRepo.updateCategory).toHaveBeenCalledWith(
        mockCategories.techCompanies.id,
        { name: "Updated Tech" },
      );
      expect(getCategoryById(mockCategories.techCompanies.id)?.name).toBe(
        "Updated Tech",
      );
    });
  });

  describe("removeCategory", () => {
    it("calls repo.removeCategory and refreshes", async () => {
      mockRepo.removeCategory.mockResolvedValue(undefined);
      mockRepo.getCategories.mockResolvedValue(
        mockJobHuntData.categories.filter(
          c => c.id !== mockCategories.techCompanies.id,
        ),
      );
      mockRepo.getSites.mockResolvedValue(
        mockJobHuntData.sites.filter(
          s => s.categoryId !== mockCategories.techCompanies.id,
        ),
      );

      const { removeCategory, getCategoryById } = useJobSites();
      const result = await removeCategory(mockCategories.techCompanies.id);
      await flushPromises();

      expect(mockRepo.removeCategory).toHaveBeenCalledWith(
        mockCategories.techCompanies.id,
      );
      expect(result).toBe(true);
      expect(getCategoryById(mockCategories.techCompanies.id)).toBeUndefined();
    });
  });

  describe("edge cases", () => {
    it("handles empty data", async () => {
      mockRepo.getSites.mockResolvedValue([]);
      mockRepo.getCategories.mockResolvedValue([]);

      await useJobSites().init();
      await flushPromises();

      const { getSiteById, getSiteByUrl } = useJobSites();
      expect(getSiteById("any-id")).toBeUndefined();
      expect(getSiteByUrl("https://any.url")).toBeUndefined();
    });
  });
});
