// /src/services/repositories/job-sites/local-job-sites-repository.test.ts

import { describe, it, expect, beforeEach } from "vitest";

import { TEST_STORAGE_KEYS } from "@/constants/storage-keys";
import { withFrozenTime } from "@/test-utils/with-frozen-time";
import type { JobHuntData } from "@/types";

import { createLocalJobSitesRepository } from "./local-job-sites-repository";

const repoParams = { storageKey: TEST_STORAGE_KEYS.JOB_SITES };

const emptyData: JobHuntData = { categories: [], sites: [] };

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem(TEST_STORAGE_KEYS.JOB_SITES, JSON.stringify(emptyData));
});

describe("createLocalJobSitesRepository", () => {
  describe("initialization", () => {
    it("starts with empty data when localStorage is empty", async () => {
      const repo = createLocalJobSitesRepository(repoParams);
      expect(await repo.getSites()).toEqual([]);
      expect(await repo.getCategories()).toEqual([]);
    });

    it("reads existing data from localStorage on init", async () => {
      const data: JobHuntData = {
        categories: [
          {
            id: "cat-1",
            name: "Tech",
            createdAt: "2026-02-03T10:00:00Z",
            updatedAt: "2026-02-03T10:00:00Z",
          },
        ],
        sites: [
          {
            id: "site-1",
            name: "LinkedIn",
            url: "https://linkedin.com",
            categoryId: "cat-1",
            createdAt: "2026-02-03T10:00:00Z",
            updatedAt: "2026-02-03T10:00:00Z",
          },
        ],
      };

      localStorage.setItem(TEST_STORAGE_KEYS.JOB_SITES, JSON.stringify(data));

      const repo = createLocalJobSitesRepository(repoParams);
      expect(await repo.getSites()).toEqual(data.sites);
      expect(await repo.getCategories()).toEqual(data.categories);
    });
  });

  describe("getSites / getSiteById", () => {
    it("returns all sites", async () => {
      const repo = createLocalJobSitesRepository(repoParams);
      await repo.createCategory({ name: "Tech" });
      const cat = (await repo.getCategories())[0];
      await repo.createSite({
        name: "Site A",
        url: "https://a.com",
        categoryId: cat.id,
      });
      await repo.createSite({
        name: "Site B",
        url: "https://b.com",
        categoryId: cat.id,
      });

      expect(await repo.getSites()).toHaveLength(2);
    });

    it("returns site by id", async () => {
      const repo = createLocalJobSitesRepository(repoParams);
      await repo.createCategory({ name: "Tech" });
      const cat = (await repo.getCategories())[0];
      const site = await repo.createSite({
        name: "LinkedIn",
        url: "https://linkedin.com",
        categoryId: cat.id,
      });

      expect(await repo.getSiteById(site.id)).toEqual(site);
    });

    it("returns null for nonexistent site id", async () => {
      const repo = createLocalJobSitesRepository(repoParams);
      expect(await repo.getSiteById("nonexistent")).toBeNull();
    });
  });

  describe("createSite", () => {
    it("generates id and timestamps", async () => {
      await withFrozenTime({
        now: "2026-02-03T10:00:00Z",
        fn: async () => {
          const repo = createLocalJobSitesRepository(repoParams);
          await repo.createCategory({ name: "Tech" });
          const cat = (await repo.getCategories())[0];

          const site = await repo.createSite({
            name: "New Site",
            url: "https://new.com",
            categoryId: cat.id,
          });

          expect(site.id).toBeDefined();
          expect(site.createdAt).toBe("2026-02-03T10:00:00Z");
          expect(site.updatedAt).toBe("2026-02-03T10:00:00Z");
        },
      });
    });

    it("persists to localStorage", async () => {
      const repo = createLocalJobSitesRepository(repoParams);
      await repo.createCategory({ name: "Tech" });
      const cat = (await repo.getCategories())[0];
      const site = await repo.createSite({
        name: "LinkedIn",
        url: "https://linkedin.com",
        categoryId: cat.id,
      });

      const stored = JSON.parse(
        localStorage.getItem(TEST_STORAGE_KEYS.JOB_SITES)!,
      );
      expect(stored.sites).toHaveLength(1);
      expect(stored.sites[0].id).toBe(site.id);
    });
  });

  describe("updateSite", () => {
    it("updates site fields", async () => {
      const repo = createLocalJobSitesRepository(repoParams);
      await repo.createCategory({ name: "Tech" });
      const cat = (await repo.getCategories())[0];
      const site = await repo.createSite({
        name: "LinkedIn",
        url: "https://linkedin.com",
        categoryId: cat.id,
      });

      const updated = await repo.updateSite(site.id, { name: "LinkedIn Jobs" });
      expect(updated.name).toBe("LinkedIn Jobs");
      expect(updated.url).toBe("https://linkedin.com");
    });

    it("stamps updatedAt", async () => {
      await withFrozenTime({
        now: "2026-02-03T10:00:00Z",
        fn: async () => {
          const repo = createLocalJobSitesRepository(repoParams);
          await repo.createCategory({ name: "Tech" });
          const cat = (await repo.getCategories())[0];
          const site = await repo.createSite({
            name: "LinkedIn",
            url: "https://linkedin.com",
            categoryId: cat.id,
          });

          await withFrozenTime({
            now: "2026-02-03T10:00:01Z",
            fn: async () => {
              const updated = await repo.updateSite(site.id, {
                name: "LinkedIn Jobs",
              });
              expect(updated.updatedAt).toBe("2026-02-03T10:00:01Z");
              expect(updated.updatedAt).not.toBe(site.updatedAt);
            },
          });
        },
      });
    });

    it("throws for nonexistent site", async () => {
      const repo = createLocalJobSitesRepository(repoParams);
      await expect(
        repo.updateSite("nonexistent", { name: "X" }),
      ).rejects.toThrow("nonexistent");
    });
  });

  describe("removeSite", () => {
    it("removes site", async () => {
      const repo = createLocalJobSitesRepository(repoParams);
      await repo.createCategory({ name: "Tech" });
      const cat = (await repo.getCategories())[0];
      const site = await repo.createSite({
        name: "LinkedIn",
        url: "https://linkedin.com",
        categoryId: cat.id,
      });

      await repo.removeSite(site.id);
      expect(await repo.getSiteById(site.id)).toBeNull();
    });

    it("throws for nonexistent site", async () => {
      const repo = createLocalJobSitesRepository(repoParams);
      await expect(repo.removeSite("nonexistent")).rejects.toThrow(
        "nonexistent",
      );
    });
  });

  describe("getCategories / getCategoryById", () => {
    it("returns all categories", async () => {
      const repo = createLocalJobSitesRepository(repoParams);
      await repo.createCategory({ name: "Tech" });
      await repo.createCategory({ name: "Remote" });
      expect(await repo.getCategories()).toHaveLength(2);
    });

    it("returns category by id", async () => {
      const repo = createLocalJobSitesRepository(repoParams);
      const cat = await repo.createCategory({ name: "Tech" });
      expect(await repo.getCategoryById(cat.id)).toEqual(cat);
    });

    it("returns null for nonexistent category id", async () => {
      const repo = createLocalJobSitesRepository(repoParams);
      expect(await repo.getCategoryById("nonexistent")).toBeNull();
    });
  });

  describe("createCategory", () => {
    it("generates id and timestamps", async () => {
      await withFrozenTime({
        now: "2026-02-03T10:00:00Z",
        fn: async () => {
          const repo = createLocalJobSitesRepository(repoParams);
          const cat = await repo.createCategory({ name: "Tech" });

          expect(cat.id).toBeDefined();
          expect(cat.createdAt).toBe("2026-02-03T10:00:00Z");
          expect(cat.updatedAt).toBe("2026-02-03T10:00:00Z");
        },
      });
    });

    it("generates slug-based id from name", async () => {
      const repo = createLocalJobSitesRepository(repoParams);
      const cat = await repo.createCategory({ name: "Tech Companies" });
      expect(cat.id).toBe("tech-companies");
    });

    it("persists to localStorage", async () => {
      const repo = createLocalJobSitesRepository(repoParams);
      await repo.createCategory({ name: "Tech" });

      const stored = JSON.parse(
        localStorage.getItem(TEST_STORAGE_KEYS.JOB_SITES)!,
      );
      expect(stored.categories).toHaveLength(1);
      expect(stored.categories[0].name).toBe("Tech");
    });
  });

  describe("updateCategory", () => {
    it("updates category fields", async () => {
      const repo = createLocalJobSitesRepository(repoParams);
      const cat = await repo.createCategory({ name: "Tech" });
      const updated = await repo.updateCategory(cat.id, {
        name: "Technology",
        description: "Tech companies",
      });

      expect(updated.name).toBe("Technology");
      expect(updated.description).toBe("Tech companies");
    });

    it("throws for nonexistent category", async () => {
      const repo = createLocalJobSitesRepository(repoParams);
      await expect(
        repo.updateCategory("nonexistent", { name: "X" }),
      ).rejects.toThrow("nonexistent");
    });
  });

  describe("removeCategory", () => {
    it("removes category", async () => {
      const repo = createLocalJobSitesRepository(repoParams);
      const cat = await repo.createCategory({ name: "Tech" });
      await repo.removeCategory(cat.id);
      expect(await repo.getCategoryById(cat.id)).toBeNull();
    });

    it("also removes all sites in the category", async () => {
      const repo = createLocalJobSitesRepository(repoParams);
      const cat = await repo.createCategory({ name: "Tech" });
      await repo.createSite({
        name: "LinkedIn",
        url: "https://linkedin.com",
        categoryId: cat.id,
      });
      await repo.createSite({
        name: "Indeed",
        url: "https://indeed.com",
        categoryId: cat.id,
      });

      await repo.removeCategory(cat.id);

      const sites = await repo.getSites();
      expect(sites.filter(s => s.categoryId === cat.id)).toHaveLength(0);
    });

    it("throws for nonexistent category", async () => {
      const repo = createLocalJobSitesRepository(repoParams);
      await expect(repo.removeCategory("nonexistent")).rejects.toThrow(
        "nonexistent",
      );
    });
  });

  describe("setState", () => {
    it("replaces all data", async () => {
      const repo = createLocalJobSitesRepository(repoParams);
      await repo.createCategory({ name: "Tech" });

      const newData: JobHuntData = {
        categories: [
          {
            id: "new-cat",
            name: "New Category",
            createdAt: "2026-02-03T10:00:00Z",
            updatedAt: "2026-02-03T10:00:00Z",
          },
        ],
        sites: [
          {
            id: "new-site",
            name: "New Site",
            url: "https://new.com",
            categoryId: "new-cat",
            createdAt: "2026-02-03T10:00:00Z",
            updatedAt: "2026-02-03T10:00:00Z",
          },
        ],
      };

      await repo.setState(newData);

      expect(await repo.getCategories()).toHaveLength(1);
      expect((await repo.getCategories())[0].name).toBe("New Category");
      expect(await repo.getSites()).toHaveLength(1);
    });

    it("persists to localStorage", async () => {
      const repo = createLocalJobSitesRepository(repoParams);
      const newData: JobHuntData = {
        categories: [],
        sites: [],
      };

      await repo.setState(newData);

      const stored = JSON.parse(
        localStorage.getItem(TEST_STORAGE_KEYS.JOB_SITES)!,
      );
      expect(stored).toEqual(newData);
    });
  });

  describe("persistence across instances", () => {
    it("data written by one instance is read by another", async () => {
      const repo1 = createLocalJobSitesRepository(repoParams);
      const cat = await repo1.createCategory({ name: "Tech" });

      const repo2 = createLocalJobSitesRepository(repoParams);
      expect(await repo2.getCategoryById(cat.id)).toEqual(cat);
    });
  });
});
