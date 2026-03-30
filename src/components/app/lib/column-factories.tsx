// /src/components/app/lib/column-factories.tsx

import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, ArrowUpDown } from "@lucide/vue";
import {
  type Column,
  type ColumnDef,
  type Row,
  type Table as TanstackTable,
} from "@tanstack/vue-table";
import type { JSX } from "vue/jsx-runtime";
import { cn } from "@/lib/utils";

function SortIcon({ state }: { state: false | "asc" | "desc" }) {
  if (state === "asc") return <ArrowUp class="ml-1 size-3.5" />;
  if (state === "desc") return <ArrowDown class="ml-1 size-3.5" />;
  return <ArrowUpDown class="ml-1 size-3.5" />;
}

export function createSortableHeader<TData, TValue = unknown>(label: string) {
  return ({ column }: { column: Column<TData, TValue> }) => (
    <Button
      variant="ghost"
      class="px-0 font-semibold"
      {...{ onClick: () => column.toggleSorting() }}
    >
      {label}
      <SortIcon state={column.getIsSorted()} />
    </Button>
  );
}

export function createTextColumn<T>(
  key: keyof T,
  label: string,
  options?: { wrap?: boolean; truncate?: boolean },
): ColumnDef<T> {
  return {
    accessorKey: key as string,
    header: createSortableHeader(label),
    cell: info => {
      const classes = cn(
        options?.wrap ? "whitespace-normal wrap-break-words" : "",
        options?.truncate ? "w-full truncate max-w-lg" : "",
      );

      return <div class={classes}>{info.getValue()}</div>;
    },
    enableSorting: true,
    enableColumnFilter: true,
    filterFn: "includesString",
  };
}

export function createActionsColumn<T>({
  actions,
}: {
  actions: (ctx: { row: T; table: TanstackTable<T> }) => JSX.Element;
}): ColumnDef<T> {
  return {
    id: "actions",
    cell: ({ row, table }: { row: Row<T>; table: TanstackTable<T> }) =>
      actions({ row: row.original, table }),
  };
}
