// /src/composables/dashboard/use-applications-reports.test.ts

import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";

import { createMockApplication } from "@/test-utils/mocks";
import { withFrozenTime } from "@/test-utils/with-frozen-time";
import type { Application, ApplicationHistory } from "@/types";

import { usePeriodUnit } from ".";
import { useApplicationsReports } from "./use-applications-reports";

const mockApplications = ref<Application[]>([]);
const mockApplicationHistory = ref<ApplicationHistory[]>([]);

const mockCountByStatus = ref({});
const mockGetStatusChanges = vi.fn();
const mockGetApplicationTimeline = vi.fn();

vi.mock("@/composables/data", () => ({
  useApplications: () => ({
    applications: mockApplications,
    applicationHistory: mockApplicationHistory,
    countByStatus: mockCountByStatus,
    getStatusChanges: mockGetStatusChanges,
    getApplicationTimeline: mockGetApplicationTimeline,
  }),
}));

vi.mock("vue-router", () => ({
  useRoute: () => ({
    name: "test",
    query: {},
  }),
  useRouter: () => ({
    replace: vi.fn(), // 👈 THIS is what you're missing
  }),
}));

const app1 = createMockApplication({
  id: "app-1",
  company: "Acme Corp",
  status: "applied",
  createdAt: "2026-03-01T10:00:00Z",
  updatedAt: "2026-03-01T10:00:00Z",
});

const app2 = createMockApplication({
  id: "app-2",
  company: "Beta Inc",
  status: "interviewing",
  createdAt: "2026-03-08T10:00:00Z",
  updatedAt: "2026-03-10T10:00:00Z",
});

const app3 = createMockApplication({
  id: "app-3",
  company: "Gamma LLC",
  status: "rejected",
  createdAt: "2026-03-15T10:00:00Z",
  updatedAt: "2026-03-20T10:00:00Z",
});

const deletedHistory: ApplicationHistory[] = [
  {
    ...createMockApplication({
      id: "hist-1",
      company: "Deleted Co",
      status: "applied",
      createdAt: "2026-03-05T10:00:00Z",
      updatedAt: "2026-03-05T10:00:00Z",
    }),
    applicationId: "app-deleted-1",
    historyTimestamp: "2026-03-07T10:00:00Z",
    reason: "deleted",
  },
];

beforeEach(() => {
  mockApplications.value = [];
  mockApplicationHistory.value = [];
  mockCountByStatus.value = {};
  mockGetStatusChanges.mockReset();
  mockGetApplicationTimeline.mockReset();
});

// ============================================================================
// deletedApplications
// ============================================================================

describe("deletedApplications", () => {
  it("returns empty array when there is no history", () => {
    const { deletedApplications } = useApplicationsReports();
    expect(deletedApplications.value).toEqual([]);
  });

  it("returns the last snapshot of deleted applications", () => {
    mockApplicationHistory.value = deletedHistory;
    const { deletedApplications } = useApplicationsReports();
    expect(deletedApplications.value).toHaveLength(1);
    expect(deletedApplications.value[0].applicationId).toBe("app-deleted-1");
  });

  it("does not include history records for active applications", () => {
    mockApplications.value = [app1];
    mockApplicationHistory.value = [
      {
        ...app1,
        id: "hist-active-1",
        applicationId: app1.id,
        historyTimestamp: "2026-03-02T10:00:00Z",
        reason: "updated",
      },
    ];
    const { deletedApplications } = useApplicationsReports();
    expect(deletedApplications.value).toHaveLength(0);
  });
});

// ============================================================================
// statusCounts
// ============================================================================

describe("statusCounts", () => {
  it("reflects countByStatus from useApplications", () => {
    mockCountByStatus.value = { applied: 2, interviewing: 1 };
    const { statusCounts } = useApplicationsReports();
    expect(statusCounts.value).toEqual({ applied: 2, interviewing: 1 });
  });

  it("returns empty object when there are no applications", () => {
    const { statusCounts } = useApplicationsReports();
    expect(statusCounts.value).toEqual({});
  });
});

// ============================================================================
// volumeByPeriod
// ============================================================================

describe("volumeByPeriod", () => {
  beforeEach(() => {
    mockApplications.value = [app1, app2, app3];
    mockApplicationHistory.value = [];
  });

  it("groups applications by day by default", async () => {
    const { volumeByPeriod } = useApplicationsReports();
    expect(volumeByPeriod.value).toEqual([
      { label: "2026-03-01", count: 1 },
      { label: "2026-03-08", count: 1 },
      { label: "2026-03-15", count: 1 },
    ]);
  });

  it("groups applications by week", () => {
    const { volumeByPeriod } = useApplicationsReports();
    const { state: periodUnitState } = usePeriodUnit();

    periodUnitState.periodUnit = "week";
    // app1: 2026-03-01 (Sunday) → Monday 2026-02-23
    // app2: 2026-03-08 (Sunday) → Monday 2026-03-02
    // app3: 2026-03-15 (Sunday) → Monday 2026-03-09
    expect(volumeByPeriod.value).toEqual([
      { label: "2026-02-23", count: 1 },
      { label: "2026-03-02", count: 1 },
      { label: "2026-03-09", count: 1 },
    ]);
  });

  it("groups applications by month", () => {
    const { volumeByPeriod } = useApplicationsReports();
    const { state: periodUnitState } = usePeriodUnit();

    periodUnitState.periodUnit = "month";
    expect(volumeByPeriod.value).toEqual([{ label: "2026-03", count: 3 }]);
  });

  it("returns results sorted chronologically", () => {
    const { volumeByPeriod } = useApplicationsReports();
    const labels = volumeByPeriod.value.map(v => v.label);
    expect(labels).toEqual([...labels].sort());
  });

  it("includes deleted applications", () => {
    mockApplicationHistory.value = deletedHistory;
    const { volumeByPeriod } = useApplicationsReports();
    // app1, app2, app3 + deleted app on 2026-03-05
    expect(volumeByPeriod.value.reduce((sum, v) => sum + v.count, 0)).toBe(4);
  });

  it("returns empty array when there are no applications", () => {
    mockApplications.value = [];
    const { volumeByPeriod } = useApplicationsReports();
    expect(volumeByPeriod.value).toEqual([]);
  });
});

// ============================================================================
// statusReach
// ============================================================================

describe("statusReach", () => {
  it("returns empty object when there are no applications", () => {
    const { statusReach } = useApplicationsReports();
    expect(statusReach.value).toEqual({});
  });

  it("counts current status for applications with no history", () => {
    mockApplications.value = [app1];
    mockGetStatusChanges.mockReturnValue([]);
    const { statusReach } = useApplicationsReports();
    expect(statusReach.value).toEqual({ applied: 1 });
  });

  it("counts all statuses an application passed through", () => {
    mockApplications.value = [app2];
    mockGetStatusChanges.mockReturnValue([
      {
        from: "applied",
        to: "interviewing",
        timestamp: "2026-03-10T10:00:00Z",
      },
    ]);
    const { statusReach } = useApplicationsReports();
    expect(statusReach.value).toEqual({ applied: 1, interviewing: 1 });
  });

  it("does not double-count a status visited multiple times", () => {
    mockApplications.value = [app2];
    mockGetStatusChanges.mockReturnValue([
      {
        from: "applied",
        to: "interviewing",
        timestamp: "2026-03-10T10:00:00Z",
      },
      {
        from: "interviewing",
        to: "applied",
        timestamp: "2026-03-12T10:00:00Z",
      },
      {
        from: "applied",
        to: "interviewing",
        timestamp: "2026-03-14T10:00:00Z",
      },
    ]);
    const { statusReach } = useApplicationsReports();
    expect(statusReach.value).toEqual({ applied: 1, interviewing: 1 });
  });

  it("includes deleted applications", () => {
    mockApplications.value = [];
    mockApplicationHistory.value = deletedHistory;
    mockGetStatusChanges.mockReturnValue([]);
    const { statusReach } = useApplicationsReports();
    expect(statusReach.value).toEqual({ applied: 1 });
  });

  it("counts across multiple applications", () => {
    mockApplications.value = [app1, app2, app3];
    mockGetStatusChanges
      .mockReturnValueOnce([]) // app1
      .mockReturnValueOnce([
        {
          from: "applied",
          to: "interviewing",
          timestamp: "2026-03-10T10:00:00Z",
        },
      ]) // app2
      .mockReturnValueOnce([
        {
          from: "applied",
          to: "interviewing",
          timestamp: "2026-03-17T10:00:00Z",
        },
        {
          from: "interviewing",
          to: "rejected",
          timestamp: "2026-03-20T10:00:00Z",
        },
      ]); // app3
    const { statusReach } = useApplicationsReports();
    expect(statusReach.value).toEqual({
      applied: 3,
      interviewing: 2,
      rejected: 1,
    });
  });
});

// ============================================================================
// timeInStatus
// ============================================================================

describe("timeInStatus", () => {
  it("returns empty object when there are no applications", () => {
    const { timeInStatus } = useApplicationsReports();
    expect(timeInStatus.value).toEqual({});
  });

  it("calculates days in current status up to now for active applications", async () => {
    await withFrozenTime({
      now: "2026-03-11T10:00:00Z",
      fn: () => {
        mockApplications.value = [app1]; // applied 2026-03-01, still applied
        mockGetApplicationTimeline.mockReturnValue([app1]);
        const { timeInStatus } = useApplicationsReports();
        // 10 days from 2026-03-01 to 2026-03-11
        expect(timeInStatus.value.applied?.perApplication[0]).toEqual({
          id: "app-1",
          company: "Acme Corp",
          duration: 10,
        });
        expect(timeInStatus.value.applied?.average).toBe(10);
      },
    });
  });

  it("calculates days between status transitions", async () => {
    await withFrozenTime({
      now: "2026-03-20T10:00:00Z",
      fn: () => {
        const historyEntry: ApplicationHistory = {
          ...app2,
          id: "hist-app2-1",
          applicationId: app2.id,
          historyTimestamp: "2026-03-08T10:00:00Z",
          status: "applied",
          reason: "updated",
        };
        mockApplications.value = [app2];
        mockGetApplicationTimeline.mockReturnValue([historyEntry, app2]);
        const { timeInStatus } = useApplicationsReports();
        // applied for 2 days (2026-03-08 to 2026-03-10)
        expect(timeInStatus.value.applied?.perApplication[0].duration).toBe(2);
        // interviewing for 10 days (2026-03-10 to 2026-03-20)
        expect(
          timeInStatus.value.interviewing?.perApplication[0].duration,
        ).toBe(10);
      },
    });
  });

  it("uses deletion timestamp as exit time for deleted applications", async () => {
    await withFrozenTime({
      now: "2026-04-01T10:00:00Z",
      fn: () => {
        mockApplications.value = [];
        mockApplicationHistory.value = deletedHistory;
        // deleted app was applied 2026-03-05, deleted 2026-03-07 — 2 days
        mockGetApplicationTimeline.mockReturnValue([deletedHistory[0]]);
        const { timeInStatus } = useApplicationsReports();
        expect(timeInStatus.value.applied?.perApplication[0].duration).toBe(2);
      },
    });
  });

  it("averages duration across multiple applications in the same status", async () => {
    await withFrozenTime({
      now: "2026-03-15T10:00:00Z",
      fn: () => {
        // app1: applied 2026-03-01, still applied → 14 days
        // app3: applied 2026-03-15, still applied → 0 days
        const app3Applied = createMockApplication({
          id: "app-3",
          company: "Gamma LLC",
          status: "applied",
          createdAt: "2026-03-15T10:00:00Z",
          updatedAt: "2026-03-15T10:00:00Z",
        });
        mockApplications.value = [app1, app3Applied];
        mockGetApplicationTimeline
          .mockReturnValueOnce([app1])
          .mockReturnValueOnce([app3Applied]);
        const { timeInStatus } = useApplicationsReports();
        expect(timeInStatus.value.applied?.average).toBe(7); // (14 + 0) / 2
      },
    });
  });

  // Add to the timeInStatus describe block

  it("does not double-count duration for non-status-change snapshots", async () => {
    await withFrozenTime({
      now: "2026-03-11T10:00:00Z",
      fn: () => {
        // Two timeline entries with the same status — a note update archived before the real state
        const noteUpdateSnapshot: ApplicationHistory = {
          ...app1,
          id: "hist-app1-note",
          applicationId: app1.id,
          historyTimestamp: "2026-03-03T10:00:00Z",
          status: "applied",
          reason: "updated",
        };
        mockApplications.value = [app1];
        // Timeline: [noteUpdateSnapshot (applied), app1 (applied)]
        // Should only count one applied entry from createdAt to now
        mockGetApplicationTimeline.mockReturnValue([noteUpdateSnapshot, app1]);
        const { timeInStatus } = useApplicationsReports();
        // 10 days from 2026-03-01 to 2026-03-11 — not doubled
        expect(timeInStatus.value.applied?.perApplication[0].duration).toBe(10);
        expect(timeInStatus.value.applied?.perApplication).toHaveLength(1);
      },
    });
  });

  it("caps duration at updatedAt for terminal statuses", async () => {
    await withFrozenTime({
      now: "2026-04-10T10:00:00Z",
      fn: () => {
        const rejectedApp = createMockApplication({
          id: "app-rejected",
          company: "Rejected Co",
          status: "rejected",
          createdAt: "2026-03-01T10:00:00Z",
          updatedAt: "2026-03-10T10:00:00Z",
        });
        mockApplications.value = [rejectedApp];
        mockGetApplicationTimeline.mockReturnValue([rejectedApp]);
        const { timeInStatus } = useApplicationsReports();
        // Should be 9 days (2026-03-01 to 2026-03-10), not 40 days to now
        expect(timeInStatus.value.rejected?.perApplication[0].duration).toBe(9);
      },
    });
  });
});
