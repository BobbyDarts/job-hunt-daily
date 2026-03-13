// /src/composables/data/use-applications.test.ts

import { Temporal } from "@js-temporal/polyfill";
import { describe, it, expect, beforeEach } from "vitest";
import { nextTick } from "vue";

import { toInstant, toPlainDate } from "@/lib/time";
import { withFrozenTime } from "@/test-utils/with-frozen-time";
import type { Application, ApplicationHistory } from "@/types";

import {
  TEST_APPLICATIONS_HISTORY_STORAGE_KEY,
  TEST_APPLICATIONS_STORAGE_KEY,
} from "./keys";
import { useApplications } from "./use-applications";

describe("useApplications", () => {
  const useApplicationsParams = {
    storageKey: TEST_APPLICATIONS_STORAGE_KEY,
    historyStorageKey: TEST_APPLICATIONS_HISTORY_STORAGE_KEY,
  };

  beforeEach(() => {
    localStorage.clear();
  });

  describe("initialization", () => {
    it("starts with empty applications array", () => {
      const { applications, totalCount } = useApplications(
        useApplicationsParams,
      );

      expect(applications.value).toEqual([]);
      expect(totalCount.value).toBe(0);
    });

    it("loads existing applications from localStorage", async () => {
      const existingApps: Application[] = [
        {
          id: "app_1",
          company: "Acme Corp",
          position: "Developer",
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
        JSON.stringify(existingApps),
      );

      const { applications, totalCount } = useApplications(
        useApplicationsParams,
      );
      await nextTick();

      expect(applications.value).toEqual(existingApps);
      expect(totalCount.value).toBe(1);
    });
  });

  describe("addApplication", () => {
    it("adds a new application with generated id and timestamps", async () => {
      await withFrozenTime({
        now: "2026-02-03T10:00:00Z",
        fn: async () => {
          const { addApplication, applications } = useApplications(
            useApplicationsParams,
          );

          const newApp = await addApplication({
            company: "Tech Co",
            position: "Senior Dev",
            jobSiteId: "techco",
            jobSiteUrl: "https://techco.com",
            status: "applied",
            appliedDate: toPlainDate("2026-02-03").toString(),
          });

          expect(newApp.id).toBeDefined();
          expect(newApp.id).toMatch(/^app_/);
          expect(newApp.createdAt).toBeDefined();
          expect(newApp.updatedAt).toBeDefined();
          expect(newApp.company).toBe("Tech Co");
          expect(applications.value).toHaveLength(1);
          expect(applications.value[0]).toEqual(newApp);
        },
      });
    });

    it("adds application with optional fields", async () => {
      await withFrozenTime({
        now: "2026-02-03T10:00:00Z",
        fn: async () => {
          const { addApplication, applications } = useApplications(
            useApplicationsParams,
          );

          const newApp = await addApplication({
            company: "Tech Co",
            position: "Senior Dev",
            jobSiteId: "greenhouse-techco",
            jobSiteUrl: "https://techco.com",
            status: "interviewing",
            appliedDate: toPlainDate("2026-02-03").toString(),
            atsType: "greenhouse",
            tags: ["virtual", "technical"],
            notes: "Referred by John",
            followUpDate: "2026-02-10",
          });

          expect(newApp.atsType).toBe("greenhouse");
          expect(newApp.tags).toEqual(["virtual", "technical"]);
          expect(newApp.notes).toBe("Referred by John");
          expect(newApp.followUpDate).toBe("2026-02-10");
          expect(applications.value[0]).toEqual(newApp);
        },
      });
    });

    it("persists to localStorage", async () => {
      await withFrozenTime({
        now: "2026-02-03T10:00:00Z",
        fn: async () => {
          const { addApplication } = useApplications(useApplicationsParams);

          await addApplication({
            company: "Tech Co",
            position: "Senior Dev",
            jobSiteId: "techco",
            jobSiteUrl: "https://techco.com",
            status: "applied",
            appliedDate: toPlainDate("2026-02-03").toString(),
          });

          const stored = localStorage.getItem(TEST_APPLICATIONS_STORAGE_KEY);
          expect(stored).toBeDefined();
          const parsed = JSON.parse(stored!);
          expect(parsed).toHaveLength(1);
          expect(parsed[0].company).toBe("Tech Co");
        },
      });
    });

    it("generates unique IDs for multiple applications", async () => {
      await withFrozenTime({
        now: "2026-02-03T10:00:00Z",
        fn: async () => {
          const { addApplication } = useApplications(useApplicationsParams);

          const app1 = await addApplication({
            company: "Company A",
            position: "Dev",
            jobSiteId: "a",
            jobSiteUrl: "https://a.com",
            status: "applied",
            appliedDate: toPlainDate("2026-02-03").toString(),
          });

          const app2 = await addApplication({
            company: "Company B",
            position: "Dev",
            jobSiteId: "b",
            jobSiteUrl: "https://b.com",
            status: "applied",
            appliedDate: toPlainDate("2026-02-03").toString(),
          });

          expect(app1.id).not.toBe(app2.id);
        },
      });
    });
  });

  describe("updateApplication", () => {
    it("updates an existing application", async () => {
      await withFrozenTime({
        now: "2026-02-03T10:00:00Z",
        fn: async () => {
          const { addApplication, updateApplication, applications } =
            useApplications(useApplicationsParams);

          const app = await addApplication({
            company: "Tech Co",
            position: "Developer",
            jobSiteId: "techco",
            jobSiteUrl: "https://techco.com",
            status: "applied",
            appliedDate: toPlainDate("2026-02-03").toString(),
          });

          await withFrozenTime({
            now: "2026-02-03T10:00:01Z",
            fn: async () => {
              const updated = await updateApplication(app.id, {
                status: "interviewing",
                tags: ["virtual"],
              });

              expect(updated).toBeDefined();
              expect(updated?.status).toBe("interviewing");
              expect(updated?.tags).toEqual(["virtual"]);
              expect(updated?.company).toBe("Tech Co"); // Unchanged
              expect(updated?.updatedAt).not.toBe(app.updatedAt);
              expect(applications.value[0]).toEqual(updated);
            },
          });
        },
      });
    });

    it("returns undefined for non-existent application", async () => {
      const { updateApplication } = useApplications(useApplicationsParams);

      const result = await updateApplication("non-existent-id", {
        status: "interviewing",
      });

      expect(result).toBeUndefined();
    });

    it("updates updatedAt timestamp", async () => {
      await withFrozenTime({
        now: "2026-02-03T10:00:00Z",
        fn: async () => {
          const { addApplication, updateApplication } = useApplications(
            useApplicationsParams,
          );

          const app = await addApplication({
            company: "Tech Co",
            position: "Developer",
            jobSiteId: "techco",
            jobSiteUrl: "https://techco.com",
            status: "applied",
            appliedDate: toPlainDate("2026-02-03").toString(),
          });

          const originalUpdatedAt = app.updatedAt;

          await withFrozenTime({
            now: "2026-02-03T10:00:01Z",
            fn: async () => {
              const updated = await updateApplication(app.id, {
                notes: "Added notes",
              });

              expect(updated?.updatedAt).not.toBe(originalUpdatedAt);
            },
          });
        },
      });
    });

    it("does not change createdAt timestamp", async () => {
      await withFrozenTime({
        now: "2026-02-03T10:00:00Z",
        fn: async () => {
          const { addApplication, updateApplication } = useApplications(
            useApplicationsParams,
          );

          const app = await addApplication({
            company: "Tech Co",
            position: "Developer",
            jobSiteId: "techco",
            jobSiteUrl: "https://techco.com",
            status: "applied",
            appliedDate: toPlainDate("2026-02-03").toString(),
          });

          const originalCreatedAt = app.createdAt;

          const updated = await updateApplication(app.id, {
            status: "interviewing",
          });

          expect(updated?.createdAt).toBe(originalCreatedAt);
        },
      });
    });
  });

  describe("deleteApplication", () => {
    it("deletes an application by id", async () => {
      const { addApplication, deleteApplication, applications } =
        useApplications(useApplicationsParams);

      const app = await addApplication({
        company: "Tech Co",
        position: "Developer",
        jobSiteId: "techco",
        jobSiteUrl: "https://techco.com",
        status: "applied",
        appliedDate: toPlainDate("2026-02-03").toString(),
      });

      const deleted = await deleteApplication(app.id);

      expect(deleted).toBe(true);
      expect(applications.value).toHaveLength(0);
    });

    it("returns false for non-existent application", async () => {
      const { deleteApplication } = useApplications(useApplicationsParams);

      const deleted = await deleteApplication("non-existent-id");

      expect(deleted).toBe(false);
    });

    it("only deletes the specified application", async () => {
      const { addApplication, deleteApplication, applications } =
        useApplications(useApplicationsParams);

      const app1 = await addApplication({
        company: "Company A",
        position: "Dev",
        jobSiteId: "a",
        jobSiteUrl: "https://a.com",
        status: "applied",
        appliedDate: toPlainDate("2026-02-03").toString(),
      });

      const app2 = await addApplication({
        company: "Company B",
        position: "Dev",
        jobSiteId: "b",
        jobSiteUrl: "https://b.com",
        status: "applied",
        appliedDate: toPlainDate("2026-02-03").toString(),
      });

      await deleteApplication(app1.id);

      expect(applications.value).toHaveLength(1);
      expect(applications.value[0].id).toBe(app2.id);
    });
  });

  describe("getApplication", () => {
    it("retrieves an application by id", async () => {
      const { addApplication, getApplication } = useApplications(
        useApplicationsParams,
      );

      const app = await addApplication({
        company: "Tech Co",
        position: "Developer",
        jobSiteId: "techco",
        jobSiteUrl: "https://techco.com",
        status: "applied",
        appliedDate: toPlainDate("2026-02-03").toString(),
      });

      const retrieved = getApplication(app.id);

      expect(retrieved).toEqual(app);
    });

    it("returns undefined for non-existent id", () => {
      const { getApplication } = useApplications(useApplicationsParams);

      const result = getApplication("non-existent-id");

      expect(result).toBeUndefined();
    });
  });

  describe("countByStatus", () => {
    it("counts applications by status", async () => {
      const { addApplication, countByStatus } = useApplications(
        useApplicationsParams,
      );

      await addApplication({
        company: "Company A",
        position: "Dev",
        jobSiteId: "a",
        jobSiteUrl: "https://a.com",
        status: "applied",
        appliedDate: toPlainDate("2026-02-03").toString(),
      });

      await addApplication({
        company: "Company B",
        position: "Dev",
        jobSiteId: "b",
        jobSiteUrl: "https://b.com",
        status: "applied",
        appliedDate: toPlainDate("2026-02-03").toString(),
      });

      await addApplication({
        company: "Company C",
        position: "Dev",
        jobSiteId: "c",
        jobSiteUrl: "https://c.com",
        status: "interviewing",
        appliedDate: toPlainDate("2026-02-03").toString(),
      });

      expect(countByStatus.value.applied).toBe(2);
      expect(countByStatus.value.interviewing).toBe(1);
      expect(countByStatus.value.offer).toBeUndefined();
    });

    it("returns empty object when no applications", () => {
      const { countByStatus } = useApplications(useApplicationsParams);

      expect(countByStatus.value).toEqual({});
    });
  });

  describe("filterByStatus", () => {
    it("filters applications by status", async () => {
      const { addApplication, filterByStatus } = useApplications(
        useApplicationsParams,
      );

      await addApplication({
        company: "Company A",
        position: "Dev",
        jobSiteId: "a",
        jobSiteUrl: "https://a.com",
        status: "applied",
        appliedDate: toPlainDate("2026-02-03").toString(),
      });

      await addApplication({
        company: "Company B",
        position: "Dev",
        jobSiteId: "b",
        jobSiteUrl: "https://b.com",
        status: "interviewing",
        appliedDate: toPlainDate("2026-02-03").toString(),
      });

      const applied = filterByStatus("applied");
      const interviewing = filterByStatus("interviewing");
      const offers = filterByStatus("offer");

      expect(applied).toHaveLength(1);
      expect(applied[0].company).toBe("Company A");
      expect(interviewing).toHaveLength(1);
      expect(interviewing[0].company).toBe("Company B");
      expect(offers).toHaveLength(0);
    });
  });

  describe("filterByTag", () => {
    it("filters applications by tag", async () => {
      const { addApplication, filterByTag } = useApplications(
        useApplicationsParams,
      );

      await addApplication({
        company: "Company A",
        position: "Dev",
        jobSiteId: "a",
        jobSiteUrl: "https://a.com",
        status: "applied",
        appliedDate: toPlainDate("2026-02-03").toString(),
        tags: ["virtual", "behavioral"],
      });

      await addApplication({
        company: "Company B",
        position: "Dev",
        jobSiteId: "b",
        jobSiteUrl: "https://b.com",
        status: "applied",
        appliedDate: toPlainDate("2026-02-03").toString(),
        tags: ["offer_negotiation"],
      });

      const virtual = filterByTag("virtual");
      const offerNegotiation = filterByTag("offer_negotiation");
      const technical = filterByTag("technical");

      expect(virtual).toHaveLength(1);
      expect(virtual[0].company).toBe("Company A");
      expect(offerNegotiation).toHaveLength(1);
      expect(offerNegotiation[0].company).toBe("Company B");
      expect(technical).toHaveLength(0);
    });

    it("returns empty array for applications without tags", async () => {
      const { addApplication, filterByTag } = useApplications(
        useApplicationsParams,
      );

      await addApplication({
        company: "Company A",
        position: "Dev",
        jobSiteId: "a",
        jobSiteUrl: "https://a.com",
        status: "applied",
        appliedDate: toPlainDate("2026-02-03").toString(),
      });

      const results = filterByTag("onsite");

      expect(results).toHaveLength(0);
    });
  });

  describe("search", () => {
    it("searches by company name", async () => {
      const { addApplication, search } = useApplications(useApplicationsParams);

      await addApplication({
        company: "Google",
        position: "Developer",
        jobSiteId: "google",
        jobSiteUrl: "https://google.com",
        status: "applied",
        appliedDate: toPlainDate("2026-02-03").toString(),
      });

      await addApplication({
        company: "Amazon",
        position: "Developer",
        jobSiteId: "amazon",
        jobSiteUrl: "https://amazon.com",
        status: "applied",
        appliedDate: toPlainDate("2026-02-03").toString(),
      });

      const results = search("goo");

      expect(results).toHaveLength(1);
      expect(results[0].company).toBe("Google");
    });

    it("searches by position", async () => {
      const { addApplication, search } = useApplications(useApplicationsParams);

      await addApplication({
        company: "Company A",
        position: "Senior Developer",
        jobSiteId: "a",
        jobSiteUrl: "https://a.com",
        status: "applied",
        appliedDate: toPlainDate("2026-02-03").toString(),
      });

      await addApplication({
        company: "Company B",
        position: "Junior Designer",
        jobSiteId: "b",
        jobSiteUrl: "https://b.com",
        status: "applied",
        appliedDate: toPlainDate("2026-02-03").toString(),
      });

      const results = search("developer");

      expect(results).toHaveLength(1);
      expect(results[0].position).toBe("Senior Developer");
    });

    it("is case-insensitive", async () => {
      const { addApplication, search } = useApplications(useApplicationsParams);

      await addApplication({
        company: "Google",
        position: "Developer",
        jobSiteId: "google",
        jobSiteUrl: "https://google.com",
        status: "applied",
        appliedDate: toPlainDate("2026-02-03").toString(),
      });

      const results = search("GOOGLE");

      expect(results).toHaveLength(1);
    });

    it("returns empty array when no matches", async () => {
      const { addApplication, search } = useApplications(useApplicationsParams);

      await addApplication({
        company: "Google",
        position: "Developer",
        jobSiteId: "google",
        jobSiteUrl: "https://google.com",
        status: "applied",
        appliedDate: toPlainDate("2026-02-03").toString(),
      });

      const results = search("nonexistent");

      expect(results).toHaveLength(0);
    });
  });

  describe("history tracking", () => {
    describe("getApplicationTimeline", () => {
      it("returns empty array for non-existent application", () => {
        const { getApplicationTimeline } = useApplications(
          useApplicationsParams,
        );

        const timeline = getApplicationTimeline("non-existent-id");

        expect(timeline).toEqual([]);
      });

      it("returns only current application when no history exists", async () => {
        await withFrozenTime({
          now: "2024-01-15T10:00:00Z",
          fn: async () => {
            const { addApplication, getApplicationTimeline } = useApplications(
              useApplicationsParams,
            );

            const app = await addApplication({
              company: "Test Co",
              position: "Developer",
              jobSiteId: "test-site",
              jobSiteUrl: "https://test.com",
              appliedDate: toPlainDate("2024-01-15").toString(),
              status: "applied",
            });

            const timeline = getApplicationTimeline(app.id);

            expect(timeline).toHaveLength(1);
            expect(timeline[0]).toEqual(app);
          },
        });
      });

      it("returns chronological timeline with history and current state", async () => {
        await withFrozenTime({
          now: "2024-01-15T10:00:00Z",
          fn: async () => {
            const {
              addApplication,
              updateApplication,
              getApplicationTimeline,
            } = useApplications(useApplicationsParams);

            const app = await addApplication({
              company: "Test Co",
              position: "Developer",
              jobSiteId: "test-site",
              jobSiteUrl: "https://test.com",
              appliedDate: toPlainDate("2024-01-15").toString(),
              status: "applied",
            });

            // Advance time manually by setting frozen time for each update
            await withFrozenTime({
              now: "2024-01-15T10:00:01Z",
              fn: async () =>
                await updateApplication(app.id, { status: "interviewing" }),
            });

            await withFrozenTime({
              now: "2024-01-15T10:00:02Z",
              fn: async () =>
                await updateApplication(app.id, { status: "offer" }),
            });

            const timeline = getApplicationTimeline(app.id);

            expect(timeline).toHaveLength(3);
            expect(timeline[0].status).toBe("applied");
            expect(timeline[1].status).toBe("interviewing");
            expect(timeline[2].status).toBe("offer");
          },
        });
      });

      it("sorts history entries by timestamp", async () => {
        function getTimelineInstant(item: Application | ApplicationHistory) {
          return toInstant(
            "historyTimestamp" in item ? item.historyTimestamp : item.updatedAt,
          );
        }

        await withFrozenTime({
          now: "2024-01-15T10:00:00Z",
          fn: async () => {
            const {
              addApplication,
              updateApplication,
              getApplicationTimeline,
            } = useApplications(useApplicationsParams);

            const app = await addApplication({
              company: "Test Co",
              position: "Developer",
              jobSiteId: "test-site",
              jobSiteUrl: "https://test.com",
              appliedDate: toPlainDate("2024-01-15").toString(),
              status: "applied",
            });

            await withFrozenTime({
              now: "2024-01-16T10:00:01Z",
              fn: async () =>
                await updateApplication(app.id, { status: "interviewing" }),
            });

            await withFrozenTime({
              now: "2024-01-17T10:00:02Z",
              fn: async () =>
                await updateApplication(app.id, { notes: "Updated notes" }),
            });

            await withFrozenTime({
              now: "2024-01-18T10:00:03Z",
              fn: async () =>
                await updateApplication(app.id, { status: "offer" }),
            });

            const timeline = getApplicationTimeline(app.id);
            expect(timeline).toHaveLength(4);

            const sorted = [...timeline].sort((a, b) =>
              Temporal.Instant.compare(
                getTimelineInstant(a),
                getTimelineInstant(b),
              ),
            );

            expect(timeline).toEqual(sorted);
          },
        });
      });

      it("includes all application fields in history snapshots", async () => {
        await withFrozenTime({
          now: "2024-01-15T10:00:00Z",
          fn: async () => {
            const {
              addApplication,
              updateApplication,
              getApplicationTimeline,
            } = useApplications(useApplicationsParams);

            const app = await addApplication({
              company: "Test Co",
              position: "Developer",
              jobSiteId: "test-site",
              jobSiteUrl: "https://test.com",
              appliedDate: toPlainDate("2024-01-15").toString(),
              status: "applied",
              tags: ["behavioral"],
              notes: "Initial notes",
            });

            await withFrozenTime({
              now: "2024-01-16T10:00:00Z",
              fn: async () => {
                await updateApplication(app.id, {
                  status: "interviewing",
                });
              },
            });

            const timeline = getApplicationTimeline(app.id);
            const historySnapshot = timeline[0];

            expect(historySnapshot.company).toBe("Test Co");
            expect(historySnapshot.position).toBe("Developer");
            expect(historySnapshot.tags).toEqual(["behavioral"]);
            expect(historySnapshot.notes).toBe("Initial notes");
          },
        });
      });
    });

    describe("getStatusChanges", () => {
      it("returns empty array when application has no status changes", async () => {
        await withFrozenTime({
          now: "2024-01-15T10:00:00Z",
          fn: async () => {
            const { addApplication, getStatusChanges } = useApplications(
              useApplicationsParams,
            );

            const app = await addApplication({
              company: "Test Co",
              position: "Developer",
              jobSiteId: "test-site",
              jobSiteUrl: "https://test.com",
              appliedDate: toPlainDate("2024-01-15").toString(),
              status: "applied",
            });

            const changes = getStatusChanges(app.id);
            expect(changes).toEqual([]);
          },
        });
      });

      it("tracks single status change", async () => {
        await withFrozenTime({
          now: "2024-01-15T10:00:00Z",
          fn: async () => {
            const { addApplication, updateApplication, getStatusChanges } =
              useApplications(useApplicationsParams);

            const app = await addApplication({
              company: "Test Co",
              position: "Developer",
              jobSiteId: "test-site",
              jobSiteUrl: "https://test.com",
              appliedDate: toPlainDate("2024-01-15").toString(),
              status: "applied",
            });

            await withFrozenTime({
              now: "2024-01-15T10:00:01Z",
              fn: async () => {
                await updateApplication(app.id, { status: "interviewing" });
              },
            });
            const changes = getStatusChanges(app.id);

            expect(changes).toHaveLength(1);
            expect(changes[0]).toMatchObject({
              from: "applied",
              to: "interviewing",
            });
            expect(changes[0].timestamp).toBeDefined();
          },
        });
      });

      it("tracks multiple status changes in order", async () => {
        await withFrozenTime({
          now: "2024-01-15T10:00:00Z",
          fn: async () => {
            const { addApplication, updateApplication, getStatusChanges } =
              useApplications(useApplicationsParams);

            const app = await addApplication({
              company: "Test Co",
              position: "Developer",
              jobSiteId: "test-site",
              jobSiteUrl: "https://test.com",
              appliedDate: toPlainDate("2024-01-15").toString(),
              status: "applied",
            });

            await withFrozenTime({
              now: "2024-01-15T10:00:01Z",
              fn: async () => {
                await updateApplication(app.id, { status: "interviewing" });
              },
            });
            await withFrozenTime({
              now: "2024-01-15T10:00:02Z",
              fn: async () => {
                await updateApplication(app.id, { status: "offer" });
              },
            });

            await withFrozenTime({
              now: "2024-01-15T10:00:03Z",
              fn: async () => {
                await updateApplication(app.id, { status: "accepted" });
              },
            });

            const changes = getStatusChanges(app.id);
            expect(changes).toHaveLength(3);
            expect(changes[0]).toMatchObject({
              from: "applied",
              to: "interviewing",
            });
            expect(changes[1]).toMatchObject({
              from: "interviewing",
              to: "offer",
            });
            expect(changes[2]).toMatchObject({ from: "offer", to: "accepted" });
          },
        });
      });

      it("ignores updates that don't change status", async () => {
        await withFrozenTime({
          now: "2024-01-15T10:00:00Z",
          fn: async () => {
            const { addApplication, updateApplication, getStatusChanges } =
              useApplications(useApplicationsParams);

            const app = await addApplication({
              company: "Test Co",
              position: "Developer",
              jobSiteId: "test-site",
              jobSiteUrl: "https://test.com",
              appliedDate: toPlainDate("2024-01-15").toString(),
              status: "applied",
            });

            await withFrozenTime({
              now: "2024-01-15T10:00:01Z",
              fn: async () => {
                await updateApplication(app.id, { notes: "Added notes" });
              },
            });

            await withFrozenTime({
              now: "2024-01-15T10:00:02Z",
              fn: async () => {
                await updateApplication(app.id, { tags: ["behavioral"] });
              },
            });

            await withFrozenTime({
              now: "2024-01-15T10:00:03Z",
              fn: async () => {
                await updateApplication(app.id, { status: "interviewing" });
              },
            });

            const changes = getStatusChanges(app.id);
            expect(changes).toHaveLength(1);
            expect(changes[0]).toMatchObject({
              from: "applied",
              to: "interviewing",
            });
          },
        });
      });

      it("handles rapid status changes", async () => {
        await withFrozenTime({
          now: "2024-01-15T10:00:00Z",
          fn: async () => {
            const { addApplication, updateApplication, getStatusChanges } =
              useApplications(useApplicationsParams);

            const app = await addApplication({
              company: "Test Co",
              position: "Developer",
              jobSiteId: "test-site",
              jobSiteUrl: "https://test.com",
              appliedDate: toPlainDate("2024-01-15").toString(),
              status: "applied",
            });

            await withFrozenTime({
              now: "2024-01-15T10:00:01Z",
              fn: async () => {
                await updateApplication(app.id, { status: "interviewing" });
              },
            });

            await withFrozenTime({
              now: "2024-01-15T10:00:02Z",
              fn: async () => {
                await updateApplication(app.id, { status: "offer" });
              },
            });

            await withFrozenTime({
              now: "2024-01-15T10:00:03Z",
              fn: async () => {
                await updateApplication(app.id, { status: "rejected" });
              },
            });

            const changes = getStatusChanges(app.id);
            expect(changes).toHaveLength(3);
            expect(changes[0].from).toBe("applied");
            expect(changes[1].from).toBe("interviewing");
            expect(changes[2].from).toBe("offer");
            expect(changes[2].to).toBe("rejected");
          },
        });
      });

      it("handles status reverting to previous value", async () => {
        await withFrozenTime({
          now: "2024-01-15T10:00:00Z",
          fn: async () => {
            const { addApplication, updateApplication, getStatusChanges } =
              useApplications(useApplicationsParams);

            const app = await addApplication({
              company: "Test Co",
              position: "Developer",
              jobSiteId: "test-site",
              jobSiteUrl: "https://test.com",
              appliedDate: toPlainDate("2024-01-15").toString(),
              status: "applied",
            });

            await withFrozenTime({
              now: "2024-01-15T10:00:01Z",
              fn: async () => {
                await updateApplication(app.id, { status: "interviewing" });
              },
            });

            await withFrozenTime({
              now: "2024-01-15T10:00:02Z",
              fn: async () => {
                await updateApplication(app.id, { status: "applied" }); // Revert
              },
            });

            const changes = getStatusChanges(app.id);
            expect(changes).toHaveLength(2);
            expect(changes[0]).toMatchObject({
              from: "applied",
              to: "interviewing",
            });
            expect(changes[1]).toMatchObject({
              from: "interviewing",
              to: "applied",
            });
          },
        });
      });
    });

    describe("history persistence", () => {
      it("persists history across composable instances", async () => {
        await withFrozenTime({
          now: "2024-01-15T10:00:00Z",
          fn: async () => {
            const { addApplication, updateApplication } = useApplications(
              useApplicationsParams,
            );

            const app = await addApplication({
              company: "Test Co",
              position: "Developer",
              jobSiteId: "test-site",
              jobSiteUrl: "https://test.com",
              appliedDate: toPlainDate("2024-01-15").toString(),
              status: "applied",
            });

            await withFrozenTime({
              now: "2024-01-15T10:00:01Z",
              fn: async () => {
                await updateApplication(app.id, { status: "interviewing" });
              },
            });

            const { getApplicationTimeline: getTimeline2 } = useApplications(
              useApplicationsParams,
            );
            await nextTick();

            const timeline = getTimeline2(app.id);
            expect(timeline).toHaveLength(2);
          },
        });
      });

      it("maintains history after deleting application", async () => {
        await withFrozenTime({
          now: "2024-01-15T10:00:00Z",
          fn: async () => {
            const {
              addApplication,
              updateApplication,
              deleteApplication,
              applicationHistory,
            } = useApplications(useApplicationsParams);

            const app = await addApplication({
              company: "Test Co",
              position: "Developer",
              jobSiteId: "test-site",
              jobSiteUrl: "https://test.com",
              appliedDate: toPlainDate("2024-01-15").toString(),
              status: "applied",
            });

            await withFrozenTime({
              now: "2024-01-15T10:00:01Z",
              fn: async () => {
                await updateApplication(app.id, { status: "interviewing" });
              },
            });

            const historyCountBefore = applicationHistory.value.filter(
              h => h.applicationId === app.id,
            ).length;

            await deleteApplication(app.id);

            const historyCountAfter = applicationHistory.value.filter(
              h => h.applicationId === app.id,
            ).length;

            expect(historyCountAfter).toBe(historyCountBefore + 1);
          },
        });
      });
    });
  });
});
