<!-- // /src/components/app/shell/global-dialogs/GlobalDialogs.vue -->

<script setup lang="ts">
import { AddApplicationDialog } from "@/components/app/applications";
import {
  CommandPalette,
  ShortcutReferenceDialog,
} from "@/components/app/shell";
import { AddJobSiteDialog, AddCategoryDialog } from "@/components/app/sites";
import {
  useAddJobSiteDialog,
  useAddApplicationDialog,
  useAddCategoryDialog,
} from "@/composables/ui";

// FUTURE:
// <EditApplicationDialog />
// <EditJobSiteDialog />
// others?

const { open: isAddJobSiteOpen, category: addJobSiteCategory } =
  useAddJobSiteDialog();
const { open: isAddApplicationOpen, site: addApplicationSite } =
  useAddApplicationDialog();
const { open: isAddCategoryOpen } = useAddCategoryDialog();
</script>

<template>
  <CommandPalette />
  <ShortcutReferenceDialog />

  <AddJobSiteDialog
    v-model:open="isAddJobSiteOpen"
    :category-id="addJobSiteCategory"
  />

  <AddApplicationDialog
    v-model:open="isAddApplicationOpen"
    :site="addApplicationSite"
  />

  <AddCategoryDialog v-model:open="isAddCategoryOpen" />
</template>
