// /src/views/Categories.test.ts

import { screen, waitFor } from "@testing-library/vue";
import { describe, it, expect, vi } from "vitest";
import { ref } from "vue";
import { createMemoryHistory, createRouter } from "vue-router";

import { renderBaseWithProviders } from "@/test-utils/render-base";

import Categories from "./Categories.vue";

vi.mock("@/composables/tables", () => ({
  useCategoryTable: () => ({
    table: {
      getCoreRowModel: () => ({ rows: [] }),
      getFilteredRowModel: () => ({ rows: [] }),
      getHeaderGroups: () => [],
      getRowModel: () => ({ rows: [] }),
      getAllColumns: () => [],
    },
    filters: { category: "all" },
    hasActiveFilters: ref(false),
    clear: vi.fn(),
    categoryToDelete: ref(null),
    isDeleteDialogOpen: ref(false),
    confirmDelete: vi.fn(),
    handleDelete: vi.fn(),
    selectedCategory: ref(null),
    isEditDialogOpen: ref(false),
    handleEdit: vi.fn(),
  }),
}));

vi.mock("@/composables/ui", () => ({
  useAddCategoryDialog: () => ({ openDialog: vi.fn() }),
}));

vi.mock("@/components/app/sites", () => ({
  EditCategoryDialog: { template: `<div />`, props: ["open", "category"] },
}));

vi.mock("@/components/app/lib", () => ({
  CategorySelect: { template: `<div />`, props: ["modelValue"] },
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
  routes: [{ path: "/categories", name: "Categories", component: Categories }],
});

describe("Categories", () => {
  it("renders without crashing", async () => {
    await router.push("/categories");
    await router.isReady();

    renderBaseWithProviders(Categories, {}, {}, { plugins: [router] });

    await waitFor(() => {
      expect(screen.getByText("Categories")).toBeInTheDocument();
    });
  });
});
