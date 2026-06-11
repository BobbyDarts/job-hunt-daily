// /src/services/repositories/applications/local-applications-repository.test.ts

import { describe, it, expect, beforeEach } from "vitest";

import { TEST_STORAGE_KEYS } from "@/constants/storage-keys";
import { toInstant, toPlainDate } from "@/lib/time";
import { withFrozenTime } from "@/test-utils/with-frozen-time";
import type { Application } from "@/types";

import { createLocalApplicationsRepository } from "./local-applications-repository";

const repoParams = {
  storageKey: TEST_STORAGE_KEYS.APPLICATIONS,
  historyStorageKey: TEST_STORAGE_KEYS.APPLICATIONS_HISTORY,
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

describe("createLocalApplicationsRepository", () => {
  describe("initialization", () => {
    it("starts with empty applications and history", async () => {
      const repo = createLocalApplicationsRepository(repoParams);
      expect(await repo.getAll()).toEqual([]);
      expect(await repo.getHistoryAll()).toEqual([]);
    });

    it("reads existing applications from localStorage on init", async () => {
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
        TEST_STORAGE_KEYS.APPLICATIONS,
        JSON.stringify(existing),
      );

      const repo = createLocalApplicationsRepository(repoParams);
      expect(await repo.getAll()).toEqual(existing);
    });
  });

  describe("getAll", () => {
    it("returns all applications", async () => {
      const repo = createLocalApplicationsRepository(repoParams);
      await repo.create(baseApp);
      await repo.create({ ...baseApp, company: "Other Co" });
      expect(await repo.getAll()).toHaveLength(2);
    });

    it("returns empty array when no applications exist", async () => {
      const repo = createLocalApplicationsRepository(repoParams);
      expect(await repo.getAll()).toEqual([]);
    });
  });

  describe("getById", () => {
    it("returns application when id exists", async () => {
      const repo = createLocalApplicationsRepository(repoParams);
      const created = await repo.create(baseApp);
      expect(await repo.getById(created.id)).toEqual(created);
    });

    it("returns null when id does not exist", async () => {
      const repo = createLocalApplicationsRepository(repoParams);
      expect(await repo.getById("nonexistent")).toBeNull();
    });
  });

  describe("create", () => {
    it("creates application with UUID and timestamps", async () => {
      await withFrozenTime({
        now: "2026-02-03T10:00:00Z",
        fn: async () => {
          const repo = createLocalApplicationsRepository(repoParams);
          const created = await repo.create(baseApp);

          const UUID_REGEX =
            /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
          expect(created.id).toMatch(UUID_REGEX);
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
      const repo = createLocalApplicationsRepository(repoParams);
      const created = await repo.create(baseApp);

      const stored = JSON.parse(
        localStorage.getItem(TEST_STORAGE_KEYS.APPLICATIONS)!,
      );
      expect(stored).toHaveLength(1);
      expect(stored[0].id).toBe(created.id);
    });

    it("preserves all provided fields", async () => {
      const repo = createLocalApplicationsRepository(repoParams);
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
          const repo = createLocalApplicationsRepository(repoParams);
          const results = await Promise.all([
            repo.create(baseApp),
            repo.create(baseApp),
            repo.create(baseApp),
          ]);

          const ids = results.map(r => r.id);
          expect(new Set(ids).size).toBe(3);
        },
      });
    });

    it("does not create a history entry", async () => {
      const repo = createLocalApplicationsRepository(repoParams);
      await repo.create(baseApp);
      expect(await repo.getHistoryAll()).toHaveLength(0);
    });
  });

  describe("update", () => {
    it("updates application fields", async () => {
      await withFrozenTime({
        now: "2026-02-03T10:00:00Z",
        fn: async () => {
          const repo = createLocalApplicationsRepository(repoParams);
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
          const repo = createLocalApplicationsRepository(repoParams);
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
          const repo = createLocalApplicationsRepository(repoParams);
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
      const repo = createLocalApplicationsRepository(repoParams);
      const created = await repo.create(baseApp);
      await repo.update(created.id, { status: "interviewing" });

      const stored = JSON.parse(
        localStorage.getItem(TEST_STORAGE_KEYS.APPLICATIONS)!,
      );
      expect(stored[0].status).toBe("interviewing");
    });

    it("throws when id does not exist", async () => {
      const repo = createLocalApplicationsRepository(repoParams);
      await expect(
        repo.update("nonexistent", { status: "interviewing" }),
      ).rejects.toThrow("nonexistent");
    });

    it("snapshots previous state to history with reason 'updated'", async () => {
      await withFrozenTime({
        now: "2026-02-03T10:00:00Z",
        fn: async () => {
          const repo = createLocalApplicationsRepository(repoParams);
          const created = await repo.create(baseApp);

          await withFrozenTime({
            now: "2026-02-03T10:00:01Z",
            fn: async () => {
              await repo.update(created.id, { status: "interviewing" });

              const history = await repo.getHistoryAll();
              expect(history).toHaveLength(1);
              expect(history[0].applicationId).toBe(created.id);
              expect(history[0].status).toBe("applied");
              expect(history[0].reason).toBe("updated");
              expect(history[0].historyTimestamp).toBe(
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
          const repo = createLocalApplicationsRepository(repoParams);
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

          const history = await repo.getHistoryAll();
          expect(history).toHaveLength(2);
          expect(history[0].status).toBe("applied");
          expect(history[1].status).toBe("interviewing");
        },
      });
    });

    it("history entries have unique ids", async () => {
      await withFrozenTime({
        now: "2026-02-03T10:00:00Z",
        fn: async () => {
          const repo = createLocalApplicationsRepository(repoParams);
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

          const history = await repo.getHistoryAll();
          const ids = history.map(h => h.id);
          expect(new Set(ids).size).toBe(2);
          expect(ids[0]).not.toBe(created.id);
        },
      });
    });
  });

  describe("remove", () => {
    it("removes application by id", async () => {
      const repo = createLocalApplicationsRepository(repoParams);
      const created = await repo.create(baseApp);
      await repo.remove(created.id);
      expect(await repo.getAll()).toHaveLength(0);
    });

    it("only removes the specified application", async () => {
      const repo = createLocalApplicationsRepository(repoParams);
      const app1 = await repo.create(baseApp);
      const app2 = await repo.create({ ...baseApp, company: "Other Co" });
      await repo.remove(app1.id);

      const all = await repo.getAll();
      expect(all).toHaveLength(1);
      expect(all[0].id).toBe(app2.id);
    });

    it("persists removal to localStorage", async () => {
      const repo = createLocalApplicationsRepository(repoParams);
      const created = await repo.create(baseApp);
      await repo.remove(created.id);

      const stored = JSON.parse(
        localStorage.getItem(TEST_STORAGE_KEYS.APPLICATIONS)!,
      );
      expect(stored).toHaveLength(0);
    });

    it("throws when id does not exist", async () => {
      const repo = createLocalApplicationsRepository(repoParams);
      await expect(repo.remove("nonexistent")).rejects.toThrow("nonexistent");
    });

    it("snapshots final state to history with reason 'deleted'", async () => {
      await withFrozenTime({
        now: "2026-02-03T10:00:00Z",
        fn: async () => {
          const repo = createLocalApplicationsRepository(repoParams);
          const created = await repo.create(baseApp);

          await withFrozenTime({
            now: "2026-02-03T10:00:01Z",
            fn: async () => {
              await repo.remove(created.id);

              const history = await repo.getHistoryAll();
              expect(history).toHaveLength(1);
              expect(history[0].applicationId).toBe(created.id);
              expect(history[0].reason).toBe("deleted");
            },
          });
        },
      });
    });

    it("preserves history after removal", async () => {
      await withFrozenTime({
        now: "2026-02-03T10:00:00Z",
        fn: async () => {
          const repo = createLocalApplicationsRepository(repoParams);
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

          const history = await repo.getHistoryAll();
          expect(history).toHaveLength(2);
          expect(history[0].reason).toBe("updated");
          expect(history[1].reason).toBe("deleted");
        },
      });
    });
  });

  describe("getHistoryById", () => {
    it("returns history entries for a specific application", async () => {
      await withFrozenTime({
        now: "2026-02-03T10:00:00Z",
        fn: async () => {
          const repo = createLocalApplicationsRepository(repoParams);
          const app1 = await repo.create(baseApp);
          const app2 = await repo.create({ ...baseApp, company: "Other Co" });

          await withFrozenTime({
            now: "2026-02-03T10:00:01Z",
            fn: async () => {
              await repo.update(app1.id, { status: "interviewing" });
              await repo.update(app2.id, { status: "offer" });
            },
          });

          const history = await repo.getHistoryById(app1.id);
          expect(history).toHaveLength(1);
          expect(history[0].applicationId).toBe(app1.id);
        },
      });
    });

    it("returns empty array for application with no history", async () => {
      const repo = createLocalApplicationsRepository(repoParams);
      const created = await repo.create(baseApp);
      expect(await repo.getHistoryById(created.id)).toEqual([]);
    });

    it("returns empty array for nonexistent application id", async () => {
      const repo = createLocalApplicationsRepository(repoParams);
      expect(await repo.getHistoryById("nonexistent")).toEqual([]);
    });
  });

  describe("setState", () => {
    it("replaces all applications and history", async () => {
      const repo = createLocalApplicationsRepository(repoParams);
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

      await repo.setState({ applications: newApps, history: [] });

      expect(await repo.getAll()).toEqual(newApps);
      expect(await repo.getHistoryAll()).toEqual([]);
    });

    it("persists replacement to localStorage", async () => {
      const repo = createLocalApplicationsRepository(repoParams);
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

      await repo.setState({ applications: newApps, history: [] });

      const stored = JSON.parse(
        localStorage.getItem(TEST_STORAGE_KEYS.APPLICATIONS)!,
      );
      expect(stored).toEqual(newApps);
    });

    it("overwrites existing data", async () => {
      const repo = createLocalApplicationsRepository(repoParams);
      await repo.create(baseApp);
      await repo.create({ ...baseApp, company: "Other Co" });
      await repo.setState({ applications: [], history: [] });
      expect(await repo.getAll()).toHaveLength(0);
    });
  });

  describe("persistence across instances", () => {
    it("data written by one instance is read by another", async () => {
      const repo1 = createLocalApplicationsRepository(repoParams);
      const created = await repo1.create(baseApp);

      const repo2 = createLocalApplicationsRepository(repoParams);
      expect(await repo2.getById(created.id)).toEqual(created);
    });

    it("history written by one instance is visible in another", async () => {
      await withFrozenTime({
        now: "2026-02-03T10:00:00Z",
        fn: async () => {
          const repo1 = createLocalApplicationsRepository(repoParams);
          const created = await repo1.create(baseApp);

          await withFrozenTime({
            now: "2026-02-03T10:00:01Z",
            fn: async () => {
              await repo1.update(created.id, { status: "interviewing" });

              const repo2 = createLocalApplicationsRepository(repoParams);
              const history = await repo2.getHistoryById(created.id);
              expect(history).toHaveLength(1);
            },
          });
        },
      });
    });
  });
});
