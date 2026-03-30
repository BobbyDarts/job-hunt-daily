// /src/composables/tables/use-category-table.ts

import { computed, reactive, ref, watch } from "vue";
import { toast } from "vue-sonner";

import { createCategoryColumns, type CategoryRow } from "@/components/app/lib";
import { useJobSites } from "@/composables/data";
import { useDataTable, useQuerySync, useToolbarState } from "@/composables/lib";
import { useAddJobSiteDialog } from "@/composables/ui";
import type { JobCategory } from "@/types";

export function useCategoryTable() {
  type CategoryFilters = {
    category: string | "all";
  };

  // composables
  const { categories, getSitesByCategory, deleteCategory } = useJobSites();
  const { openDialog: openAddJobSite } = useAddJobSiteDialog();

  // reactive filters
  const filters = reactive<CategoryFilters>({ category: "all" });

  const data = computed<CategoryRow[]>(() =>
    categories.value.map(
      c =>
        ({
          id: c.id,
          name: c.name,
          description: c.description ?? "",
        }) as CategoryRow,
    ),
  );

  // -----------------------------
  // Delete/Edit dialogs
  // -----------------------------
  const categoryToDelete = ref<CategoryRow | null>(null);
  const isDeleteDialogOpen = ref(false);
  const selectedCategory = ref<JobCategory | null>(null);
  const isEditDialogOpen = ref(false);

  function confirmDelete(category: CategoryRow) {
    if (getSitesByCategory(category.id).length > 0) {
      toast.error("Cannot delete category with sites");
      return;
    }
    categoryToDelete.value = category;
    isDeleteDialogOpen.value = true;
  }

  async function handleDelete() {
    if (!categoryToDelete.value) return;

    const deleted = await deleteCategory(categoryToDelete.value.id);
    if (deleted) {
      toast.success("Category deleted successfully");
    } else {
      toast.error("Failed to delete category");
    }
  }

  function handleEdit(category: CategoryRow) {
    const full = categories.value.find(c => c.id === category.id);
    selectedCategory.value = full ?? null;
    isEditDialogOpen.value = true;
  }

  // -----------------------------
  // Table columns & instance
  // -----------------------------
  const columns = createCategoryColumns({
    onAddSite: openAddJobSite,
    onEdit: handleEdit,
    onDelete: confirmDelete,
    getSitesByCategory,
  });

  const { table, columnFilters } = useDataTable<CategoryRow>({
    data,
    columns,
    meta: {},
  });

  // -----------------------------
  // Filters → table adapter
  // -----------------------------
  watch(
    filters,
    f => {
      const next: { id: string; value: string }[] = [];
      if (f.category !== "all") next.push({ id: "id", value: f.category });
      columnFilters.value = next;
    },
    { deep: true, immediate: true },
  );

  // -----------------------------
  // Sync filters with URL
  // -----------------------------
  useQuerySync({
    state: filters,
    toQuery: f => {
      const q: Record<string, string> = {};
      if (f.category && f.category !== "all") q.category = f.category;
      return q;
    },
    fromQuery: q => ({
      category:
        (Array.isArray(q.category) ? q.category[0] : q.category) ?? "all",
    }),
  });

  const { hasActiveFilters, clear } = useToolbarState(filters);

  return {
    table,
    filters,
    hasActiveFilters,
    clear,
    // Delete dialog
    categoryToDelete,
    isDeleteDialogOpen,
    confirmDelete,
    handleDelete,
    // Edit dialog
    selectedCategory,
    isEditDialogOpen,
    handleEdit,
  };
}
