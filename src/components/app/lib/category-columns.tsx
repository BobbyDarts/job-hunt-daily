// /src/components/app/lib/category-columns.tsx

import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "@lucide/vue";
import type { ColumnDef } from "@tanstack/vue-table";
import { createTextColumn, createActionsColumn } from "@/components/app/lib";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { JobSite } from "@/types";

export interface CategoryRow {
  id: string;
  name: string;
  description: string;
}

export interface CategoryColumnCallbacks {
  onAddSite: (categoryId: string) => void;
  onEdit: (row: CategoryRow) => void;
  onDelete: (row: CategoryRow) => void;
  getSitesByCategory: (categoryId: string) => JobSite[];
}

/**
 * Returns the fully typed columns for the categories table.
 * Uses text/action column factories internally.
 */
export function createCategoryColumns({
  onAddSite,
  onEdit,
  onDelete,
  getSitesByCategory,
}: CategoryColumnCallbacks): ColumnDef<CategoryRow>[] {
  return [
    createTextColumn<CategoryRow>("id", "ID"),
    createTextColumn<CategoryRow>("name", "Name"),
    createTextColumn<CategoryRow>("description", "Description", {
      wrap: true,
    }),

    createActionsColumn<CategoryRow>({
      actions: ({ row }) => {
        const hasSites = getSitesByCategory(row.id).length > 0;

        return (
          <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Tooltip>
              <TooltipTrigger as-child>
                <Button
                  variant="ghost"
                  {...{ onClick: () => onAddSite(row.id) }}
                >
                  <Plus class="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add site to category</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger as-child>
                <Button variant="ghost" {...{ onClick: () => onEdit(row) }}>
                  <Pencil class="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit category</TooltipContent>
            </Tooltip>

            {hasSites ? (
              <div class="size-9" />
            ) : (
              <Tooltip>
                <TooltipTrigger as-child>
                  <Button
                    variant="ghost"
                    class="text-destructive hover:text-destructive"
                    {...{ onClick: () => onDelete(row) }}
                  >
                    <Trash2 class="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete category</TooltipContent>
              </Tooltip>
            )}
          </div>
        );
      },
    }),
  ];
}
