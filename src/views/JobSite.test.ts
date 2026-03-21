// /src/views/JobSites.test.ts

import { screen, waitFor } from "@testing-library/vue";
import { describe, it, expect, vi } from "vitest";
import { ref } from "vue";
import { createMemoryHistory, createRouter } from "vue-router";

import { renderBaseWithProviders } from "@/test-utils/render-base";

import JobSites from "./JobSites.vue";

vi.mock("@/composables/data", () => ({
  useJobSites: () => ({
    allSitesWithCategory: ref([]),
    deleteSite: vi.fn(),
  }),
}));

vi.mock("@/composables/ui", () => ({
  useAddJobSiteDialog: () => ({ openDialog: vi.fn() }),
}));

vi.mock("@/components/app/sites", () => ({
  ATSAvatar: { template: `<div />` },
  EditJobSiteDialog: { template: `<div />`, props: ["open", "site"] },
}));

vi.mock("@/components/app/lib", () => ({
  CategorySelect: { template: `<div />`, props: ["modelValue"] },
  ATSSelect: { template: `<div />`, props: ["modelValue"] },
}));

const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: "/job-sites", name: "JobSites", component: JobSites }],
});

describe("JobSites", () => {
  it("renders without crashing", async () => {
    renderBaseWithProviders(JobSites, {}, {}, { plugins: [router] });

    await waitFor(() => {
      expect(screen.getByText("Job Sites")).toBeInTheDocument();
    });
  });
});
