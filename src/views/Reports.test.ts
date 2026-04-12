// /src/views/Reports.test.ts

import { screen, waitFor } from "@testing-library/vue";
import { describe, it, expect, vi } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

import { renderBaseWithProviders } from "@/test-utils/render-base";

import Reports from "./Reports.vue";

vi.mock("@/composables/dashboard", () => ({
  usePeriodUnit: () => ({
    state: { periodUnit: "day" },
  }),
  useReportTimeRange: () => ({
    state: { timeRange: "30d" },
    TIME_RANGES: [
      { value: "7d", label: "7 days" },
      { value: "30d", label: "30 days" },
      { value: "90d", label: "90 days" },
      { value: "all", label: "All time" },
    ],
  }),
}));

vi.mock("@/components/app/lib", () => ({
  DataToolbar: {
    template: `<div><slot name="back" /><slot name="title" /><slot name="actions" /><slot name="filters" /><slot name="stats" /></div>`,
    props: ["hasActiveFilters"],
  },
}));

vi.mock("./reports", () => ({
  ApplicationStatusCounts: { template: `<div>Status Counts</div>` },
  ApplicationVolumeByPeriod: { template: `<div>Volume by Period</div>` },
  ApplicationStatusReach: { template: `<div>Status Reach</div>` },
  ApplicationTimeInStatus: { template: `<div>Time in Status</div>` },
}));

const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: "/reports", name: "Reports", component: Reports }],
});

describe("Reports", () => {
  it("renders without crashing", async () => {
    await router.push("/reports");
    await router.isReady();

    renderBaseWithProviders(Reports, {}, {}, { plugins: [router] });

    await waitFor(() => {
      expect(screen.getByText("Reports")).toBeInTheDocument();
    });
  });

  it("renders the report selector with all four reports", async () => {
    await router.push("/reports");
    await router.isReady();

    renderBaseWithProviders(Reports, {}, {}, { plugins: [router] });

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Status Counts" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Volume by Period" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Status Reach" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Time in Status" }),
      ).toBeInTheDocument();
    });
  });

  it("renders the default report component on load", async () => {
    await router.push("/reports");
    await router.isReady();

    renderBaseWithProviders(Reports, {}, {}, { plugins: [router] });

    await waitFor(() => {
      expect(screen.getAllByText("Status Counts")).toHaveLength(2); // button + component
    });
  });

  it("renders the correct report when query param is set", async () => {
    await router.push("/reports?report=time-in-status");
    await router.isReady();

    renderBaseWithProviders(Reports, {}, {}, { plugins: [router] });

    await waitFor(() => {
      expect(screen.getAllByText("Time in Status")).toHaveLength(2); // button + component
    });
  });

  it("renders back button", async () => {
    await router.push("/reports");
    await router.isReady();

    renderBaseWithProviders(Reports, {}, {}, { plugins: [router] });

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /back to home/i }),
      ).toBeInTheDocument();
    });
  });
});
