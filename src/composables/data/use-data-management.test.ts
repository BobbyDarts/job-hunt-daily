// /src/composables/data/use-data-management.test.ts

import { flushPromises } from "@vue/test-utils";
import { describe, it, expect, beforeEach, vi } from "vitest";

import { getNow } from "@/lib/time";
import { withFrozenTime } from "@/test-utils/with-frozen-time";
import type { Application, VisitedSiteHistory, VisitedSites } from "@/types";

import { useDataManagement } from "./use-data-management";

const mockAppRepo = vi.hoisted(() => ({
  getAll: vi.fn(),
  getHistoryAll: vi.fn(),
  setState: vi.fn(),
}));

const mockJobSitesRepo = vi.hoisted(() => ({
  getSites: vi.fn(),
  getCategories: vi.fn(),
  setState: vi.fn(),
}));

const mockVisitedRepo = vi.hoisted(() => ({
  serialize: vi.fn(),
  hydrate: vi.fn(),
}));

vi.mock(
  "@/services/repositories/applications/create-applications-repository",
  () => ({
    getApplicationsRepository: vi.fn(() => mockAppRepo),
  }),
);

vi.mock(
  "@/services/repositories/job-sites/create-job-sites-repository",
  () => ({
    getJobSitesRepository: vi.fn(() => mockJobSitesRepo),
  }),
);

vi.mock(
  "@/services/repositories/visited-sites/create-visited-sites-repository",
  () => ({
    getVisitedSitesRepository: vi.fn(() => mockVisitedRepo),
  }),
);

const mockRefreshApplications = vi.hoisted(() =>
  vi.fn().mockResolvedValue(undefined),
);
const mockRefreshJobSites = vi.hoisted(() =>
  vi.fn().mockResolvedValue(undefined),
);
const mockRefreshVisitedSites = vi.hoisted(() =>
  vi.fn().mockResolvedValue(undefined),
);

vi.mock("@/composables/data/use-applications", () => ({
  useApplications: () => ({ refresh: mockRefreshApplications }),
}));

vi.mock("@/composables/data/use-job-sites", () => ({
  useJobSites: () => ({ refresh: mockRefreshJobSites }),
}));

vi.mock("@/composables/data/use-visited-sites", () => ({
  useVisitedSites: () => ({ refresh: mockRefreshVisitedSites }),
}));

function makeApp(overrides: Partial<Application> = {}): Application {
  return {
    id: "app_1",
    company: "Tech Co",
    position: "Developer",
    jobSiteId: "techco",
    jobSiteUrl: "https://techco.com",
    status: "applied",
    appliedDate: "2026-02-03",
    createdAt: "2026-02-03T10:00:00Z",
    updatedAt: "2026-02-03T10:00:00Z",
    ...overrides,
  };
}

function makeToday(visited: string[] = []): VisitedSites {
  return { date: "2026-02-03", visited };
}

function makeHistory(entries: Partial<VisitedSiteHistory>[] = []) {
  return entries.map(e => ({
    date: e.date ?? "2026-02-02",
    visitedUrls: e.visitedUrls ?? [],
    totalSites: e.totalSites ?? 5,
  }));
}

describe("useDataManagement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAppRepo.getAll.mockResolvedValue([]);
    mockAppRepo.getHistoryAll.mockResolvedValue([]);
    mockAppRepo.setState.mockResolvedValue(undefined);
    mockJobSitesRepo.getSites.mockResolvedValue([]);
    mockJobSitesRepo.getCategories.mockResolvedValue([]);
    mockJobSitesRepo.setState.mockResolvedValue(undefined);
    mockVisitedRepo.serialize.mockResolvedValue({
      today: makeToday(),
      history: [],
    });
    mockVisitedRepo.hydrate.mockResolvedValue(undefined);
    mockRefreshApplications.mockResolvedValue(undefined);
    mockRefreshJobSites.mockResolvedValue(undefined);
    mockRefreshVisitedSites.mockResolvedValue(undefined);
  });

  describe("exportAllData", () => {
    it("exports correct data structure with version 1.3", async () => {
      await withFrozenTime({
        now: "2026-02-03T15:00:00Z",
        fn: async () => {
          const apps = [makeApp()];
          const today = makeToday(["https://example.com"]);
          const history = makeHistory([{ date: "2026-02-02" }]);

          mockAppRepo.getAll.mockResolvedValue(apps);
          mockVisitedRepo.serialize.mockResolvedValue({ today, history });

          const { exportAllData } = useDataManagement();

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
          vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

          await exportAllData();
          await flushPromises();

          const text = await capturedBlob!.text();
          const exported = JSON.parse(text);

          expect(exported.version).toBe("1.3");
          expect(exported.exportedAt).toBeDefined();
          expect(exported.dailyChecklist).toEqual(today);
          expect(exported.dailyChecklistHistory).toEqual(history);
          expect(exported.applications).toEqual(apps);
        },
      });
    });

    it("omits empty sections from export", async () => {
      await withFrozenTime({
        now: "2026-02-03T15:00:00Z",
        fn: async () => {
          const { exportAllData } = useDataManagement();

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
          vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

          await exportAllData();
          await flushPromises();

          const text = await capturedBlob!.text();
          const exported = JSON.parse(text);

          expect(exported.dailyChecklist).toBeUndefined();
          expect(exported.dailyChecklistHistory).toBeUndefined();
          expect(exported.applications).toBeUndefined();
          expect(exported.applicationHistory).toBeUndefined();
          expect(exported.jobSites).toBeUndefined();
        },
      });
    });

    it("includes timestamp in export", async () => {
      await withFrozenTime({
        now: "2026-02-03T15:00:00Z",
        fn: async () => {
          const { exportAllData } = useDataManagement();
          const expectedTime = getNow().toString();

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
          vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

          await exportAllData();
          await flushPromises();

          const exported = JSON.parse(await capturedBlob!.text());
          expect(exported.exportedAt).toBe(expectedTime);
        },
      });
    });
  });

  describe("importAllData", () => {
    function makeFile(data: object): File {
      return new File([JSON.stringify(data)], "backup.json", {
        type: "application/json",
      });
    }

    it("imports v1.3 file with dailyChecklistHistory", async () => {
      const today = makeToday(["https://example.com"]);
      const history = makeHistory([{ date: "2026-02-02" }]);

      const { importAllData } = useDataManagement();
      await importAllData(
        makeFile({
          version: "1.3",
          exportedAt: "2026-02-03T10:00:00Z",
          dailyChecklist: today,
          dailyChecklistHistory: history,
        }),
      );

      expect(mockVisitedRepo.hydrate).toHaveBeenCalledWith({ today, history });
    });

    it("imports v1.2 file without dailyChecklistHistory", async () => {
      const today = makeToday(["https://example.com"]);

      const { importAllData } = useDataManagement();
      await importAllData(
        makeFile({
          version: "1.2",
          exportedAt: "2026-02-03T10:00:00Z",
          dailyChecklist: today,
        }),
      );

      expect(mockVisitedRepo.hydrate).toHaveBeenCalledWith({
        today,
        history: [],
      });
    });

    it("imports v1.1 file", async () => {
      const today = makeToday(["https://example.com"]);

      const { importAllData } = useDataManagement();
      await importAllData(
        makeFile({
          version: "1.1",
          exportedAt: "2026-02-03T10:00:00Z",
          dailyChecklist: today,
          applications: [],
        }),
      );

      expect(mockVisitedRepo.hydrate).toHaveBeenCalledWith({
        today,
        history: [],
      });
    });

    it("imports applications and history", async () => {
      const apps = [makeApp()];

      const { importAllData } = useDataManagement();
      await importAllData(
        makeFile({
          version: "1.3",
          exportedAt: "2026-02-03T10:00:00Z",
          applications: apps,
          applicationHistory: [],
        }),
      );

      expect(mockAppRepo.setState).toHaveBeenCalledWith({
        applications: apps,
        history: [],
      });
    });

    it("imports jobSites when present", async () => {
      const jobSites = {
        categories: [
          {
            id: "general",
            name: "General",
            createdAt: "2026-02-03T10:00:00Z",
            updatedAt: "2026-02-03T10:00:00Z",
          },
        ],
        sites: [
          {
            id: "linkedin",
            name: "LinkedIn",
            url: "https://linkedin.com",
            categoryId: "general",
            createdAt: "2026-02-03T10:00:00Z",
            updatedAt: "2026-02-03T10:00:00Z",
          },
        ],
      };

      const { importAllData } = useDataManagement();
      await importAllData(
        makeFile({
          version: "1.3",
          exportedAt: "2026-02-03T10:00:00Z",
          jobSites,
        }),
      );

      expect(mockJobSitesRepo.setState).toHaveBeenCalledWith(jobSites);
    });

    it("does not call hydrate when dailyChecklist absent", async () => {
      const { importAllData } = useDataManagement();
      await importAllData(
        makeFile({
          version: "1.3",
          exportedAt: "2026-02-03T10:00:00Z",
          applications: [],
        }),
      );

      expect(mockVisitedRepo.hydrate).not.toHaveBeenCalled();
    });

    it("rejects unsupported version", async () => {
      const { importAllData } = useDataManagement();
      await expect(
        importAllData(
          makeFile({ version: "9.9", exportedAt: "2026-02-03T10:00:00Z" }),
        ),
      ).rejects.toThrow("Unsupported version");
    });

    it("rejects invalid JSON", async () => {
      const { importAllData } = useDataManagement();
      const file = new File(["invalid {{{"], "backup.json", {
        type: "application/json",
      });
      await expect(importAllData(file)).rejects.toThrow();
    });

    it("rejects malformed applications", async () => {
      const { importAllData } = useDataManagement();
      await expect(
        importAllData(
          makeFile({
            version: "1.3",
            exportedAt: "2026-02-03T10:00:00Z",
            applications: "not-an-array",
          }),
        ),
      ).rejects.toThrow("Invalid applications format");
    });

    it("rejects malformed dailyChecklist", async () => {
      const { importAllData } = useDataManagement();
      await expect(
        importAllData(
          makeFile({
            version: "1.3",
            exportedAt: "2026-02-03T10:00:00Z",
            dailyChecklist: { visited: "not-an-array" },
          }),
        ),
      ).rejects.toThrow("Invalid dailyChecklist format");
    });

    it("rejects malformed jobSites", async () => {
      const { importAllData } = useDataManagement();
      await expect(
        importAllData(
          makeFile({
            version: "1.3",
            exportedAt: "2026-02-03T10:00:00Z",
            jobSites: { categories: "not-an-array" },
          }),
        ),
      ).rejects.toThrow("Invalid jobSites format");
    });
  });

  describe("can export and re-import", () => {
    it("round-trips data correctly", async () => {
      await withFrozenTime({
        now: "2026-02-03T15:00:00Z",
        fn: async () => {
          const apps = [makeApp()];
          const today = makeToday(["https://example.com"]);
          const history = makeHistory([{ date: "2026-02-02" }]);

          mockAppRepo.getAll.mockResolvedValue(apps);
          mockVisitedRepo.serialize.mockResolvedValue({ today, history });

          const { exportAllData, importAllData } = useDataManagement();

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
          vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

          await exportAllData();
          await flushPromises();

          const file = new File([await capturedBlob!.text()], "backup.json", {
            type: "application/json",
          });

          await importAllData(file);

          expect(mockVisitedRepo.hydrate).toHaveBeenCalledWith({
            today,
            history,
          });
          expect(mockAppRepo.setState).toHaveBeenCalledWith({
            applications: apps,
            history: [],
          });
        },
      });
    });
  });
});
