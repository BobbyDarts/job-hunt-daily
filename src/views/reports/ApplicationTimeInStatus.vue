<!-- // /src/views/reports/ApplicationTimeInStatus.vue -->

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

import { useApplicationsReports } from "@/composables/dashboard";
import { getStatusChartColor, resolveChartColor } from "@/lib/chart-utils";
import { getStatuses, getStatusInfo } from "@/types";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
);

const { timeInStatus } = useApplicationsReports();

const statusInfo = getStatuses();
const PIPELINE_ORDER = statusInfo.map(s => s.status);

const chartData = computed(() => {
  const statuses = PIPELINE_ORDER.filter(
    s => timeInStatus.value[s] !== undefined && !getStatusInfo(s).terminal,
  );

  return {
    labels: statuses.map(s => statusInfo.find(st => st.status === s)!.label),
    datasets: [
      {
        label: "Avg. Days in Status",
        data: statuses.map(s => timeInStatus.value[s]?.average ?? 0),
        backgroundColor: statuses.map(s =>
          resolveChartColor(getStatusChartColor(s)),
        ),
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };
});

const chartOptions = computed(() => ({
  indexAxis: "y" as const,
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: (context: TooltipItem<"bar">) => {
          const days = Number((context.parsed.x ?? 0).toFixed(1));
          return ` ${days} day${days === 1 ? "" : "s"}`;
        },
        afterBody: (contexts: TooltipItem<"bar">[]) => {
          const context = contexts[0];
          const statuses = PIPELINE_ORDER.filter(
            s => timeInStatus.value[s] !== undefined,
          );
          const status = statuses[context.dataIndex];
          const entries = timeInStatus.value[status]?.perApplication ?? [];
          return entries.map(e => ` ${e.company}: ${e.duration}d`);
        },
      },
    },
  },
  scales: {
    x: {
      beginAtZero: true,
      ticks: {
        callback: (value: number | string) => `${value}d`,
      },
      grid: {
        color: "var(--border)",
      },
    },
    y: {
      grid: {
        display: false,
      },
    },
  },
}));

const isEmpty = computed(() => Object.keys(timeInStatus.value).length === 0);
</script>

<template>
  <div>
    <div class="mb-4">
      <h2 class="text-lg font-semibold">Time in Status</h2>
      <p class="text-sm text-muted-foreground">
        Average days spent in each status across all applications.
      </p>
    </div>

    <div
      v-if="isEmpty"
      class="flex flex-col items-center justify-center py-16 text-center"
    >
      <p class="text-sm font-medium mb-1">No data yet</p>
      <p class="text-sm text-muted-foreground">
        Application history will appear here once you start tracking.
      </p>
    </div>

    <div v-else class="rounded-lg border bg-card p-4" style="height: 320px">
      <Bar :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>
