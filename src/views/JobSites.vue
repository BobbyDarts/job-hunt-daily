<!-- // /src/views/JobSites.vue -->

<script setup lang="ts">
import {
  FlexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useVueTable,
  createColumnHelper,
  type ColumnFiltersState,
  type SortingState,
} from "@tanstack/vue-table";
import {
  ArrowLeft,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  X,
  Pencil,
  Trash2,
  ExternalLink,
  Plus,
} from "lucide-vue-next";
import { computed, h, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { toast } from "vue-sonner";

import {
  DeleteConfirmDialog,
  CategorySelect,
  ATSSelect,
} from "@/components/app/lib";
import { ATSAvatar, EditJobSiteDialog } from "@/components/app/sites";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useJobSites } from "@/composables/data";
import { useAddJobSiteDialog } from "@/composables/ui";
import { getATSInfo } from "@/lib/ats-detection";
import type { ATSType, JobSite } from "@/types";

const router = useRouter();
const route = useRoute();

const { allSitesWithCategory, deleteSite } = useJobSites();
const { openDialog: openAddJobSite } = useAddJobSiteDialog();

// -------------------------
// Table data shape
// -------------------------

interface SiteRow {
  id: string;
  name: string;
  url: string;
  category: string;
  categoryId: string;
  atsType: string;
  notes?: string;
}

const tableData = computed<SiteRow[]>(() =>
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

// -------------------------
// Filter state
// -------------------------

const globalFilter = ref("");
const columnFilters = ref<ColumnFiltersState>([]);
const sorting = ref<SortingState>([{ id: "category", desc: false }]);

const activeCategoryFilter = computed({
  get: () =>
    (columnFilters.value.find(f => f.id === "categoryId")?.value as string) ??
    "all",
  set: (value: string | "all") => {
    columnFilters.value = [
      ...columnFilters.value.filter(f => f.id !== "categoryId"),
      ...(value && value !== "all" ? [{ id: "categoryId", value }] : []),
    ];
  },
});

const activeAtsFilter = computed({
  get: () =>
    (columnFilters.value.find(f => f.id === "atsType")?.value as
      | ATSType
      | undefined) ?? "all",
  set: (value: ATSType | "all") => {
    columnFilters.value = [
      ...columnFilters.value.filter(f => f.id !== "atsType"),
      ...(value && value !== "all" ? [{ id: "atsType", value }] : []),
    ];
  },
});

function clearFilters() {
  globalFilter.value = "";
  columnFilters.value = [];
}

const hasActiveFilters = computed(
  () => !!globalFilter.value || columnFilters.value.length > 0,
);

// Watch route query params and update filters
watch(
  () => route.query,
  query => {
    globalFilter.value = (query.search as string) || "";
    const cat = (query.category as string) || "";
    const ats = (query.ats as string) || "";
    columnFilters.value = [
      ...(cat ? [{ id: "categoryId", value: cat }] : []),
      ...(ats ? [{ id: "atsType", value: ats }] : []),
    ];
  },
  { immediate: true },
);

// Watch filters and update URL
watch([globalFilter, columnFilters], ([search, filters]) => {
  const query: Record<string, string> = {};

  if (search) query.search = search;
  const cat = filters.find(f => f.id === "categoryId")?.value as
    | string
    | undefined;
  const ats = filters.find(f => f.id === "atsType")?.value as
    | string
    | undefined;
  if (cat) query.category = cat;
  if (ats) query.ats = ats;

  if (JSON.stringify(query) !== JSON.stringify(route.query)) {
    router.replace({ name: "JobSites", query });
  }
});

// -------------------------
// Delete dialog
// -------------------------

const siteToDelete = ref<SiteRow | null>(null);
const isDeleteDialogOpen = ref(false);

function confirmDelete(site: SiteRow) {
  siteToDelete.value = site;
  isDeleteDialogOpen.value = true;
}

async function handleDelete() {
  if (!siteToDelete.value) return;
  const deleted = await deleteSite(siteToDelete.value.id);
  if (deleted) {
    toast.success("Site deleted successfully");
  } else {
    toast.error("Failed to delete site");
  }
  siteToDelete.value = null;
}

// -------------------------
// Edit dialog
// -------------------------

const selectedSite = ref<JobSite | null>(null);
const isEditDialogOpen = ref(false);

function handleEdit(site: SiteRow) {
  selectedSite.value =
    allSitesWithCategory.value.find(s => s.id === site.id) ?? null;
  isEditDialogOpen.value = true;
}

// -------------------------
// Columns
// -------------------------

const columnHelper = createColumnHelper<SiteRow>();

const columns = [
  columnHelper.accessor("name", {
    header: ({ column }) =>
      h(
        Button,
        {
          variant: "ghost",
          class: "px-0 font-semibold",
          onClick: () => column.toggleSorting(),
        },
        () => [
          "Name",
          h(getSortIcon(column.getIsSorted()), { class: "ml-1 size-3.5" }),
        ],
      ),
    cell: ({ row }) => {
      const name = row.original.name;
      const notes = row.original.notes;
      const atsType =
        (row.original.atsType as ATSType | undefined) || undefined;
      const site = allSitesWithCategory.value.find(
        s => s.id === row.original.id,
      );
      const atsInfo = site ? getATSInfo(atsType) : undefined;

      const nameNode = notes
        ? h(
            Tooltip,
            {},
            {
              default: () => [
                h(TooltipTrigger, { asChild: true }, () =>
                  h(
                    "span",
                    { class: "underline decoration-dotted cursor-help" },
                    name,
                  ),
                ),
                h(TooltipContent, { class: "max-w-64" }, () => notes),
              ],
            },
          )
        : h("span", name);

      return h("div", { class: "flex items-center gap-2" }, [
        atsInfo && site
          ? h(ATSAvatar, { site, atsInfo, variant: "default" })
          : null,
        nameNode,
      ]);
    },
    enableSorting: true,
    filterFn: "includesString",
  }),

  columnHelper.accessor("url", {
    header: "URL",
    cell: ({ row }) =>
      h(
        "a",
        {
          href: row.getValue("url"),
          target: "_blank",
          rel: "noopener noreferrer",
          class:
            "flex items-center gap-1 text-muted-foreground hover:text-foreground max-w-64 truncate",
        },
        [
          h("span", { class: "truncate" }, row.getValue<string>("url")),
          h(ExternalLink, { class: "size-3 shrink-0" }),
        ],
      ),
    enableSorting: false,
  }),

  columnHelper.accessor("category", {
    header: ({ column }) =>
      h(
        Button,
        {
          variant: "ghost",
          class: "px-0 font-semibold",
          onClick: () => column.toggleSorting(),
        },
        () => [
          "Category",
          h(getSortIcon(column.getIsSorted()), { class: "ml-1 size-3.5" }),
        ],
      ),
    enableSorting: true,
  }),

  columnHelper.accessor("categoryId", {
    header: "",
    enableHiding: true,
    filterFn: (row, columnId, filterValue) =>
      row.getValue(columnId) === filterValue,
  }),

  columnHelper.accessor("atsType", {
    header: ({ column }) =>
      h(
        Button,
        {
          variant: "ghost",
          class: "px-0 font-semibold",
          onClick: () => column.toggleSorting(),
        },
        () => [
          "ATS",
          h(getSortIcon(column.getIsSorted()), { class: "ml-1 size-3.5" }),
        ],
      ),
    cell: ({ row }) => {
      const ats = row.getValue<string>("atsType");
      if (!ats) return h("span", { class: "text-muted-foreground" }, "—");
      return h("span", { class: "capitalize text-sm" }, ats);
    },
    enableSorting: true,
    filterFn: (row, columnId, filterValue) =>
      row.getValue(columnId) === filterValue,
  }),

  columnHelper.display({
    id: "actions",
    header: "",
    cell: ({ row }) =>
      h(
        "div",
        {
          class:
            "flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
        },
        [
          h(
            Button,
            {
              variant: "ghost",
              size: "icon",
              class: "size-7",
              onClick: () => handleEdit(row.original),
            },
            () => h(Pencil, { class: "size-3.5" }),
          ),
          h(
            Button,
            {
              variant: "ghost",
              size: "icon",
              class: "size-7 text-destructive hover:text-destructive",
              onClick: () => confirmDelete(row.original),
            },
            () => h(Trash2, { class: "size-3.5" }),
          ),
        ],
      ),
  }),
];

function getSortIcon(sorted: false | "asc" | "desc") {
  if (sorted === "asc") return ArrowUp;
  if (sorted === "desc") return ArrowDown;
  return ArrowUpDown;
}

// -------------------------
// Table instance
// -------------------------

const table = useVueTable({
  get data() {
    return tableData.value;
  },
  columns,
  state: {
    get sorting() {
      return sorting.value;
    },
    get columnFilters() {
      return columnFilters.value;
    },
    get globalFilter() {
      return globalFilter.value;
    },
    get columnVisibility() {
      return { categoryId: false };
    },
  },
  onSortingChange: updater => {
    sorting.value =
      typeof updater === "function" ? updater(sorting.value) : updater;
  },
  onColumnFiltersChange: updater => {
    columnFilters.value =
      typeof updater === "function" ? updater(columnFilters.value) : updater;
  },
  onGlobalFilterChange: updater => {
    globalFilter.value =
      typeof updater === "function" ? updater(globalFilter.value) : updater;
  },
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  globalFilterFn: (row, _columnId, filterValue) => {
    const q = filterValue.toLowerCase();
    return (
      row.original.name.toLowerCase().includes(q) ||
      row.original.url.toLowerCase().includes(q)
    );
  },
});

const deleteDescription = computed(
  () =>
    `Are you sure you want to delete <strong>${siteToDelete.value?.name}</strong>? This cannot be undone.`,
);
</script>

<template>
  <!-- Page Header -->
  <div class="border-b bg-card">
    <div class="mx-auto px-4 py-3 max-w-7xl">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Back to home"
            @click="router.push('/')"
          >
            <ArrowLeft class="size-4" />
          </Button>
          <h1 class="text-xl font-semibold">Job Sites</h1>
        </div>

        <Button size="sm" @click="openAddJobSite()">
          <Plus class="size-4 mr-1" />
          <span class="hidden sm:inline">Add</span>
        </Button>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap items-center gap-2">
        <!-- Global search -->
        <div class="relative w-64 shrink-0">
          <Search
            class="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground"
          />
          <Input
            v-model="globalFilter"
            placeholder="Search name or URL..."
            class="pl-8 h-9"
          />
        </div>

        <!-- Category filter -->
        <div class="w-68 shrink-0 whitespace-nowrap">
          <CategorySelect
            v-model="activeCategoryFilter"
            placeholder="All Categories"
            show-all-option
          />
        </div>

        <!-- ATS filter -->
        <div class="w-36 shrink-0">
          <ATSSelect
            v-model="activeAtsFilter"
            placeholder="All ATS Types"
            show-all-option
          />
        </div>

        <!-- Clear filters -->
        <Button
          v-if="hasActiveFilters"
          variant="outline"
          size="icon"
          class="size-9 shrink-0"
          @click="clearFilters"
          aria-label="Clear filters"
        >
          <X class="size-4" />
        </Button>

        <div class="flex-1" />

        <span class="text-xs text-muted-foreground">
          {{ table.getFilteredRowModel().rows.length }} /
          {{ tableData.length }} sites
        </span>
      </div>
    </div>
  </div>

  <!-- Table -->
  <div class="mx-auto px-4 pt-4 max-w-7xl">
    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow
            v-for="headerGroup in table.getHeaderGroups()"
            :key="headerGroup.id"
          >
            <TableHead
              v-for="header in headerGroup.headers"
              :key="header.id"
              :class="header.column.id === 'actions' ? 'w-20' : ''"
            >
              <FlexRender
                v-if="!header.isPlaceholder"
                :render="header.column.columnDef.header"
                :props="header.getContext()"
              />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="table.getFilteredRowModel().rows.length">
            <TableRow
              v-for="row in table.getRowModel().rows"
              :key="row.id"
              class="group"
            >
              <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
                <FlexRender
                  :render="cell.column.columnDef.cell"
                  :props="cell.getContext()"
                />
              </TableCell>
            </TableRow>
          </template>
          <TableRow v-else>
            <TableCell
              :colspan="columns.length"
              class="h-24 text-center text-muted-foreground"
            >
              No sites found.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>

  <!-- Delete confirmation -->
  <DeleteConfirmDialog
    v-model:open="isDeleteDialogOpen"
    title="Delete Site"
    :description="deleteDescription"
    @confirm="handleDelete"
  />

  <EditJobSiteDialog v-model:open="isEditDialogOpen" :site="selectedSite" />
</template>
