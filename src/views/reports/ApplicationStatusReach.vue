<!-- // /src/views/reports/ApplicationStatusReach.vue -->

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
import { getStatuses } from "@/types";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
);

const { statusReach } = useApplicationsReports();

const statusInfo = getStatuses();
const PIPELINE_ORDER = statusInfo.map(s => s.status);

const chartData = computed(() => {
  const statuses = PIPELINE_ORDER.filter(s => (statusReach.value[s] ?? 0) > 0);

  return {
    labels: statuses.map(s => statusInfo.find(st => st.status === s)!.label),
    datasets: [
      {
        label: "Applications Reached",
        data: statuses.map(s => statusReach.value[s] ?? 0),
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
          const count = context.parsed.x ?? 0;
          return ` ${count} application${count === 1 ? "" : "s"}`;
        },
      },
    },
  },
  scales: {
    x: {
      beginAtZero: true,
      ticks: {
        stepSize: 1,
        callback: (value: number | string) => `${value}`,
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

const isEmpty = computed(() => Object.keys(statusReach.value).length === 0);
</script>

<template>
  <div>
    <div class="mb-4">
      <h2 class="text-lg font-semibold">Status Reach</h2>
      <p class="text-sm text-muted-foreground">
        Number of applications that reached each status at any point in their
        history.
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
