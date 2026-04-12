// /src/views/reports/ApplicationStatusReach.test.ts

import { screen, waitFor } from "@testing-library/vue";
import { describe, it, expect, vi } from "vitest";
import { ref } from "vue";

import { renderBaseWithProviders } from "@/test-utils/render-base";

import ApplicationStatusReach from "./ApplicationStatusReach.vue";

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

const mockStatusReach = ref<Record<string, number>>({ applied: 3 });

vi.mock("@/composables/dashboard", () => ({
  useApplicationsReports: () => ({ statusReach: mockStatusReach }),
}));

describe("ApplicationStatusReach", () => {
  it("renders the title and description", async () => {
    mockStatusReach.value = { applied: 3 };

    renderBaseWithProviders(ApplicationStatusReach, {}, {});

    await waitFor(() => {
      expect(screen.getByText("Status Reach")).toBeInTheDocument();
      expect(
        screen.getByText(/number of applications that reached each status/i),
      ).toBeInTheDocument();
    });
  });

  it("renders empty state when there is no history", async () => {
    mockStatusReach.value = {};

    renderBaseWithProviders(ApplicationStatusReach, {}, {});

    await waitFor(() => {
      expect(screen.getByText("No data yet")).toBeInTheDocument();
    });
  });
});
