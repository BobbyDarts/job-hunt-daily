// /src/composables/use-data-management.test.ts

import { Temporal } from "@js-temporal/polyfill";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { ref } from "vue";

import { getNow, toInstant, toPlainDate } from "@/lib/time";
import { withFrozenTime } from "@/test-utils/with-frozen-time";
import type { Application, VisitedSites } from "@/types";

import {
  TEST_APPLICATIONS_HISTORY_STORAGE_KEY,
  TEST_APPLICATIONS_STORAGE_KEY,
  TEST_VISITED_SITES_STORAGE_KEY,
} from "./keys";
import { useDataManagement } from "./use-data-management";
import type { UseDataManagementParams } from "./use-data-management";

describe("useDataManagement", () => {
  const useDataManagementParams: Partial<UseDataManagementParams> = {
    applicationStorageKey: TEST_APPLICATIONS_STORAGE_KEY,
    applicationHistoryStorageKey: TEST_APPLICATIONS_HISTORY_STORAGE_KEY,
    visitedSitesStorageKey: TEST_VISITED_SITES_STORAGE_KEY,
  };

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe("exportAllData", () => {
    it("exports both visited sites and applications as JSON", async () => {
      withFrozenTime({
        now: "2026-02-03T15:00:00Z",
        fn: () => {
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
            totalSites: ref(2),
          });

          const mockClick = vi.fn();
          const mockAnchor = document.createElement("a");
          mockAnchor.click = mockClick;

          vi.spyOn(document, "createElement").mockReturnValue(mockAnchor);
          const createObjectURLSpy = vi
            .spyOn(URL, "createObjectURL")
            .mockReturnValue("blob:mock-url");
          const revokeObjectURLSpy = vi.spyOn(URL, "revokeObjectURL");

          exportAllData();

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
              tags: ["phone_screen"],
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
            totalSites: ref(1),
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

          exportAllData();

          const text = await capturedBlob!.text();
          const exportedData = JSON.parse(text);

          expect(exportedData).toHaveProperty("version", "1.1");
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
            totalSites: ref(1),
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

          exportAllData();

          const text = await capturedBlob!.text();
          const exportedData = JSON.parse(text);

          expect(exportedData.applications).toEqual([]);
          expect(exportedData.dailyChecklist.visited).toEqual([]);
        },
      });
    });

    it("includes timestamp in exported data", async () => {
      await withFrozenTime({
        now: "2026-02-03T15:00:00Z",
        fn: async () => {
          const { exportAllData } = useDataManagement({
            ...useDataManagementParams,
            totalSites: ref(1),
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
          exportAllData();
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
            totalSites: ref(1),
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
            totalSites: ref(1),
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
            totalSites: ref(0),
          });

          const file = new File(["invalid json {{{"], "backup.json", {
            type: "application/json",
          });

          await expect(importAllData(file)).rejects.toThrow();
        },
      });
    });

    it("rejects file with missing dailyChecklist", async () => {
      await withFrozenTime({
        now: "2026-02-03T15:00:00Z",
        fn: async () => {
          const { importAllData } = useDataManagement({
            ...useDataManagementParams,
            totalSites: ref(0),
          });

          const invalidData = {
            version: "1.1",
            exportedAt: "2026-02-03T10:00:00Z",
            applications: [],
          };

          const file = new File([JSON.stringify(invalidData)], "backup.json", {
            type: "application/json",
          });

          await expect(importAllData(file)).rejects.toThrow();
        },
      });
    });

    it("rejects file with missing applications", async () => {
      await withFrozenTime({
        now: "2026-02-03T15:00:00Z",
        fn: async () => {
          const { importAllData } = useDataManagement({
            ...useDataManagementParams,
            totalSites: ref(0),
          });

          const invalidData = {
            version: "1.1",
            exportedAt: "2026-02-03T10:00:00Z",
            dailyChecklist: { date: "2026-02-03", visited: [] },
          };

          const file = new File([JSON.stringify(invalidData)], "backup.json", {
            type: "application/json",
          });

          await expect(importAllData(file)).rejects.toThrow();
        },
      });
    });

    it("imports data with all optional application fields", async () => {
      await withFrozenTime({
        now: "2026-02-03T15:00:00Z",
        fn: async () => {
          const { importAllData } = useDataManagement({
            ...useDataManagementParams,
            totalSites: ref(1),
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
              tags: ["referral"],
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
            totalSites: ref(2),
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

          exportAllData();

          // Clear localStorage
          localStorage.clear();

          // Re-import
          const exportedText = await capturedBlob!.text();
          const file = new File([exportedText], "backup.json", {
            type: "application/json",
          });

          await importAllData(file);

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
