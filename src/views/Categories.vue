<!-- // /src/views/Categories.vue -->

<script setup lang="ts">
import { ArrowLeft, Plus } from "@lucide/vue";
import { computed } from "vue";
import { useRouter } from "vue-router";

import {
  CategorySelect,
  DataTable,
  DataToolbar,
  DeleteConfirmDialog,
} from "@/components/app/lib";
import { EditCategoryDialog } from "@/components/app/sites";
import { Button } from "@/components/ui/button";
import { useCategoryTable } from "@/composables/tables";
import { useAddCategoryDialog } from "@/composables/ui";

const router = useRouter();

const { openDialog: openAddCategory } = useAddCategoryDialog();
const {
  table,
  filters,
  hasActiveFilters,
  clear,
  // Delete dialog
  categoryToDelete,
  isDeleteDialogOpen,
  handleDelete,
  // Edit dialog
  selectedCategory,
  isEditDialogOpen,
} = useCategoryTable();

const deleteDescription = computed(() =>
  categoryToDelete.value
    ? `Are you sure you want to delete <strong>${categoryToDelete.value.name}</strong>? This cannot be undone.`
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
          <h1 class="text-xl font-semibold">Categories</h1>
        </template>

        <!-- Filters -->
        <template #filters>
          <!-- Category filter -->
          <div class="w-68 shrink-0 whitespace-nowrap">
            <CategorySelect
              v-model="filters.category"
              placeholder="All Categories"
              show-all-option
            />
          </div>
        </template>

        <!-- Actions -->
        <template #actions>
          <Button size="sm" @click="openAddCategory()">
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
    title="Delete Category"
    :description="deleteDescription"
    @confirm="handleDelete"
  />

  <EditCategoryDialog
    v-model:open="isEditDialogOpen"
    :category="selectedCategory"
  />
</template>
