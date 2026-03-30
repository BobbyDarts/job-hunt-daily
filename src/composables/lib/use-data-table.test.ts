// /src/composables/lib/use-data-table.test.ts

import { createColumnHelper } from "@tanstack/vue-table";
import { describe, it, expect } from "vitest";
import { ref } from "vue";

import { useDataTable } from "./use-data-table";

interface TestRow {
  id: string;
  name: string;
  category: string;
}

const columnHelper = createColumnHelper<TestRow>();

const columns = [
  columnHelper.accessor("name", { header: "Name", enableSorting: true }),
  columnHelper.accessor("category", {
    header: "Category",
    enableSorting: true,
    filterFn: (row, columnId, filterValue) =>
      row.getValue(columnId) === filterValue,
  }),
];

const mockData = ref<TestRow[]>([
  { id: "1", name: "LinkedIn", category: "job-boards" },
  { id: "2", name: "Greenhouse", category: "tech-companies" },
  { id: "3", name: "Workday", category: "tech-companies" },
]);

describe("useDataTable", () => {
  describe("initial state", () => {
    it("returns all rows unfiltered on init", () => {
      const { table } = useDataTable({ data: mockData, columns });
      expect(table.getFilteredRowModel().rows).toHaveLength(3);
    });

    it("hides id column by default", () => {
      const { table } = useDataTable({ data: mockData, columns });
      const visibleColumns = table.getVisibleLeafColumns().map(c => c.id);
      expect(visibleColumns).not.toContain("id");
    });

    it("respects custom columnVisibility", () => {
      const { table } = useDataTable({
        data: mockData,
        columns,
        columnVisibility: { id: false, category: false },
      });
      const visibleColumns = table.getVisibleLeafColumns().map(c => c.id);
      expect(visibleColumns).not.toContain("category");
      expect(visibleColumns).not.toContain("id");
    });
  });

  describe("sorting", () => {
    it("updates sorting state when sorting changes", () => {
      const { table, sorting } = useDataTable({ data: mockData, columns });
      expect(sorting.value).toEqual([]);
      table.getColumn("name")?.toggleSorting();
      expect(sorting.value).toEqual([{ id: "name", desc: false }]);
    });

    it("respects initialSorting", () => {
      const { sorting } = useDataTable({
        data: mockData,
        columns,
        initialSorting: [{ id: "name", desc: true }],
      });
      expect(sorting.value).toEqual([{ id: "name", desc: true }]);
    });
  });

  describe("column filters", () => {
    it("filters rows by column filter value", () => {
      const { table, columnFilters } = useDataTable({
        data: mockData,
        columns,
      });
      columnFilters.value = [{ id: "category", value: "tech-companies" }];
      expect(table.getFilteredRowModel().rows).toHaveLength(2);
    });

    it("clears filtered rows when column filters are removed", () => {
      const { table, columnFilters } = useDataTable({
        data: mockData,
        columns,
      });
      columnFilters.value = [{ id: "category", value: "tech-companies" }];
      expect(table.getFilteredRowModel().rows).toHaveLength(2);
      columnFilters.value = [];
      expect(table.getFilteredRowModel().rows).toHaveLength(3);
    });
  });

  describe("global filter", () => {
    it("filters rows using the built-in includesString filterFn", () => {
      const { table, globalFilter } = useDataTable({
        data: mockData,
        columns,
        globalFilterFn: (row, _colId, filterValue) =>
          row.original.name
            .toLowerCase()
            .includes(String(filterValue).toLowerCase()),
      });
      globalFilter.value = "linked";
      expect(table.getFilteredRowModel().rows).toHaveLength(1);
      expect(table.getFilteredRowModel().rows[0].original.name).toBe(
        "LinkedIn",
      );
    });

    it("shows all rows when global filter is cleared", () => {
      const { table, globalFilter } = useDataTable({
        data: mockData,
        columns,
        globalFilterFn: (row, _colId, filterValue) =>
          row.original.name
            .toLowerCase()
            .includes(String(filterValue).toLowerCase()),
      });
      globalFilter.value = "linked";
      expect(table.getFilteredRowModel().rows).toHaveLength(1);
      globalFilter.value = "";
      expect(table.getFilteredRowModel().rows).toHaveLength(3);
    });
  });
});
