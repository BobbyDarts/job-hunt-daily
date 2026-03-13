// /src/composables/data/use-applications-repository.test.ts

import { describe, it, expect, beforeEach } from "vitest";

import { toInstant, toPlainDate } from "@/lib/time";
import { withFrozenTime } from "@/test-utils/with-frozen-time";
import type { Application } from "@/types";

import {
  TEST_APPLICATIONS_HISTORY_STORAGE_KEY,
  TEST_APPLICATIONS_STORAGE_KEY,
} from "./keys";
import { useApplicationsRepository } from "./use-applications-repository";

describe("useApplicationsRepository", () => {
  const repoParams = {
    storageKey: TEST_APPLICATIONS_STORAGE_KEY,
    historyStorageKey: TEST_APPLICATIONS_HISTORY_STORAGE_KEY,
  };

  const baseApp: Omit<Application, "id" | "createdAt" | "updatedAt"> = {
    company: "Tech Co",
    position: "Developer",
    jobSiteId: "techco",
    jobSiteUrl: "https://techco.com",
    status: "applied",
    appliedDate: toPlainDate("2026-02-03").toString(),
  };

  beforeEach(() => {
    localStorage.clear();
  });

  describe("initialization", () => {
    it("starts with empty applications and history", () => {
      const { applications, applicationHistory } =
        useApplicationsRepository(repoParams);

      expect(applications.value).toEqual([]);
      expect(applicationHistory.value).toEqual([]);
    });

    it("reads existing applications from localStorage on init", () => {
      const existing: Application[] = [
        {
          id: "app_1",
          company: "Acme",
          position: "Dev",
          jobSiteId: "acme",
          jobSiteUrl: "https://acme.com",
          status: "applied",
          appliedDate: toPlainDate("2026-02-03").toString(),
          createdAt: toInstant("2026-02-03T10:00:00Z").toString(),
          updatedAt: toInstant("2026-02-03T10:00:00Z").toString(),
        },
      ];

      localStorage.setItem(
        TEST_APPLICATIONS_STORAGE_KEY,
        JSON.stringify(existing),
      );

      const { applications } = useApplicationsRepository(repoParams);

      expect(applications.value).toEqual(existing);
    });
  });

  describe("getAll", () => {
    it("returns all applications", async () => {
      const repo = useApplicationsRepository(repoParams);
      await repo.create(baseApp);
      await repo.create({ ...baseApp, company: "Other Co" });

      const all = await repo.getAll();
      expect(all).toHaveLength(2);
    });

    it("returns empty array when no applications exist", async () => {
      const repo = useApplicationsRepository(repoParams);
      const all = await repo.getAll();
      expect(all).toEqual([]);
    });
  });

  describe("getById", () => {
    it("returns application when id exists", async () => {
      const repo = useApplicationsRepository(repoParams);
      const created = await repo.create(baseApp);

      const found = await repo.getById(created.id);
      expect(found).toEqual(created);
    });

    it("returns null when id does not exist", async () => {
      const repo = useApplicationsRepository(repoParams);
      const found = await repo.getById("nonexistent");
      expect(found).toBeNull();
    });
  });

  describe("create", () => {
    it("creates application with generated id and timestamps", async () => {
      await withFrozenTime({
        now: "2026-02-03T10:00:00Z",
        fn: async () => {
          const repo = useApplicationsRepository(repoParams);
          const created = await repo.create(baseApp);

          expect(created.id).toMatch(/^app_/);
          expect(created.createdAt).toBe(
            toInstant("2026-02-03T10:00:00Z").toString(),
          );
          expect(created.updatedAt).toBe(
            toInstant("2026-02-03T10:00:00Z").toString(),
          );
        },
      });
    });

    it("persists to localStorage", async () => {
      const repo = useApplicationsRepository(repoParams);
      const created = await repo.create(baseApp);

      const stored = JSON.parse(
        localStorage.getItem(TEST_APPLICATIONS_STORAGE_KEY)!,
      );
      expect(stored).toHaveLength(1);
      expect(stored[0].id).toBe(created.id);
    });

    it("preserves all provided fields", async () => {
      const repo = useApplicationsRepository(repoParams);
      const created = await repo.create({
        ...baseApp,
        atsType: "greenhouse",
        tags: ["virtual", "technical"],
        notes: "Great role",
        followUpDate: "2026-02-10",
      });

      expect(created.atsType).toBe("greenhouse");
      expect(created.tags).toEqual(["virtual", "technical"]);
      expect(created.notes).toBe("Great role");
      expect(created.followUpDate).toBe("2026-02-10");
    });

    it("generates unique ids for concurrent creates", async () => {
      await withFrozenTime({
        now: "2026-02-03T10:00:00Z",
        fn: async () => {
          const repo = useApplicationsRepository(repoParams);
          const results = await Promise.all([
            repo.create(baseApp),
            repo.create(baseApp),
            repo.create(baseApp),
          ]);

          const ids = results.map(r => r.id);
          const uniqueIds = new Set(ids);
          expect(uniqueIds.size).toBe(3);
        },
      });
    });

    it("does not create a history entry", async () => {
      const repo = useApplicationsRepository(repoParams);
      await repo.create(baseApp);

      expect(repo.applicationHistory.value).toHaveLength(0);
    });
  });

  describe("update", () => {
    it("updates application fields", async () => {
      await withFrozenTime({
        now: "2026-02-03T10:00:00Z",
        fn: async () => {
          const repo = useApplicationsRepository(repoParams);
          const created = await repo.create(baseApp);

          await withFrozenTime({
            now: "2026-02-03T10:00:01Z",
            fn: async () => {
              const updated = await repo.update(created.id, {
                status: "interviewing",
                notes: "Phone screen scheduled",
              });

              expect(updated.status).toBe("interviewing");
              expect(updated.notes).toBe("Phone screen scheduled");
              expect(updated.company).toBe("Tech Co");
            },
          });
        },
      });
    });

    it("stamps updatedAt with current time", async () => {
      await withFrozenTime({
        now: "2026-02-03T10:00:00Z",
        fn: async () => {
          const repo = useApplicationsRepository(repoParams);
          const created = await repo.create(baseApp);

          await withFrozenTime({
            now: "2026-02-03T10:00:01Z",
            fn: async () => {
              const updated = await repo.update(created.id, {
                status: "interviewing",
              });

              expect(updated.updatedAt).toBe(
                toInstant("2026-02-03T10:00:01Z").toString(),
              );
              expect(updated.updatedAt).not.toBe(created.updatedAt);
            },
          });
        },
      });
    });

    it("does not change createdAt", async () => {
      await withFrozenTime({
        now: "2026-02-03T10:00:00Z",
        fn: async () => {
          const repo = useApplicationsRepository(repoParams);
          const created = await repo.create(baseApp);

          await withFrozenTime({
            now: "2026-02-03T10:00:01Z",
            fn: async () => {
              const updated = await repo.update(created.id, {
                status: "interviewing",
              });

              expect(updated.createdAt).toBe(created.createdAt);
            },
          });
        },
      });
    });

    it("persists update to localStorage", async () => {
      const repo = useApplicationsRepository(repoParams);
      const created = await repo.create(baseApp);
      await repo.update(created.id, { status: "interviewing" });

      const stored = JSON.parse(
        localStorage.getItem(TEST_APPLICATIONS_STORAGE_KEY)!,
      );
      expect(stored[0].status).toBe("interviewing");
    });

    it("throws when id does not exist", async () => {
      const repo = useApplicationsRepository(repoParams);

      await expect(
        repo.update("nonexistent", { status: "interviewing" }),
      ).rejects.toThrow("nonexistent");
    });

    it("snapshots previous state to history with reason 'updated'", async () => {
      await withFrozenTime({
        now: "2026-02-03T10:00:00Z",
        fn: async () => {
          const repo = useApplicationsRepository(repoParams);
          const created = await repo.create(baseApp);

          await withFrozenTime({
            now: "2026-02-03T10:00:01Z",
            fn: async () => {
              await repo.update(created.id, { status: "interviewing" });

              expect(repo.applicationHistory.value).toHaveLength(1);
              const snapshot = repo.applicationHistory.value[0];
              expect(snapshot.applicationId).toBe(created.id);
              expect(snapshot.status).toBe("applied");
              expect(snapshot.reason).toBe("updated");
              expect(snapshot.historyTimestamp).toBe(
                toInstant("2026-02-03T10:00:01Z").toString(),
              );
            },
          });
        },
      });
    });

    it("accumulates history across multiple updates", async () => {
      await withFrozenTime({
        now: "2026-02-03T10:00:00Z",
        fn: async () => {
          const repo = useApplicationsRepository(repoParams);
          const created = await repo.create(baseApp);

          await withFrozenTime({
            now: "2026-02-03T10:00:01Z",
            fn: async () => {
              await repo.update(created.id, { status: "interviewing" });
            },
          });

          await withFrozenTime({
            now: "2026-02-03T10:00:02Z",
            fn: async () => {
              await repo.update(created.id, { status: "offer" });
            },
          });

          expect(repo.applicationHistory.value).toHaveLength(2);
          expect(repo.applicationHistory.value[0].status).toBe("applied");
          expect(repo.applicationHistory.value[1].status).toBe("interviewing");
        },
      });
    });

    it("snapshot history entries have unique ids", async () => {
      await withFrozenTime({
        now: "2026-02-03T10:00:00Z",
        fn: async () => {
          const repo = useApplicationsRepository(repoParams);
          const created = await repo.create(baseApp);

          await withFrozenTime({
            now: "2026-02-03T10:00:01Z",
            fn: async () => {
              await repo.update(created.id, { status: "interviewing" });
            },
          });

          await withFrozenTime({
            now: "2026-02-03T10:00:02Z",
            fn: async () => {
              await repo.update(created.id, { status: "offer" });
            },
          });

          const ids = repo.applicationHistory.value.map(h => h.id);
          expect(new Set(ids).size).toBe(2);
          expect(ids[0]).not.toBe(created.id);
          expect(ids[1]).not.toBe(created.id);
        },
      });
    });
  });

  describe("remove", () => {
    it("removes application by id", async () => {
      const repo = useApplicationsRepository(repoParams);
      const created = await repo.create(baseApp);
      await repo.remove(created.id);

      expect(repo.applications.value).toHaveLength(0);
    });

    it("only removes the specified application", async () => {
      const repo = useApplicationsRepository(repoParams);
      const app1 = await repo.create(baseApp);
      const app2 = await repo.create({ ...baseApp, company: "Other Co" });

      await repo.remove(app1.id);

      expect(repo.applications.value).toHaveLength(1);
      expect(repo.applications.value[0].id).toBe(app2.id);
    });

    it("persists removal to localStorage", async () => {
      const repo = useApplicationsRepository(repoParams);
      const created = await repo.create(baseApp);
      await repo.remove(created.id);

      const stored = JSON.parse(
        localStorage.getItem(TEST_APPLICATIONS_STORAGE_KEY)!,
      );
      expect(stored).toHaveLength(0);
    });

    it("throws when id does not exist", async () => {
      const repo = useApplicationsRepository(repoParams);
      await expect(repo.remove("nonexistent")).rejects.toThrow("nonexistent");
    });

    it("snapshots final state to history with reason 'deleted'", async () => {
      await withFrozenTime({
        now: "2026-02-03T10:00:00Z",
        fn: async () => {
          const repo = useApplicationsRepository(repoParams);
          const created = await repo.create(baseApp);

          await withFrozenTime({
            now: "2026-02-03T10:00:01Z",
            fn: async () => {
              await repo.remove(created.id);

              expect(repo.applicationHistory.value).toHaveLength(1);
              const snapshot = repo.applicationHistory.value[0];
              expect(snapshot.applicationId).toBe(created.id);
              expect(snapshot.reason).toBe("deleted");
              expect(snapshot.status).toBe("applied");
            },
          });
        },
      });
    });

    it("preserves history after removal", async () => {
      await withFrozenTime({
        now: "2026-02-03T10:00:00Z",
        fn: async () => {
          const repo = useApplicationsRepository(repoParams);
          const created = await repo.create(baseApp);

          await withFrozenTime({
            now: "2026-02-03T10:00:01Z",
            fn: async () => {
              await repo.update(created.id, { status: "interviewing" });
            },
          });

          await withFrozenTime({
            now: "2026-02-03T10:00:02Z",
            fn: async () => {
              await repo.remove(created.id);
            },
          });

          // 1 update snapshot + 1 delete snapshot
          expect(repo.applicationHistory.value).toHaveLength(2);
          expect(repo.applicationHistory.value[0].reason).toBe("updated");
          expect(repo.applicationHistory.value[1].reason).toBe("deleted");
        },
      });
    });
  });

  describe("getHistory", () => {
    it("returns history entries for a specific application", async () => {
      await withFrozenTime({
        now: "2026-02-03T10:00:00Z",
        fn: async () => {
          const repo = useApplicationsRepository(repoParams);
          const app1 = await repo.create(baseApp);
          const app2 = await repo.create({ ...baseApp, company: "Other Co" });

          await withFrozenTime({
            now: "2026-02-03T10:00:01Z",
            fn: async () => {
              await repo.update(app1.id, { status: "interviewing" });
              await repo.update(app2.id, { status: "offer" });
            },
          });

          const history = await repo.getHistory(app1.id);
          expect(history).toHaveLength(1);
          expect(history[0].applicationId).toBe(app1.id);
        },
      });
    });

    it("returns empty array for application with no history", async () => {
      const repo = useApplicationsRepository(repoParams);
      const created = await repo.create(baseApp);

      const history = await repo.getHistory(created.id);
      expect(history).toEqual([]);
    });

    it("returns empty array for nonexistent application id", async () => {
      const repo = useApplicationsRepository(repoParams);
      const history = await repo.getHistory("nonexistent");
      expect(history).toEqual([]);
    });
  });

  describe("getAllHistory", () => {
    it("returns all history entries across all applications", async () => {
      await withFrozenTime({
        now: "2026-02-03T10:00:00Z",
        fn: async () => {
          const repo = useApplicationsRepository(repoParams);
          const app1 = await repo.create(baseApp);
          const app2 = await repo.create({ ...baseApp, company: "Other Co" });

          await withFrozenTime({
            now: "2026-02-03T10:00:01Z",
            fn: async () => {
              await repo.update(app1.id, { status: "interviewing" });
              await repo.update(app2.id, { status: "offer" });
            },
          });

          const all = await repo.getAllHistory();
          expect(all).toHaveLength(2);
        },
      });
    });

    it("returns empty array when no history exists", async () => {
      const repo = useApplicationsRepository(repoParams);
      const all = await repo.getAllHistory();
      expect(all).toEqual([]);
    });
  });

  describe("setAll", () => {
    it("replaces all applications and history", async () => {
      const repo = useApplicationsRepository(repoParams);
      await repo.create(baseApp);

      const newApps: Application[] = [
        {
          id: "imported_1",
          company: "Imported Co",
          position: "Engineer",
          jobSiteId: "imported",
          jobSiteUrl: "https://imported.com",
          status: "applied",
          appliedDate: toPlainDate("2026-02-03").toString(),
          createdAt: toInstant("2026-02-03T10:00:00Z").toString(),
          updatedAt: toInstant("2026-02-03T10:00:00Z").toString(),
        },
      ];

      await repo.setAll(newApps, []);

      expect(repo.applications.value).toEqual(newApps);
      expect(repo.applicationHistory.value).toEqual([]);
    });

    it("persists replacement to localStorage", async () => {
      const repo = useApplicationsRepository(repoParams);
      await repo.create(baseApp);

      const newApps: Application[] = [
        {
          id: "imported_1",
          company: "Imported Co",
          position: "Engineer",
          jobSiteId: "imported",
          jobSiteUrl: "https://imported.com",
          status: "applied",
          appliedDate: toPlainDate("2026-02-03").toString(),
          createdAt: toInstant("2026-02-03T10:00:00Z").toString(),
          updatedAt: toInstant("2026-02-03T10:00:00Z").toString(),
        },
      ];

      await repo.setAll(newApps, []);

      const stored = JSON.parse(
        localStorage.getItem(TEST_APPLICATIONS_STORAGE_KEY)!,
      );
      expect(stored).toEqual(newApps);
    });

    it("overwrites existing data", async () => {
      const repo = useApplicationsRepository(repoParams);
      await repo.create(baseApp);
      await repo.create({ ...baseApp, company: "Other Co" });

      await repo.setAll([], []);

      expect(repo.applications.value).toHaveLength(0);
    });
  });

  describe("persistence across instances", () => {
    it("data written by one instance is read by another", async () => {
      const repo1 = useApplicationsRepository(repoParams);
      const created = await repo1.create(baseApp);

      const repo2 = useApplicationsRepository(repoParams);
      const found = await repo2.getById(created.id);

      expect(found).toEqual(created);
    });

    it("history written by one instance is visible in another", async () => {
      await withFrozenTime({
        now: "2026-02-03T10:00:00Z",
        fn: async () => {
          const repo1 = useApplicationsRepository(repoParams);
          const created = await repo1.create(baseApp);

          await withFrozenTime({
            now: "2026-02-03T10:00:01Z",
            fn: async () => {
              await repo1.update(created.id, { status: "interviewing" });

              const repo2 = useApplicationsRepository(repoParams);
              const history = await repo2.getHistory(created.id);
              expect(history).toHaveLength(1);
            },
          });
        },
      });
    });
  });
});
