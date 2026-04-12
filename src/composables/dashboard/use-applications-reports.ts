// /src/composables/dashboard/use-applications-reports.ts

import { computed } from "vue";

import { useApplications } from "@/composables/data";
import {
  compareInstants,
  getNow,
  getTimeZoneId,
  toInstant,
  toPeriodKey,
} from "@/lib/time";
import {
  getStatusInfo,
  type ApplicationHistory,
  type ApplicationStatus,
} from "@/types";

import { usePeriodUnit } from ".";

interface AveragePerApplication {
  average: number;
  perApplication: { id: string; company: string; duration: number }[];
}

export type TimeInStatus = Partial<
  Record<ApplicationStatus, AveragePerApplication>
>;

/**
 * Provides derived analytics data for the application pipeline, intended for
 * use in the /reports view. All computeds read from `useApplications` and
 * `applicationHistory` — no storage keys or persistence logic live here.
 *
 * @example
 * const { statusCounts, volumeByPeriod, statusReach, timeInStatus } =
 *   useApplicationsReports();
 */
export function useApplicationsReports() {
  const { state: periodUnitState } = usePeriodUnit();
  const {
    countByStatus,
    applications,
    applicationHistory,
    getStatusChanges,
    getApplicationTimeline,
  } = useApplications();

  const deletedApplications = computed(() => {
    const activeIds = new Set(applications.value.map(a => a.id));
    const deletedIds = new Set(
      applicationHistory.value
        .filter(h => h.reason === "deleted" && !activeIds.has(h.applicationId))
        .map(h => h.applicationId),
    );

    return [...deletedIds].map(id => {
      const snapshots = applicationHistory.value
        .filter(h => h.applicationId === id)
        .sort((a, b) =>
          compareInstants(a.historyTimestamp, b.historyTimestamp),
        );
      return snapshots[snapshots.length - 1];
    });
  });

  const volumeByPeriod = computed(() => {
    const periods = new Map<string, number>();

    for (const app of [...applications.value, ...deletedApplications.value]) {
      const key = toPeriodKey(app.createdAt, periodUnitState.periodUnit);
      periods.set(key, (periods.get(key) ?? 0) + 1);
    }

    return Array.from(periods.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([label, count]) => ({ label, count }));
  });

  const statusReach = computed(() => {
    const reach: Partial<Record<ApplicationStatus, number>> = {};

    for (const app of [...applications.value, ...deletedApplications.value]) {
      const statuses = new Set([
        app.status,
        ...getStatusChanges(app.id).flatMap(({ from, to }) => [from, to]),
      ]);

      for (const status of statuses) {
        reach[status] = (reach[status] ?? 0) + 1;
      }
    }

    return reach;
  });

  const timeInStatus = computed((): TimeInStatus => {
    const buckets: Record<
      string,
      { id: string; company: string; duration: number }[]
    > = {};

    for (const app of [...applications.value, ...deletedApplications.value]) {
      const timeline = getApplicationTimeline(app.id);

      let lastSeenStatus: ApplicationStatus | null = null;

      for (let i = 0; i < timeline.length; i++) {
        const entry = timeline[i];

        if (entry.status === lastSeenStatus) continue;
        lastSeenStatus = entry.status;

        const enteredAt =
          i === 0
            ? toInstant(entry.createdAt)
            : toInstant(
                "historyTimestamp" in entry
                  ? entry.historyTimestamp
                  : entry.updatedAt,
              );

        // Find the next entry with a different status — non-status-change updates
        // (e.g. note edits) create duplicate status snapshots which we skip.
        const nextDifferentEntry = timeline
          .slice(i + 1)
          .find(e => e.status !== entry.status);

        const isLastEntry = nextDifferentEntry === undefined;

        const isDeleted =
          isLastEntry &&
          "historyTimestamp" in timeline[timeline.length - 1] &&
          (timeline[timeline.length - 1] as ApplicationHistory).reason ===
            "deleted";

        const isTerminal =
          isLastEntry && !!getStatusInfo(entry.status).terminal;

        const exitedAt = !isLastEntry
          ? toInstant(
              "historyTimestamp" in nextDifferentEntry!
                ? (nextDifferentEntry as ApplicationHistory).historyTimestamp
                : nextDifferentEntry!.updatedAt,
            )
          : isDeleted
            ? toInstant(
                (timeline[timeline.length - 1] as ApplicationHistory)
                  .historyTimestamp,
              )
            : isTerminal
              ? toInstant(entry.updatedAt)
              : getNow();

        const days = enteredAt
          .toZonedDateTimeISO(getTimeZoneId())
          .until(exitedAt.toZonedDateTimeISO(getTimeZoneId()), {
            largestUnit: "days",
          }).days;

        if (!buckets[entry.status]) buckets[entry.status] = [];
        buckets[entry.status].push({
          id: app.id,
          company: app.company,
          duration: days,
        });
      }
    }

    const result: TimeInStatus = {};
    for (const [status, entries] of Object.entries(buckets)) {
      const average =
        entries.reduce((sum, e) => sum + e.duration, 0) / entries.length;
      result[status as ApplicationStatus] = {
        average,
        perApplication: entries,
      };
    }

    return result;
  });

  return {
    /**
     * The last known snapshot of each deleted application, reconstructed from
     * history records. Used to include deleted applications in pipeline reports
     * so that withdrawals and rejections don't silently skew the data.
     */
    deletedApplications,

    /** Current count of applications grouped by status. */
    statusCounts: countByStatus,

    /**
     * Applications grouped and counted by creation date, bucketed according to
     * `periodUnit`. Returns an array of `{ label, count }` pairs sorted
     * chronologically, ready for use in a bar or line chart.
     */
    volumeByPeriod,

    /**
     * The number of applications that reached each status at any point in their
     * history, derived from history snapshots. Unlike `statusCounts`, this reflects
     * lifetime progression rather than current state.
     */
    statusReach,

    /**
     * Average and per-application duration spent in each status, derived from
     * history snapshots. Useful for identifying stages where applications stall.
     */
    timeInStatus,
  };
}
