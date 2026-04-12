// /src/composables/dashboard/use-report-time-range.ts

import { reactive } from "vue";

import { useQuerySync } from "@/composables/lib";

export type TimeRange = "7d" | "30d" | "90d" | "all";

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "all", label: "All time" },
];

const VALID_TIME_RANGES = new Set<TimeRange>(["7d", "30d", "90d", "all"]);

const state = reactive<{ timeRange: TimeRange }>({ timeRange: "30d" });

export function useReportTimeRange() {
  useQuerySync({
    state,
    toQuery: s => ({
      ...(s.timeRange !== "30d" ? { range: s.timeRange } : {}),
    }),
    fromQuery: q => {
      const raw = Array.isArray(q.range) ? q.range[0] : q.range;
      return {
        timeRange: VALID_TIME_RANGES.has(raw as TimeRange)
          ? (raw as TimeRange)
          : "30d",
      };
    },
  });

  return {
    state,
    TIME_RANGES,
  };
}
