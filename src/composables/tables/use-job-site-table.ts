// /src/composables/tables/use-job-site-table.ts

import { computed, reactive, ref, watch } from "vue";
import { toast } from "vue-sonner";

import { createJobSiteColumns, type JobSiteRow } from "@/components/app/lib";
import { useJobSites } from "@/composables/data";
import { useDataTable, useQuerySync, useToolbarState } from "@/composables/lib";
import type { ATSType, JobSite } from "@/types";

export function useJobSiteTable() {
  type JobSiteFilters = {
    search: string;
    category: string | "all";
    ats: ATSType | "all" | "";
  };

  // composables
  const { allSitesWithCategory, deleteSite } = useJobSites();

  // reactive filters
  const filters = reactive<JobSiteFilters>({
    search: "",
    category: "all",
    ats: "all",
  });
  const { hasActiveFilters, clear } = useToolbarState(filters);

  const data = computed<JobSiteRow[]>(() =>
    allSitesWithCategory.value.map(site => ({
      id: site.id,
      name: site.name,
      url: site.url,
      category: site.category,
      categoryId: site.categoryId,
      atsType: site.atsType ?? "",
      notes: site.notes,
    })),
  );

  // -----------------------------
  // Delete/Edit dialogs
  // -----------------------------
  const siteToDelete = ref<JobSiteRow | null>(null);
  const isDeleteDialogOpen = ref(false);
  const selectedSite = ref<JobSite | null>(null);
  const isEditDialogOpen = ref(false);

  function confirmDelete(site: JobSiteRow) {
    siteToDelete.value = site;
    isDeleteDialogOpen.value = true;
  }

  async function handleDelete() {
    if (!siteToDelete.value) return;
    const deleted = await deleteSite(siteToDelete.value.id);
    if (deleted) toast.success("Site deleted successfully");
    else toast.error("Failed to delete site");
    siteToDelete.value = null;
  }

  function handleEdit(site: JobSiteRow) {
    selectedSite.value =
      allSitesWithCategory.value.find(s => s.id === site.id) ?? null;
    isEditDialogOpen.value = true;
  }

  // -----------------------------
  // Table columns & instance
  // -----------------------------
  const columns = createJobSiteColumns({
    onEdit: handleEdit,
    onDelete: confirmDelete,
  });

  const { table, columnFilters, globalFilter } = useDataTable<JobSiteRow>({
    data,
    columns,
    meta: {},
    columnVisibility: { categoryId: false },
    globalFilterFn: (row, _columnId, filterValue) => {
      const q = String(filterValue ?? "").toLowerCase();

      return (
        row.original.name.toLowerCase().includes(q) ||
        row.original.url.toLowerCase().includes(q)
      );
    },
  });

  // -----------------------------
  // Filters → table adapter
  // -----------------------------
  watch(
    filters,
    f => {
      globalFilter.value = f.search;

      const next: { id: string; value: string }[] = [];

      if (f.category !== "all")
        next.push({ id: "categoryId", value: f.category });
      if (f.ats && f.ats !== "all") next.push({ id: "atsType", value: f.ats });

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
      if (f.search) q.search = f.search;
      if (f.category && f.category !== "all") q.category = f.category;
      if (f.ats && f.ats !== "all") q.ats = f.ats;
      return q;
    },

    fromQuery: q => {
      const rawAts = Array.isArray(q.ats) ? q.ats[0] : q.ats;

      return {
        search: (Array.isArray(q.search) ? q.search[0] : q.search) ?? "",
        category:
          (Array.isArray(q.category) ? q.category[0] : q.category) ?? "all",
        // if rawAts is undefined/null, default to "all"
        ats: (rawAts ?? "all") as ATSType | "all" | "",
      };
    },
  });

  return {
    table,
    filters,
    globalFilter,
    hasActiveFilters,
    clear,
    // Delete dialog
    siteToDelete,
    isDeleteDialogOpen,
    confirmDelete,
    handleDelete,
    // Edit dialog
    selectedSite,
    isEditDialogOpen,
    handleEdit,
  };
}
