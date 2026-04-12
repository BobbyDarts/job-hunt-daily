<!-- // /src/views/reports/ApplicationStatusCounts.vue -->

<script setup lang="ts">
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  type TooltipItem,
} from "chart.js";
import { computed } from "vue";
import { Doughnut } from "vue-chartjs";

import { useApplicationsReports } from "@/composables/dashboard";
import { getStatusChartColor, resolveChartColor } from "@/lib/chart-utils";
import { getStatuses } from "@/types";

ChartJS.register(Title, Tooltip, Legend, ArcElement);

const { statusCounts } = useApplicationsReports();

const statusInfo = getStatuses();
const PIPELINE_ORDER = statusInfo.map(s => s.status);

const chartData = computed(() => {
  const statuses = PIPELINE_ORDER.filter(s => (statusCounts.value[s] ?? 0) > 0);

  return {
    labels: statuses.map(s => statusInfo.find(st => st.status === s)!.label),
    datasets: [
      {
        data: statuses.map(s => statusCounts.value[s] ?? 0),
        backgroundColor: statuses.map(s =>
          resolveChartColor(getStatusChartColor(s)),
        ),
        borderWidth: 0,
        hoverOffset: 6,
      },
    ],
  };
});

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  cutout: "65%",
  plugins: {
    legend: {
      position: "right" as const,
      labels: {
        boxWidth: 12,
        padding: 16,
      },
    },
    tooltip: {
      callbacks: {
        label: (context: TooltipItem<"doughnut">) => {
          const count = context.parsed ?? 0;
          const total = (context.dataset.data as number[]).reduce(
            (sum, v) => sum + v,
            0,
          );
          const pct = Math.round((count / total) * 100);
          return ` ${count} application${count === 1 ? "" : "s"} (${pct}%)`;
        },
      },
    },
  },
}));

const totalCount = computed(() =>
  Object.values(statusCounts.value).reduce((sum, v) => sum + (v ?? 0), 0),
);

const isEmpty = computed(() => totalCount.value === 0);
</script>

<template>
  <div>
    <div class="mb-4">
      <h2 class="text-lg font-semibold">Status Counts</h2>
      <p class="text-sm text-muted-foreground">
        Current distribution of applications across pipeline stages.
      </p>
    </div>

    <div
      v-if="isEmpty"
      class="flex flex-col items-center justify-center py-16 text-center"
    >
      <p class="text-sm font-medium mb-1">No applications yet</p>
      <p class="text-sm text-muted-foreground">
        Add applications to see your pipeline distribution.
      </p>
    </div>

    <div v-else class="rounded-lg border bg-card p-4" style="height: 320px">
      <Doughnut :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>
