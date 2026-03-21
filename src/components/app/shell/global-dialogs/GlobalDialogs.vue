<!-- // /src/components/app/shell/global-dialogs/GlobalDialogs.vue -->

<script setup lang="ts">
import {
  CommandPalette,
  ShortcutReferenceDialog,
} from "@/components/app/shell";
import { AddJobSiteDialog } from "@/components/app/sites";
import { useAddJobSiteDialog } from "@/composables/ui";

// FUTURE:
// <AddApplicationDialog />
// <EditApplicationDialog />
// <EditJobSiteDialog />

const { open: isAddJobSiteOpen, category: addJobSiteCategory } =
  useAddJobSiteDialog();
</script>

<template>
  <CommandPalette />
  <ShortcutReferenceDialog />

  <AddJobSiteDialog
    v-model:open="isAddJobSiteOpen"
    :category-id="addJobSiteCategory"
  />
</template>
