// /src/views/reports/ApplicationStatusCounts.test.ts

import { screen, waitFor } from "@testing-library/vue";
import { describe, it, expect, vi } from "vitest";
import { ref } from "vue";

import { renderBaseWithProviders } from "@/test-utils/render-base";

import ApplicationStatusCounts from "./ApplicationStatusCounts.vue";

vi.mock("chart.js", () => ({
  Chart: { register: vi.fn() },
  Title: {},
  Tooltip: {},
  Legend: {},
  ArcElement: {},
}));

vi.mock("vue-chartjs", () => ({
  Doughnut: { template: `<canvas />` },
}));

const mockStatusCounts = ref<Record<string, number>>({
  applied: 2,
  interviewing: 1,
});

vi.mock("@/composables/dashboard", () => ({
  useApplicationsReports: () => ({
    statusCounts: mockStatusCounts,
  }),
}));

describe("ApplicationStatusCounts", () => {
  it("renders the title and description", async () => {
    mockStatusCounts.value = {
      applied: 2,
      interviewing: 1,
    };
    renderBaseWithProviders(ApplicationStatusCounts, {}, {});

    await waitFor(() => {
      expect(screen.getByText("Status Counts")).toBeInTheDocument();
      expect(
        screen.getByText(/current distribution of applications/i),
      ).toBeInTheDocument();
    });
  });

  it("renders empty state when there are no applications", async () => {
    mockStatusCounts.value = {};

    renderBaseWithProviders(ApplicationStatusCounts, {}, {});

    await waitFor(() => {
      expect(screen.getByText("No applications yet")).toBeInTheDocument();
    });
  });
});
