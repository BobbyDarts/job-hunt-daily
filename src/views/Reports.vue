<!-- /src/views/Reports.vue -->

<script setup lang="ts">
import { ArrowLeft } from "@lucide/vue";
import { reactive, computed } from "vue";
import { useRouter } from "vue-router";

import { DataToolbar } from "@/components/app/lib";
import { Button } from "@/components/ui/button";
import { usePeriodUnit, useReportTimeRange } from "@/composables/dashboard";
import { useQuerySync } from "@/composables/lib";

import {
  ApplicationStatusCounts,
  ApplicationStatusReach,
  ApplicationTimeInStatus,
  ApplicationVolumeByPeriod,
} from "./reports";

type ReportId =
  | "status-counts"
  | "volume-by-period"
  | "status-reach"
  | "time-in-status";

const REPORTS: { id: ReportId; label: string }[] = [
  { id: "status-counts", label: "Status Counts" },
  { id: "volume-by-period", label: "Volume by Period" },
  { id: "status-reach", label: "Status Reach" },
  { id: "time-in-status", label: "Time in Status" },
];

const REPORT_COMPONENTS: Record<ReportId, unknown> = {
  "status-counts": ApplicationStatusCounts,
  "volume-by-period": ApplicationVolumeByPeriod,
  "status-reach": ApplicationStatusReach,
  "time-in-status": ApplicationTimeInStatus,
};

const VALID_REPORT_IDS = new Set<ReportId>(REPORTS.map(r => r.id));

const router = useRouter();

const filters = reactive<{ report: ReportId }>({
  report: "status-counts",
});

const { state: periodUnitState } = usePeriodUnit();
const { state: timeRangeState, TIME_RANGES } = useReportTimeRange();

useQuerySync({
  state: filters,
  toQuery: f => ({
    report: f.report !== "status-counts" ? f.report : undefined,
    ...(f.report !== "volume-by-period"
      ? { range: undefined, period: undefined }
      : {}),
  }),
  fromQuery: q => {
    const raw = Array.isArray(q.report) ? q.report[0] : q.report;
    return {
      report: VALID_REPORT_IDS.has(raw as ReportId)
        ? (raw as ReportId)
        : "status-counts",
    };
  },
});

const activeComponent = computed(() => REPORT_COMPONENTS[filters.report]);
</script>

<template>
  <!-- Page Header -->
  <div class="border-b bg-card">
    <div class="mx-auto px-4 py-3 max-w-7xl">
      <DataToolbar>
        <template #back>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Back to home"
            @click="router.push('/')"
          >
            <ArrowLeft class="size-4" />
          </Button>
        </template>

        <template #title>
          <h1 class="text-xl font-semibold">Reports</h1>
        </template>

        <template #actions>
          <div
            class="flex items-center gap-1 rounded-lg border bg-background p-1"
          >
            <Button
              v-for="report in REPORTS"
              :key="report.id"
              variant="ghost"
              size="sm"
              class="h-7 px-3 text-sm"
              :class="{
                'bg-muted text-foreground': filters.report === report.id,
                'text-muted-foreground': filters.report !== report.id,
              }"
              @click="filters.report = report.id"
            >
              {{ report.label }}
            </Button>
          </div>
        </template>

        <template #filters>
          <div
            v-if="filters.report === 'volume-by-period'"
            class="flex items-center gap-2 h-9"
          >
            <!-- Period unit selector -->
            <div
              class="flex items-center gap-1 rounded-lg border bg-background p-1"
            >
              <Button
                v-for="unit in ['day', 'week', 'month'] as const"
                :key="unit"
                variant="ghost"
                size="sm"
                class="h-7 px-3 text-sm capitalize"
                :class="{
                  'bg-muted text-foreground':
                    periodUnitState.periodUnit === unit,
                  'text-muted-foreground': periodUnitState.periodUnit !== unit,
                }"
                @click="periodUnitState.periodUnit = unit"
              >
                {{ unit }}
              </Button>
            </div>

            <!-- Time range selector -->
            <div
              class="flex items-center gap-1 rounded-lg border bg-background p-1"
            >
              <Button
                v-for="range in TIME_RANGES"
                :key="range.value"
                variant="ghost"
                size="sm"
                class="h-7 px-3 text-sm"
                :class="{
                  'bg-muted text-foreground':
                    timeRangeState.timeRange === range.value,
                  'text-muted-foreground':
                    timeRangeState.timeRange !== range.value,
                }"
                @click="timeRangeState.timeRange = range.value"
              >
                {{ range.label }}
              </Button>
            </div>
          </div>
          <div v-else class="h-9" />
        </template>
      </DataToolbar>
    </div>
  </div>

  <!-- Report Content -->
  <div class="mx-auto px-4 pt-6 max-w-7xl">
    <component :is="activeComponent" />
  </div>
</template>
