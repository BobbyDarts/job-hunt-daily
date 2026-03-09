<!-- // /src/components/app/shell/command-palette/CommandPalette.vue -->

<script setup lang="ts">
import { Home, Download, Upload, FolderOpen, Plus } from "lucide-vue-next";
import { useRouter } from "vue-router";

import { CommandPaletteSites } from "@/components/app/shell/command-palette";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useDataManagement } from "@/composables/data";
import { useAddApplicationDialog, useCommandPalette } from "@/composables/ui";

// composables
const router = useRouter();

const { triggerImport, exportAllData } = useDataManagement();
const { open, closeCommandPalette } = useCommandPalette();
const { openDialog: openAddApplication } = useAddApplicationDialog();

// actions
function handleRouteSelect(path: string = "/") {
  closeCommandPalette();
  void router.push(path);
}
</script>

<template>
  <CommandDialog
    v-model:open="open"
    class="rounded-lg border shadow-md max-w-112.5"
  >
    <CommandInput placeholder="Type a command or search..." />
    <CommandList>
      <CommandEmpty>No results found.</CommandEmpty>

      <CommandGroup heading="Navigation">
        <CommandItem value="home" @select="handleRouteSelect()">
          <Home class="mr-2 size-4" />
          <span>Go to Home</span>
        </CommandItem>
        <CommandItem
          value="applications"
          @select="handleRouteSelect('/applications')"
        >
          <FolderOpen class="mr-2 size-4" />
          <span>Go to Applications</span>
        </CommandItem>
      </CommandGroup>

      <CommandGroup heading="Actions">
        <CommandItem
          value="application"
          @select="
            () => {
              openAddApplication();
              closeCommandPalette();
            }
          "
        >
          <Plus class="mr-2 size-4" />
          <span>Add Application</span>
        </CommandItem>
        <CommandItem
          value="export"
          @select="
            () => {
              exportAllData();
              closeCommandPalette();
            }
          "
        >
          <Download class="mr-2 size-4" />
          <span>Export Data</span>
        </CommandItem>
        <CommandItem
          value="import"
          @select="
            () => {
              triggerImport();
              closeCommandPalette();
            }
          "
        >
          <Upload class="mr-2 size-4" />
          <span>Import Data</span>
        </CommandItem>
      </CommandGroup>
      <CommandPaletteSites @site-select="closeCommandPalette" />
    </CommandList>
  </CommandDialog>
</template>
