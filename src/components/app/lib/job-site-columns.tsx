// /src/components/app/lib/job-site-columns.tsxx

import { createActionsColumn, createTextColumn } from "@/components/app/lib";
import type { ColumnDef } from "@tanstack/vue-table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "@lucide/vue";

export interface JobSiteRow {
  id: string;
  name: string;
  url: string;
  category: string;
  categoryId: string;
  atsType: string;
  notes?: string;
}

export interface JobSiteColumnCallbacks {
  onEdit: (row: JobSiteRow) => void;
  onDelete: (row: JobSiteRow) => void;
}

/**
 * Returns the fully typed columns for the job sites table.
 * Uses text/action column factories internally.
 */
export function createJobSiteColumns({
  onEdit,
  onDelete,
}: JobSiteColumnCallbacks): ColumnDef<JobSiteRow>[] {
  return [
    createTextColumn<JobSiteRow>("categoryId", "ID"),
    createTextColumn<JobSiteRow>("name", "Name"),
    createTextColumn<JobSiteRow>("url", "URL"),
    createTextColumn<JobSiteRow>("category", "Category"),
    createTextColumn<JobSiteRow>("atsType", "ATS"),

    createActionsColumn<JobSiteRow>({
      actions: ({ row }) => {
        return (
          <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Tooltip>
              <TooltipTrigger as-child>
                <Button variant="ghost" {...{ onClick: () => onEdit(row) }}>
                  <Pencil class="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit site</TooltipContent>
            </Tooltip>

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
              <TooltipContent>Delete site</TooltipContent>
            </Tooltip>
          </div>
        );
      },
    }),
  ];
}
