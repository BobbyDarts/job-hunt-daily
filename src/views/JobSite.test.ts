// /src/views/JobSites.test.ts

import { screen, waitFor } from "@testing-library/vue";
import { describe, it, expect, vi } from "vitest";
import { ref } from "vue";
import { createMemoryHistory, createRouter } from "vue-router";

import { renderBaseWithProviders } from "@/test-utils/render-base";

import JobSites from "./JobSites.vue";

vi.mock("@/composables/tables", () => ({
  useJobSiteTable: () => ({
    table: {
      getCoreRowModel: () => ({ rows: [] }),
      getFilteredRowModel: () => ({ rows: [] }),
      getHeaderGroups: () => [],
      getRowModel: () => ({ rows: [] }),
      getAllColumns: () => [],
    },
    filters: { search: "", category: "all", ats: "all" },
    hasActiveFilters: ref(false),
    clear: vi.fn(),
    siteToDelete: ref(null),
    isDeleteDialogOpen: ref(false),
    confirmDelete: vi.fn(),
    handleDelete: vi.fn(),
    selectedSite: ref(null),
    isEditDialogOpen: ref(false),
    handleEdit: vi.fn(),
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
  DeleteConfirmDialog: {
    template: `<div />`,
    props: ["open", "title", "description"],
  },
  DataTable: { template: `<div />`, props: ["table"] },
  DataToolbar: {
    template: `<div><slot name="back" /><slot name="title" /><slot name="actions" /><slot name="filters" /><slot name="stats" /></div>`,
    props: ["hasActiveFilters", "total", "filtered"],
  },
}));

const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: "/job-sites", name: "JobSites", component: JobSites }],
});

describe("JobSites", () => {
  it("renders without crashing", async () => {
    await router.push("/job-sites");
    await router.isReady();

    renderBaseWithProviders(JobSites, {}, {}, { plugins: [router] });

    await waitFor(() => {
      expect(screen.getByText("Job Sites")).toBeInTheDocument();
    });
  });
});
