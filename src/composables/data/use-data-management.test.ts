// /src/composables/data/use-data-management.test.ts

import { Temporal } from "@js-temporal/polyfill";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { nextTick } from "vue";

import { getNow, toInstant, toPlainDate } from "@/lib/time";
import { withFrozenTime } from "@/test-utils/with-frozen-time";
import type { Application, VisitedSites } from "@/types";

import {
  TEST_APPLICATIONS_HISTORY_STORAGE_KEY,
  TEST_APPLICATIONS_STORAGE_KEY,
  TEST_JOB_SITES_STORAGE_KEY,
  TEST_VISITED_SITES_STORAGE_KEY,
} from "./keys";
import type { UseDataManagementParams } from "./use-data-management";
import { useDataManagement } from "./use-data-management";

describe("useDataManagement", () => {
  const useDataManagementParams: Partial<UseDataManagementParams> = {
    applicationStorageKey: TEST_APPLICATIONS_STORAGE_KEY,
    applicationHistoryStorageKey: TEST_APPLICATIONS_HISTORY_STORAGE_KEY,
    visitedSitesStorageKey: TEST_VISITED_SITES_STORAGE_KEY,
    jobSitesStorageKey: TEST_JOB_SITES_STORAGE_KEY,
  };

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe("exportAllData", () => {
    it("exports both visited sites and applications as JSON", async () => {
      await withFrozenTime({
        now: "2026-02-03T15:00:00Z",
        fn: async () => {
          const visitedData: VisitedSites = {
            date: "2026-02-03",
            visited: ["https://example.com", "https://test.com"],
          };

          const applicationsData: Application[] = [
            {
              id: "app_1",
              company: "Tech Co",
              position: "Developer",
              jobSiteId: "techco",
              jobSiteUrl: "https://techco.com",
              status: "applied",
              appliedDate: toPlainDate("2026-02-03").toString(),
              createdAt: toInstant("2026-02-03T10:00:00Z").toString(),
              updatedAt: toInstant("2026-02-03T10:00:00Z").toString(),
            },
          ];

          localStorage.setItem(
            TEST_VISITED_SITES_STORAGE_KEY,
            JSON.stringify(visitedData),
          );
          localStorage.setItem(
            TEST_APPLICATIONS_STORAGE_KEY,
            JSON.stringify(applicationsData),
          );

          const { exportAllData } = useDataManagement({
            ...useDataManagementParams,
          });

          const mockClick = vi.fn();
          const mockAnchor = document.createElement("a");
          mockAnchor.click = mockClick;

          vi.spyOn(document, "createElement").mockReturnValue(mockAnchor);
          const createObjectURLSpy = vi
            .spyOn(URL, "createObjectURL")
            .mockReturnValue("blob:mock-url");
          const revokeObjectURLSpy = vi.spyOn(URL, "revokeObjectURL");

          await exportAllData();
          await nextTick();

          expect(createObjectURLSpy).toHaveBeenCalled();
          const blobCall = createObjectURLSpy.mock.calls[0][0] as Blob;
          expect(blobCall.type).toBe("application/json");

          expect(mockAnchor.href).toBe("blob:mock-url");
          expect(mockAnchor.download).toMatch(/^job-hunt-backup-\d+\.json$/);
          expect(mockClick).toHaveBeenCalled();
          expect(revokeObjectURLSpy).toHaveBeenCalledWith("blob:mock-url");
        },
      });
    });

    it("exports correct data structure", async () => {
      await withFrozenTime({
        now: "2026-02-03T15:00:00Z",
        fn: async () => {
          const visitedData: VisitedSites = {
            date: "2026-02-03",
            visited: ["https://example.com"],
          };

          const applicationsData: Application[] = [
            {
              id: "app_1",
              company: "Tech Co",
              position: "Developer",
              jobSiteId: "techco",
              jobSiteUrl: "https://techco.com",
              status: "interviewing",
              appliedDate: toPlainDate("2026-02-03").toString(),
              createdAt: toInstant("2026-02-03T10:00:00Z").toString(),
              updatedAt: toInstant("2026-02-03T10:00:00Z").toString(),
              tags: ["virtual"],
              notes: "Test notes",
            },
          ];

          localStorage.setItem(
            TEST_VISITED_SITES_STORAGE_KEY,
            JSON.stringify(visitedData),
          );
          localStorage.setItem(
            TEST_APPLICATIONS_STORAGE_KEY,
            JSON.stringify(applicationsData),
          );

          const { exportAllData } = useDataManagement({
            ...useDataManagementParams,
          });

          let capturedBlob: Blob | null = null;
          vi.spyOn(URL, "createObjectURL").mockImplementation(
            (blob: Blob | MediaSource) => {
              capturedBlob = blob as Blob;
              return "blob:mock-url";
            },
          );
          vi.spyOn(document, "createElement").mockReturnValue({
            click: vi.fn(),
            href: "",
            download: "",
          } as unknown as HTMLAnchorElement);

          await exportAllData();
          await nextTick();

          const text = await capturedBlob!.text();
          const exportedData = JSON.parse(text);

          expect(exportedData).toHaveProperty("version", "1.2");
          expect(exportedData).toHaveProperty("exportedAt");
          expect(exportedData.dailyChecklist).toEqual(visitedData);
          expect(exportedData.applications).toEqual(applicationsData);
        },
      });
    });

    it("exports empty data when no data exists", async () => {
      await withFrozenTime({
        now: "2026-02-03T15:00:00Z",
        fn: async () => {
          const { exportAllData } = useDataManagement({
            ...useDataManagementParams,
          });

          let capturedBlob: Blob | null = null;
          vi.spyOn(URL, "createObjectURL").mockImplementation(
            (blob: Blob | MediaSource) => {
              capturedBlob = blob as Blob;
              return "blob:mock-url";
            },
          );
          vi.spyOn(document, "createElement").mockReturnValue({
            click: vi.fn(),
            href: "",
            download: "",
          } as unknown as HTMLAnchorElement);

          await exportAllData();
          await nextTick();

          const text = await capturedBlob!.text();
          const exportedData = JSON.parse(text);

          expect(exportedData.applications).toBeUndefined();
          expect(exportedData.dailyChecklist).toBeUndefined();
        },
      });
    });

    it("includes timestamp in exported data", async () => {
      await withFrozenTime({
        now: "2026-02-03T15:00:00Z",
        fn: async () => {
          const { exportAllData } = useDataManagement({
            ...useDataManagementParams,
          });

          let capturedBlob: Blob | null = null;
          vi.spyOn(URL, "createObjectURL").mockImplementation(
            (blob: Blob | MediaSource) => {
              capturedBlob = blob as Blob;
              return "blob:mock-url";
            },
          );
          vi.spyOn(document, "createElement").mockReturnValue({
            click: vi.fn(),
            href: "",
            download: "",
          } as unknown as HTMLAnchorElement);

          const beforeExport = getNow().toString();
          await exportAllData();
          await nextTick();
          const afterExport = getNow().toString();

          const text = await capturedBlob!.text();
          const exportedData = JSON.parse(text);

          expect(exportedData.exportedAt).toBeDefined();
          expect(exportedData.exportedAt).toMatch(
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
          );

          expect(exportedData.exportedAt >= beforeExport).toBe(true);
          expect(exportedData.exportedAt <= afterExport).toBe(true);
        },
      });
    });
  });

  describe("importAllData", () => {
    it("imports both visited sites and applications from JSON file", async () => {
      await withFrozenTime({
        now: "2026-02-03T15:00:00Z",
        fn: async () => {
          const { importAllData } = useDataManagement({
            ...useDataManagementParams,
          });

          const mockData = {
            version: "1.1",
            exportedAt: "2026-02-03T10:00:00Z",
            dailyChecklist: {
              date: "2026-02-03",
              visited: ["https://imported.com"],
            },
            applications: [
              {
                id: "app_1",
                company: "Imported Co",
                position: "Developer",
                jobSiteUrl: "https://imported.com",
                status: "applied" as const,
                appliedDate: toPlainDate("2026-02-03").toString(),
                createdAt: toInstant("2026-02-03T10:00:00Z").toString(),
                updatedAt: toInstant("2026-02-03T10:00:00Z").toString(),
              },
            ],
          };

          const file = new File([JSON.stringify(mockData)], "backup.json", {
            type: "application/json",
          });

          await importAllData(file);
          await nextTick();

          const visitedSites = JSON.parse(
            localStorage.getItem(TEST_VISITED_SITES_STORAGE_KEY)!,
          );
          const applications = JSON.parse(
            localStorage.getItem(TEST_APPLICATIONS_STORAGE_KEY)!,
          );

          expect(visitedSites).toEqual(mockData.dailyChecklist);
          expect(applications).toEqual(mockData.applications);
        },
      });
    });

    it("overwrites existing data when importing", async () => {
      await withFrozenTime({
        now: "2026-02-03T15:00:00Z",
        fn: async () => {
          const existingVisited: VisitedSites = {
            date: "2026-02-03",
            visited: ["https://old.com"],
          };
          const existingApps: Application[] = [
            {
              id: "old_app",
              company: "Old Co",
              position: "Dev",
              jobSiteId: "oldco",
              jobSiteUrl: "https://old.com",
              status: "rejected",
              appliedDate: toPlainDate("2026-02-02").toString(),
              createdAt: toInstant("2026-02-02T10:00:00Z").toString(),
              updatedAt: toInstant("2026-02-02T10:00:00Z").toString(),
            },
          ];

          localStorage.setItem(
            TEST_VISITED_SITES_STORAGE_KEY,
            JSON.stringify(existingVisited),
          );
          localStorage.setItem(
            TEST_APPLICATIONS_STORAGE_KEY,
            JSON.stringify(existingApps),
          );

          const { importAllData } = useDataManagement({
            ...useDataManagementParams,
          });

          const newData = {
            version: "1.1",
            exportedAt: "2026-02-03T10:00:00Z",
            dailyChecklist: {
              date: "2026-02-03",
              visited: ["https://new.com"],
            },
            applications: [
              {
                id: "new_app",
                company: "New Co",
                position: "Engineer",
                jobSiteUrl: "https://new.com",
                status: "interviewing" as const,
                appliedDate: toPlainDate("2026-02-03").toString(),
                createdAt: toInstant("2026-02-03T10:00:00Z").toString(),
                updatedAt: toInstant("2026-02-03T10:00:00Z").toString(),
              },
            ],
          };

          const file = new File([JSON.stringify(newData)], "backup.json", {
            type: "application/json",
          });

          await importAllData(file);
          await nextTick();

          const visitedSites = JSON.parse(
            localStorage.getItem(TEST_VISITED_SITES_STORAGE_KEY)!,
          );
          const applications = JSON.parse(
            localStorage.getItem(TEST_APPLICATIONS_STORAGE_KEY)!,
          );

          expect(visitedSites).toEqual(newData.dailyChecklist);
          expect(applications).toEqual(newData.applications);
          expect(visitedSites).not.toEqual(existingVisited);
          expect(applications).not.toEqual(existingApps);
        },
      });
    });

    it("rejects invalid JSON", async () => {
      await withFrozenTime({
        now: "2026-02-03T15:00:00Z",
        fn: async () => {
          const { importAllData } = useDataManagement({
            ...useDataManagementParams,
          });

          const file = new File(["invalid json {{{"], "backup.json", {
            type: "application/json",
          });

          await expect(importAllData(file)).rejects.toThrow();
        },
      });
    });

    it("imports successfully without dailyChecklist", async () => {
      await withFrozenTime({
        now: "2026-02-03T15:00:00Z",
        fn: async () => {
          const { importAllData } = useDataManagement({
            ...useDataManagementParams,
          });

          const data = {
            version: "1.2",
            exportedAt: "2026-02-03T10:00:00Z",
            applications: [],
          };

          const file = new File([JSON.stringify(data)], "backup.json", {
            type: "application/json",
          });

          await expect(importAllData(file)).resolves.not.toThrow();
        },
      });
    });

    it("imports successfully without applications", async () => {
      await withFrozenTime({
        now: "2026-02-03T15:00:00Z",
        fn: async () => {
          const { importAllData } = useDataManagement({
            ...useDataManagementParams,
          });

          const data = {
            version: "1.2",
            exportedAt: "2026-02-03T10:00:00Z",
            dailyChecklist: { date: "2026-02-03", visited: [] },
          };

          const file = new File([JSON.stringify(data)], "backup.json", {
            type: "application/json",
          });

          await expect(importAllData(file)).resolves.not.toThrow();
        },
      });
    });

    it("imports data with all optional application fields", async () => {
      await withFrozenTime({
        now: "2026-02-03T15:00:00Z",
        fn: async () => {
          const { importAllData } = useDataManagement({
            ...useDataManagementParams,
          });

          const mockData = {
            version: "1.1",
            exportedAt: "2026-02-03T10:00:00Z",
            dailyChecklist: {
              date: "2026-02-03",
              visited: ["https://example.com"],
            },
            applications: [
              {
                id: "app_1",
                company: "Tech Co",
                position: "Developer",
                jobSiteUrl: "https://techco.com",
                status: "interviewing" as const,
                appliedDate: toPlainDate("2026-02-03").toString(),
                createdAt: toInstant("2026-02-03T10:00:00Z").toString(),
                updatedAt: toInstant("2026-02-03T10:00:00Z").toString(),
                atsType: "greenhouse" as const,
                tags: ["phone_screen", "technical"] as const,
                notes: "Great conversation",
                followUpDate: Temporal.PlainDate.from("2026-02-10").toString(),
              },
            ],
          };

          const file = new File([JSON.stringify(mockData)], "backup.json", {
            type: "application/json",
          });

          await importAllData(file);
          await nextTick();

          const applications = JSON.parse(
            localStorage.getItem(TEST_APPLICATIONS_STORAGE_KEY)!,
          );
          expect(applications[0]).toEqual(mockData.applications[0]);
          expect(applications[0].atsType).toBe("greenhouse");
          expect(applications[0].tags).toEqual(["phone_screen", "technical"]);
          expect(applications[0].notes).toBe("Great conversation");
          expect(applications[0].followUpDate).toBe("2026-02-10");
        },
      });
    });

    it("imports jobSites when present", async () => {
      await withFrozenTime({
        now: "2026-02-03T15:00:00Z",
        fn: async () => {
          const { importAllData } = useDataManagement({
            ...useDataManagementParams,
            jobSitesStorageKey: TEST_JOB_SITES_STORAGE_KEY,
          });

          const data = {
            version: "1.2",
            exportedAt: "2026-02-03T10:00:00Z",
            jobSites: {
              categories: [{ id: "general", name: "General" }],
              sites: [
                {
                  id: "linkedin",
                  name: "LinkedIn",
                  url: "https://linkedin.com",
                  categoryId: "general",
                },
              ],
            },
          };

          const file = new File([JSON.stringify(data)], "backup.json", {
            type: "application/json",
          });

          await importAllData(file);
          await nextTick();

          const jobSites = JSON.parse(
            localStorage.getItem(TEST_JOB_SITES_STORAGE_KEY)!,
          );
          expect(jobSites.categories).toHaveLength(1);
          expect(jobSites.sites).toHaveLength(1);
          expect(jobSites.sites[0].name).toBe("LinkedIn");
        },
      });
    });

    it("accepts v1.1 files without jobSites", async () => {
      await withFrozenTime({
        now: "2026-02-03T15:00:00Z",
        fn: async () => {
          const { importAllData } = useDataManagement({
            ...useDataManagementParams,
          });

          const data = {
            version: "1.1",
            exportedAt: "2026-02-03T10:00:00Z",
            dailyChecklist: {
              date: "2026-02-03",
              visited: ["https://example.com"],
            },
            applications: [],
          };

          const file = new File([JSON.stringify(data)], "backup.json", {
            type: "application/json",
          });

          await expect(importAllData(file)).resolves.not.toThrow();

          const visitedSites = JSON.parse(
            localStorage.getItem(TEST_VISITED_SITES_STORAGE_KEY)!,
          );
          expect(visitedSites).toEqual(data.dailyChecklist);
        },
      });
    });

    it("rejects malformed jobSites", async () => {
      await withFrozenTime({
        now: "2026-02-03T15:00:00Z",
        fn: async () => {
          const { importAllData } = useDataManagement({
            ...useDataManagementParams,
          });

          const data = {
            version: "1.2",
            exportedAt: "2026-02-03T10:00:00Z",
            jobSites: { categories: "not-an-array" },
          };

          const file = new File([JSON.stringify(data)], "backup.json", {
            type: "application/json",
          });

          await expect(importAllData(file)).rejects.toThrow();
        },
      });
    });
  });

  describe("integration", () => {
    it("can export and then re-import the same data", async () => {
      await withFrozenTime({
        now: "2026-02-03T15:00:00Z",
        fn: async () => {
          const visitedData: VisitedSites = {
            date: "2026-02-03",
            visited: ["https://site1.com", "https://site2.com"],
          };

          const applicationsData: Application[] = [
            {
              id: "app_1",
              company: "Company A",
              position: "Dev",
              jobSiteId: "a",
              jobSiteUrl: "https://a.com",
              status: "applied",
              appliedDate: toPlainDate("2026-02-03").toString(),
              createdAt: toInstant("2026-02-03T10:00:00Z").toString(),
              updatedAt: toInstant("2026-02-03T10:00:00Z").toString(),
            },
            {
              id: "app_2",
              company: "Company B",
              position: "Engineer",
              jobSiteId: "b",
              jobSiteUrl: "https://b.com",
              status: "interviewing",
              appliedDate: toPlainDate("2026-02-02").toString(),
              createdAt: toInstant("2026-02-02T10:00:00Z").toString(),
              updatedAt: toInstant("2026-02-02T10:00:00Z").toString(),
              tags: ["technical"],
            },
          ];

          localStorage.setItem(
            TEST_VISITED_SITES_STORAGE_KEY,
            JSON.stringify(visitedData),
          );
          localStorage.setItem(
            TEST_APPLICATIONS_STORAGE_KEY,
            JSON.stringify(applicationsData),
          );

          const { exportAllData, importAllData } = useDataManagement({
            ...useDataManagementParams,
          });

          // Export
          let capturedBlob: Blob | null = null;
          vi.spyOn(URL, "createObjectURL").mockImplementation(
            (blob: Blob | MediaSource) => {
              capturedBlob = blob as Blob;
              return "blob:mock-url";
            },
          );
          vi.spyOn(document, "createElement").mockReturnValue({
            click: vi.fn(),
            href: "",
            download: "",
          } as unknown as HTMLAnchorElement);

          await exportAllData();
          await nextTick();

          // Clear localStorage
          localStorage.clear();

          // Re-import
          const exportedText = await capturedBlob!.text();
          const file = new File([exportedText], "backup.json", {
            type: "application/json",
          });

          await importAllData(file);
          await nextTick();

          const reimportedVisited = JSON.parse(
            localStorage.getItem(TEST_VISITED_SITES_STORAGE_KEY)!,
          );
          const reimportedApps = JSON.parse(
            localStorage.getItem(TEST_APPLICATIONS_STORAGE_KEY)!,
          );

          expect(reimportedVisited).toEqual(visitedData);
          expect(reimportedApps).toEqual(applicationsData);
        },
      });
    });
  });
});
