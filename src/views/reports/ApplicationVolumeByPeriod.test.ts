// /src/views/reports/ApplicationVolumeByPeriod.test.ts

import { screen, waitFor } from "@testing-library/vue";
import { describe, it, expect, vi } from "vitest";
import { ref } from "vue";

import { renderBaseWithProviders } from "@/test-utils/render-base";

import ApplicationVolumeByPeriod from "./ApplicationVolumeByPeriod.vue";

vi.mock("chart.js", () => ({
  Chart: { register: vi.fn() },
  Title: {},
  Tooltip: {},
  Legend: {},
  BarElement: {},
  CategoryScale: {},
  LinearScale: {},
}));

vi.mock("vue-chartjs", () => ({
  Bar: { template: `<canvas />` },
}));

const mockVolumeByPeriod = ref([{ label: "2026-03-01", count: 2 }]);

vi.mock("@/composables/dashboard", () => ({
  useApplicationsReports: () => ({ volumeByPeriod: mockVolumeByPeriod }),
  usePeriodUnit: () => ({ state: { periodUnit: "day" } }),
  useReportTimeRange: () => ({ state: { timeRange: "all" } }),
}));

describe("ApplicationVolumeByPeriod", () => {
  it("renders the title and description", async () => {
    mockVolumeByPeriod.value = [{ label: "2026-03-01", count: 2 }];
    renderBaseWithProviders(ApplicationVolumeByPeriod, {}, {});

    await waitFor(() => {
      expect(screen.getByText("Volume by Period")).toBeInTheDocument();
      expect(
        screen.getByText(/number of applications submitted over time/i),
      ).toBeInTheDocument();
    });
  });

  it("renders empty state when there is no data for the period", async () => {
    mockVolumeByPeriod.value = [];
    renderBaseWithProviders(ApplicationVolumeByPeriod, {}, {});

    await waitFor(() => {
      expect(screen.getByText("No data for this period")).toBeInTheDocument();
    });
  });
});
