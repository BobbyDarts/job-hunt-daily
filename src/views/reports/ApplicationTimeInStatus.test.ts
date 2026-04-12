// /src/views/reports/ApplicationTimeInStatus.test.ts

import { screen, waitFor } from "@testing-library/vue";
import { describe, it, expect, vi } from "vitest";
import { ref } from "vue";

import { renderBaseWithProviders } from "@/test-utils/render-base";

import ApplicationTimeInStatus from "./ApplicationTimeInStatus.vue";

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

const mockTimeInStatus = ref<Record<string, unknown>>({
  applied: {
    average: 5,
    perApplication: [{ id: "1", company: "Acme", duration: 5 }],
  },
});

vi.mock("@/composables/dashboard", () => ({
  useApplicationsReports: () => ({ timeInStatus: mockTimeInStatus }),
}));

describe("ApplicationTimeInStatus", () => {
  it("renders the title and description", async () => {
    mockTimeInStatus.value = {
      applied: {
        average: 5,
        perApplication: [{ id: "1", company: "Acme", duration: 5 }],
      },
    };
    renderBaseWithProviders(ApplicationTimeInStatus, {}, {});

    await waitFor(() => {
      expect(screen.getByText("Time in Status")).toBeInTheDocument();
      expect(
        screen.getByText(/average days spent in each status/i),
      ).toBeInTheDocument();
    });
  });

  it("renders empty state when there is no history", async () => {
    mockTimeInStatus.value = {};
    renderBaseWithProviders(ApplicationTimeInStatus, {}, {});

    await waitFor(() => {
      expect(screen.getByText("No data yet")).toBeInTheDocument();
    });
  });
});
