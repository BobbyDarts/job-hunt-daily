// /src/composables/data/use-applications.test.ts

import { flushPromises } from "@vue/test-utils";
import { describe, it, expect, beforeEach, vi } from "vitest";

import { withFrozenTime } from "@/test-utils/with-frozen-time";
import type { Application, ApplicationHistory } from "@/types";

import { useApplications } from "./use-applications";

const mockRepo = vi.hoisted(() => ({
  getAll: vi.fn(),
  getHistoryAll: vi.fn(),
  getById: vi.fn(),
  getHistoryById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  setState: vi.fn(),
}));

vi.mock(
  "@/services/repositories/applications/create-applications-repository",
  () => ({
    getApplicationsRepository: vi.fn(() => mockRepo),
  }),
);

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

function makeHistory(
  overrides: Partial<ApplicationHistory> = {},
): ApplicationHistory {
  return {
    id: "hist_1",
    applicationId: "app_1",
    historyTimestamp: "2026-02-03T10:00:00Z",
    reason: "updated",
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

describe("useApplications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRepo.getAll.mockResolvedValue([]);
    mockRepo.getHistoryAll.mockResolvedValue([]);
    mockRepo.getById.mockResolvedValue(null);
    mockRepo.getHistoryById.mockResolvedValue([]);
    mockRepo.create.mockResolvedValue(makeApp());
    mockRepo.update.mockResolvedValue(makeApp());
    mockRepo.remove.mockResolvedValue(undefined);
    mockRepo.setState.mockResolvedValue(undefined);
  });

  describe("initialization", () => {
    it("starts with empty applications array", () => {
      const { applications, totalCount } = useApplications();
      expect(applications.value).toEqual([]);
      expect(totalCount.value).toBe(0);
    });

    it("loads existing applications on init", async () => {
      const existing = [makeApp({ id: "app_1", company: "Acme Corp" })];
      mockRepo.getAll.mockResolvedValue(existing);

      await useApplications().init();
      await flushPromises();

      const { applications, totalCount } = useApplications();
      expect(applications.value).toEqual(existing);
      expect(totalCount.value).toBe(1);
    });

    it("loads history on init", async () => {
      const history = [makeHistory()];
      mockRepo.getHistoryAll.mockResolvedValue(history);

      await useApplications().init();
      await flushPromises();

      expect(useApplications().applicationHistory.value).toEqual(history);
    });
  });

  describe("createApplication", () => {
    it("calls repo.create and refreshes", async () => {
      await withFrozenTime({
        now: "2026-02-03T10:00:00Z",
        fn: async () => {
          const created = makeApp({ id: "app_new", company: "New Co" });
          mockRepo.create.mockResolvedValue(created);
          mockRepo.getAll.mockResolvedValue([created]);

          await useApplications().init();
          await flushPromises();

          const { createApplication, applications } = useApplications();
          await createApplication({
            company: "New Co",
            position: "Dev",
            jobSiteId: "newco",
            jobSiteUrl: "https://newco.com",
            status: "applied",
            appliedDate: "2026-02-03",
          });
          await flushPromises();

          expect(mockRepo.create).toHaveBeenCalled();
          expect(applications.value).toContainEqual(created);
        },
      });
    });

    it("generates unique IDs for multiple applications", async () => {
      await withFrozenTime({
        now: "2026-02-03T10:00:00Z",
        fn: async () => {
          const app1 = makeApp({ id: "app_1" });
          const app2 = makeApp({ id: "app_2" });

          mockRepo.create.mockResolvedValueOnce(app1);
          mockRepo.getAll.mockResolvedValue([app1]);

          const { createApplication } = useApplications();
          const result1 = await createApplication({
            company: "A",
            position: "Dev",
            jobSiteId: "a",
            jobSiteUrl: "https://a.com",
            status: "applied",
            appliedDate: "2026-02-03",
          });
          await flushPromises();

          mockRepo.create.mockResolvedValueOnce(app2);
          mockRepo.getAll.mockResolvedValue([app1, app2]);
          const result2 = await createApplication({
            company: "B",
            position: "Dev",
            jobSiteId: "b",
            jobSiteUrl: "https://b.com",
            status: "applied",
            appliedDate: "2026-02-03",
          });
          await flushPromises();

          expect(result1.id).not.toBe(result2.id);
        },
      });
    });
  });

  describe("updateApplication", () => {
    it("calls repo.update and refreshes", async () => {
      await withFrozenTime({
        now: "2026-02-03T10:00:00Z",
        fn: async () => {
          const original = makeApp({ id: "app_1", status: "applied" });
          const updated = makeApp({
            id: "app_1",
            status: "interviewing",
            updatedAt: "2026-02-03T10:00:01Z",
          });

          mockRepo.getAll.mockResolvedValue([original]);
          await useApplications().init();
          await flushPromises();

          mockRepo.update.mockResolvedValue(updated);
          mockRepo.getAll.mockResolvedValue([updated]);

          const { updateApplication, applications } = useApplications();
          const result = await updateApplication("app_1", {
            status: "interviewing",
          });
          await flushPromises();

          expect(mockRepo.update).toHaveBeenCalledWith("app_1", {
            status: "interviewing",
          });
          expect(result?.status).toBe("interviewing");
          expect(applications.value[0].status).toBe("interviewing");
        },
      });
    });

    it("returns undefined when repo.update throws", async () => {
      mockRepo.update.mockRejectedValue(new Error("Not found"));

      const { updateApplication } = useApplications();
      const result = await updateApplication("nonexistent", {
        status: "interviewing",
      });

      expect(result).toBeUndefined();
    });

    it("does not change createdAt on update", async () => {
      await withFrozenTime({
        now: "2026-02-03T10:00:00Z",
        fn: async () => {
          const existing = makeApp({
            id: "app_1",
            createdAt: "2026-02-03T10:00:00Z",
          });
          const updated = makeApp({
            id: "app_1",
            createdAt: "2026-02-03T10:00:00Z",
            updatedAt: "2026-02-03T10:00:01Z",
          });

          mockRepo.getAll.mockResolvedValue([existing]);
          await useApplications().init();
          await flushPromises();

          mockRepo.update.mockResolvedValue(updated);
          mockRepo.getAll.mockResolvedValue([updated]);

          const { updateApplication } = useApplications();
          const result = await updateApplication("app_1", { notes: "hello" });
          await flushPromises();

          expect(result?.createdAt).toBe("2026-02-03T10:00:00Z");
        },
      });
    });
  });

  describe("removeApplication", () => {
    it("calls repo.remove and refreshes", async () => {
      const app = makeApp({ id: "app_1" });
      mockRepo.getAll.mockResolvedValue([app]);

      await useApplications().init();
      await flushPromises();

      mockRepo.getAll.mockResolvedValue([]);

      const { removeApplication, applications } = useApplications();
      const result = await removeApplication("app_1");
      await flushPromises();

      expect(mockRepo.remove).toHaveBeenCalledWith("app_1");
      expect(result).toBe(true);
      expect(applications.value).toHaveLength(0);
    });

    it("returns false when repo.remove throws", async () => {
      mockRepo.remove.mockRejectedValue(new Error("Not found"));

      const { removeApplication } = useApplications();
      const result = await removeApplication("nonexistent");

      expect(result).toBe(false);
    });

    it("only removes the specified application", async () => {
      const app1 = makeApp({ id: "app_1", company: "A" });
      const app2 = makeApp({ id: "app_2", company: "B" });

      mockRepo.getAll.mockResolvedValue([app1, app2]);
      await useApplications().init();
      await flushPromises();

      mockRepo.getAll.mockResolvedValue([app2]);

      const { removeApplication, applications } = useApplications();
      await removeApplication("app_1");
      await flushPromises();

      expect(applications.value).toHaveLength(1);
      expect(applications.value[0].id).toBe("app_2");
    });
  });

  describe("getApplication", () => {
    it("returns application by id", async () => {
      const app = makeApp({ id: "app_1" });
      mockRepo.getAll.mockResolvedValue([app]);

      await useApplications().init();
      await flushPromises();

      expect(useApplications().getApplication("app_1")).toEqual(app);
    });

    it("returns undefined for non-existent id", async () => {
      await useApplications().init();
      await flushPromises();

      expect(useApplications().getApplication("nonexistent")).toBeUndefined();
    });
  });

  describe("countByStatus", () => {
    it("counts applications by status", async () => {
      mockRepo.getAll.mockResolvedValue([
        makeApp({ id: "1", status: "applied" }),
        makeApp({ id: "2", status: "applied" }),
        makeApp({ id: "3", status: "interviewing" }),
      ]);

      await useApplications().init();
      await flushPromises();

      const { countByStatus } = useApplications();
      expect(countByStatus.value.applied).toBe(2);
      expect(countByStatus.value.interviewing).toBe(1);
      expect(countByStatus.value.offer).toBeUndefined();
    });

    it("returns empty object when no applications", async () => {
      await useApplications().init();
      await flushPromises();

      expect(useApplications().countByStatus.value).toEqual({});
    });
  });

  describe("filterByStatus", () => {
    it("filters applications by status", async () => {
      mockRepo.getAll.mockResolvedValue([
        makeApp({ id: "1", company: "A", status: "applied" }),
        makeApp({ id: "2", company: "B", status: "interviewing" }),
      ]);

      await useApplications().init();
      await flushPromises();

      const { filterByStatus } = useApplications();
      expect(filterByStatus("applied")).toHaveLength(1);
      expect(filterByStatus("applied")[0].company).toBe("A");
      expect(filterByStatus("interviewing")).toHaveLength(1);
      expect(filterByStatus("offer")).toHaveLength(0);
    });
  });

  describe("filterByTag", () => {
    it("filters applications by tag", async () => {
      mockRepo.getAll.mockResolvedValue([
        makeApp({ id: "1", company: "A", tags: ["virtual", "behavioral"] }),
        makeApp({ id: "2", company: "B", tags: ["offer_negotiation"] }),
      ]);

      await useApplications().init();
      await flushPromises();

      const { filterByTag } = useApplications();
      expect(filterByTag("virtual")).toHaveLength(1);
      expect(filterByTag("virtual")[0].company).toBe("A");
      expect(filterByTag("offer_negotiation")).toHaveLength(1);
      expect(filterByTag("technical")).toHaveLength(0);
    });

    it("returns empty array for applications without tags", async () => {
      mockRepo.getAll.mockResolvedValue([makeApp({ id: "1" })]);

      await useApplications().init();
      await flushPromises();

      expect(useApplications().filterByTag("onsite")).toHaveLength(0);
    });
  });

  describe("search", () => {
    beforeEach(async () => {
      mockRepo.getAll.mockResolvedValue([
        makeApp({ id: "1", company: "Google", position: "Developer" }),
        makeApp({ id: "2", company: "Amazon", position: "Senior Designer" }),
      ]);

      await useApplications().init();
      await flushPromises();
    });

    it("searches by company name", () => {
      const results = useApplications().search("goo");
      expect(results).toHaveLength(1);
      expect(results[0].company).toBe("Google");
    });

    it("searches by position", () => {
      const results = useApplications().search("designer");
      expect(results).toHaveLength(1);
      expect(results[0].position).toBe("Senior Designer");
    });

    it("is case-insensitive", () => {
      expect(useApplications().search("GOOGLE")).toHaveLength(1);
    });

    it("returns empty array when no matches", () => {
      expect(useApplications().search("nonexistent")).toHaveLength(0);
    });
  });

  describe("getApplicationTimeline", () => {
    it("returns empty array for non-existent application", async () => {
      await useApplications().init();
      await flushPromises();

      expect(useApplications().getApplicationTimeline("nonexistent")).toEqual(
        [],
      );
    });

    it("returns current application when no history exists", async () => {
      const app = makeApp({ id: "app_1" });
      mockRepo.getAll.mockResolvedValue([app]);

      await useApplications().init();
      await flushPromises();

      const timeline = useApplications().getApplicationTimeline("app_1");
      expect(timeline).toHaveLength(1);
      expect(timeline[0]).toEqual(app);
    });

    it("returns chronological timeline with history and current state", async () => {
      const app = makeApp({ id: "app_1", status: "offer" });
      const hist1 = makeHistory({
        id: "h1",
        applicationId: "app_1",
        status: "applied",
        historyTimestamp: "2026-02-03T10:00:00Z",
      });
      const hist2 = makeHistory({
        id: "h2",
        applicationId: "app_1",
        status: "interviewing",
        historyTimestamp: "2026-02-03T10:00:01Z",
      });

      mockRepo.getAll.mockResolvedValue([app]);
      mockRepo.getHistoryAll.mockResolvedValue([hist1, hist2]);

      await useApplications().init();
      await flushPromises();

      const timeline = useApplications().getApplicationTimeline("app_1");
      expect(timeline).toHaveLength(3);
      expect(timeline[0].status).toBe("applied");
      expect(timeline[1].status).toBe("interviewing");
      expect(timeline[2].status).toBe("offer");
    });
  });

  describe("getStatusChanges", () => {
    it("returns empty array when no status changes", async () => {
      const app = makeApp({ id: "app_1", status: "applied" });
      mockRepo.getAll.mockResolvedValue([app]);
      mockRepo.getHistoryAll.mockResolvedValue([]);

      await useApplications().init();
      await flushPromises();

      expect(useApplications().getStatusChanges("app_1")).toEqual([]);
    });

    it("tracks status changes in order", async () => {
      const app = makeApp({ id: "app_1", status: "offer" });
      const hist1 = makeHistory({
        id: "h1",
        applicationId: "app_1",
        status: "applied",
        historyTimestamp: "2026-02-03T10:00:00Z",
      });
      const hist2 = makeHistory({
        id: "h2",
        applicationId: "app_1",
        status: "interviewing",
        historyTimestamp: "2026-02-03T10:00:01Z",
      });

      mockRepo.getAll.mockResolvedValue([app]);
      mockRepo.getHistoryAll.mockResolvedValue([hist1, hist2]);

      await useApplications().init();
      await flushPromises();

      const changes = useApplications().getStatusChanges("app_1");
      expect(changes).toHaveLength(2);
      expect(changes[0]).toMatchObject({ from: "applied", to: "interviewing" });
      expect(changes[1]).toMatchObject({ from: "interviewing", to: "offer" });
    });

    it("ignores updates that don't change status", async () => {
      const app = makeApp({ id: "app_1", status: "interviewing" });
      const hist1 = makeHistory({
        id: "h1",
        applicationId: "app_1",
        status: "applied",
        historyTimestamp: "2026-02-03T10:00:00Z",
      });
      const hist2 = makeHistory({
        id: "h2",
        applicationId: "app_1",
        status: "applied",
        notes: "Updated notes",
        historyTimestamp: "2026-02-03T10:00:01Z",
      });

      mockRepo.getAll.mockResolvedValue([app]);
      mockRepo.getHistoryAll.mockResolvedValue([hist1, hist2]);

      await useApplications().init();
      await flushPromises();

      const changes = useApplications().getStatusChanges("app_1");
      expect(changes).toHaveLength(1);
      expect(changes[0]).toMatchObject({ from: "applied", to: "interviewing" });
    });
  });
});
