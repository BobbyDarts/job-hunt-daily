// /src/composables/lib/use-data-table.ts

import {
  useVueTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type Table as TanstackTable,
  type FilterFn,
} from "@tanstack/vue-table";
import { ref, type Ref } from "vue";

interface UseDataTableParams<T> {
  data: Ref<T[]>;
  columns: ColumnDef<T, unknown>[];
  meta?: Record<string, unknown>;
  getRowId?: (row: T) => string;
  initialSorting?: SortingState;
  columnVisibility?: Record<string, boolean>;
  globalFilterFn?: FilterFn<T>;
}

export function useDataTable<T extends { id: string }>({
  data,
  columns,
  meta,
  getRowId,
  initialSorting = [],
  columnVisibility = { id: false },
  globalFilterFn,
}: UseDataTableParams<T>) {
  const sorting = ref<SortingState>(initialSorting);
  const columnFilters = ref<ColumnFiltersState>([]);
  const globalFilter = ref("");

  const table = useVueTable({
    get data() {
      return data.value;
    },
    columns,
    getRowId: getRowId ?? (row => row.id),

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
        return columnVisibility;
      },
    },

    filterFns: {
      includesString: (row, columnId, filterValue: string) =>
        String(row.getValue(columnId))
          .toLowerCase()
          .includes(filterValue.toLowerCase()),
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

    globalFilterFn,

    meta,
  });

  return {
    table: table as TanstackTable<T>,
    sorting,
    columnFilters,
    globalFilter,
  };
}
