<!-- // /src/views/JobSites.vue -->

<script setup lang="ts">
import { ArrowLeft, Search, Plus } from "@lucide/vue";
import { computed } from "vue";
import { useRouter } from "vue-router";

import {
  ATSSelect,
  CategorySelect,
  DataTable,
  DataToolbar,
  DeleteConfirmDialog,
} from "@/components/app/lib";
import { EditJobSiteDialog } from "@/components/app/sites";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useJobSiteTable } from "@/composables/tables";
import { useAddJobSiteDialog } from "@/composables/ui";

const router = useRouter();

const { openDialog: openAddJobSite } = useAddJobSiteDialog();
const {
  table,
  filters,
  hasActiveFilters,
  clear,
  // Delete dialog
  siteToDelete,
  isDeleteDialogOpen,
  handleDelete,
  // Edit dialog
  selectedSite,
  isEditDialogOpen,
} = useJobSiteTable();

const deleteDescription = computed(() =>
  siteToDelete.value
    ? `Are you sure you want to delete <strong>${siteToDelete.value.name}</strong>? This cannot be undone.`
    : "",
);
</script>

<template>
  <!-- Page Header -->
  <div class="border-b bg-card">
    <div class="mx-auto px-4 py-3 max-w-7xl">
      <DataToolbar
        :total="table.getCoreRowModel().rows.length"
        :filtered="table.getFilteredRowModel().rows.length"
        :has-active-filters="hasActiveFilters"
        @clear="clear"
      >
        <!-- Back -->
        <template #back>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Back to home"
            @click="router.push('/')"
          >
            <ArrowLeft class="size-4" />
          </Button>
        </template>

        <!-- Title -->
        <template #title>
          <h1 class="text-xl font-semibold">Job Sites</h1>
        </template>

        <!-- Filters -->
        <template #filters>
          <!-- Global search -->
          <div class="relative w-64 shrink-0">
            <Search
              class="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground"
            />
            <Input
              v-model="filters.search"
              placeholder="Search name or URL..."
              class="pl-8 h-9"
            />
          </div>

          <!-- Category filter -->
          <div class="w-68 shrink-0 whitespace-nowrap">
            <CategorySelect
              v-model="filters.category"
              placeholder="All Categories"
              show-all-option
            />
          </div>

          <!-- ATS filter -->
          <div class="w-36 shrink-0">
            <ATSSelect
              v-model="filters.ats"
              placeholder="All ATS Types"
              show-all-option
            />
          </div>
        </template>

        <!-- Actions -->
        <template #actions>
          <Button size="sm" @click="openAddJobSite()">
            <Plus class="size-4 mr-1" />
            <span class="hidden sm:inline">Add</span>
          </Button>
        </template>
      </DataToolbar>
    </div>
  </div>

  <!-- Table -->
  <div class="mx-auto px-4 pt-4 max-w-7xl">
    <DataTable :table="table" />
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
