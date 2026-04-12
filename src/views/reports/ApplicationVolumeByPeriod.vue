<!-- // /src/views/reports/ApplicationVolumeByPeriod.vue -->

<script setup lang="ts">
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  type TooltipItem,
} from "chart.js";
import { computed } from "vue";
import { Bar } from "vue-chartjs";

import {
  useApplicationsReports,
  usePeriodUnit,
  useReportTimeRange,
} from "@/composables/dashboard";
import type { TimeRange } from "@/composables/dashboard";
import { resolveChartColor } from "@/lib/chart-utils";
import { getToday, toPeriodKey } from "@/lib/time";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
);

const { volumeByPeriod } = useApplicationsReports();
const { state: periodUnitState } = usePeriodUnit();
const { state: timeRangeState } = useReportTimeRange();

function getRangeStart(range: TimeRange): string | null {
  const today = getToday();
  switch (range) {
    case "7d":
      return today.subtract({ days: 7 }).toString();
    case "30d":
      return today.subtract({ days: 30 }).toString();
    case "90d":
      return today.subtract({ days: 90 }).toString();
    case "all":
      return null;
  }
}

const filteredVolume = computed(() => {
  const rangeStart = getRangeStart(timeRangeState.timeRange);
  if (!rangeStart) return volumeByPeriod.value;

  const startKey = toPeriodKey(
    `${rangeStart}T00:00:00Z`,
    periodUnitState.periodUnit,
  );

  return volumeByPeriod.value.filter(({ label }) => label >= startKey);
});

const primaryColor = computed(() => resolveChartColor("var(--chart-1)"));

const chartData = computed(() => ({
  labels: filteredVolume.value.map(v => v.label),
  datasets: [
    {
      label: "Applications",
      data: filteredVolume.value.map(v => v.count),
      backgroundColor: primaryColor.value,
      borderRadius: 4,
      borderSkipped: false,
    },
  ],
}));

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: (context: TooltipItem<"bar">) => {
          const count = context.parsed.y ?? 0;
          return ` ${count} application${count === 1 ? "" : "s"}`;
        },
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
    },
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1,
        callback: (value: number | string) => `${value}`,
      },
      grid: {
        color: "var(--border)",
      },
    },
  },
}));

const isEmpty = computed(() => filteredVolume.value.length === 0);
</script>

<template>
  <div>
    <div class="mb-4">
      <h2 class="text-lg font-semibold">Volume by Period</h2>
      <p class="text-sm text-muted-foreground">
        Number of applications submitted over time.
      </p>
    </div>

    <div
      v-if="isEmpty"
      class="flex flex-col items-center justify-center py-16 text-center"
    >
      <p class="text-sm font-medium mb-1">No data for this period</p>
      <p class="text-sm text-muted-foreground">
        Try expanding the time range or adding applications.
      </p>
    </div>

    <div v-else class="rounded-lg border bg-card p-4" style="height: 320px">
      <Bar :data="chartData" :options="chartOptions" />
    </div>
  </div>

  <!-- Controls exposed via teleport-like pattern — parent slots these in -->
  <template v-if="false">
    <!-- period and range selectors rendered by Reports.vue via props -->
  </template>
</template>
