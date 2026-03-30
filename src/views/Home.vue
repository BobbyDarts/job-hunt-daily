<!-- // /src/views/Home.vue -->

<script setup lang="ts">
import { Search, Plus } from "@lucide/vue";
import { computed, reactive } from "vue";
import { useRouter } from "vue-router";

import { DataToolbar, CategorySelect } from "@/components/app/lib";
import { CategoryCard } from "@/components/app/sites";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCategoryProgress } from "@/composables/dashboard";
import {
  useApplications,
  useATSDetection,
  useVisitedSites,
} from "@/composables/data";
import { useQuerySync, useToolbarState } from "@/composables/lib";
import {
  useAddApplicationDialog,
  useAddCategoryDialog,
} from "@/composables/ui";
import type { JobSite } from "@/types";

type HomeFilters = {
  search: string;
  category: string | "all";
};

// composables
const router = useRouter();

const { markVisited, isSiteVisited } = useVisitedSites();
const {
  categoryStats,
  getCategoryProgress,
  getCategoryVisitedCount,
  maxCategoryHeight,
} = useCategoryProgress();
const { getATS } = useATSDetection();
const { applications } = useApplications();
const { openDialog: openAddApplication } = useAddApplicationDialog();
const { openDialog: openAddCategory } = useAddCategoryDialog();

// reactive filters
const filters = reactive<HomeFilters>({
  search: "",
  category: "all",
});

const filteredCategoryStats = computed(() => {
  let stats = categoryStats.value;

  // Filter by category
  if (filters.category !== "all") {
    stats = stats.filter(s => s.category.id === filters.category);
  }

  // Filter by site name — hide categories with no matches, pass filtered sites to card
  if (filters.search.trim()) {
    const q = filters.search.trim().toLowerCase();
    stats = stats
      .map(s => ({
        ...s,
        sites: s.sites.filter(site => site.name.toLowerCase().includes(q)),
      }))
      .filter(s => s.sites.length > 0);
  }

  return stats;
});

// handlers
const handleSiteClick = (url: string) => {
  markVisited(url);
  window.open(url, "_blank", "noopener,noreferrer");
};

const handleAddApplication = (site: JobSite) => {
  openAddApplication(site);
};

const handleManageApplications = async (site: JobSite) => {
  try {
    await router.push({
      name: "Applications",
      query: { site: site.id },
    });
  } catch (err) {
    console.error("Navigation error:", err);
  }
};

const getApplicationsForSite = (siteId: string) => {
  return applications.value.filter(app => app.jobSiteId === siteId);
};

useQuerySync({
  state: filters,
  toQuery: f => {
    const q: Record<string, string> = {};
    if (f.search) q.search = f.search;
    if (f.category && f.category !== "all") q.category = f.category;
    return q;
  },
  fromQuery: q => ({
    search: Array.isArray(q.search) ? (q.search[0] ?? "") : (q.search ?? ""),
    category: (Array.isArray(q.category) ? q.category[0] : q.category) ?? "all",
  }),
});

const { hasActiveFilters, clear } = useToolbarState(filters);
</script>

<template>
  <!-- Page Header -->
  <div class="border-b bg-card">
    <div class="mx-auto px-4 py-3 max-w-7xl">
      <!-- Top Row -->
      <DataToolbar :has-active-filters="hasActiveFilters" @clear="clear">
        <template #actions>
          <Button size="sm" @click="openAddCategory()">
            <Plus class="size-4 mr-1" />
            <span class="hidden sm:inline">Add</span>
          </Button>
        </template>

        <template #filters>
          <!-- Search -->
          <div class="relative w-64 shrink-0">
            <Search
              class="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground"
            />
            <Input
              v-model="filters.search"
              placeholder="Search sites..."
              class="pl-8 h-9"
            />
          </div>

          <!-- Category Filter -->
          <div class="w-68 shrink-0">
            <CategorySelect
              v-model="filters.category"
              placeholder="All Categories"
              show-all-option
            />
          </div>
        </template>
      </DataToolbar>
    </div>
  </div>

  <!-- Category Cards -->
  <div class="px-4 pt-4 sm:px-6 sm:pt-6">
    <!-- Empty State -->
    <div
      v-if="filteredCategoryStats.length === 0"
      class="flex flex-col items-center justify-center py-10 text-center"
    >
      <h3 class="text-base font-semibold mb-1">
        {{
          categoryStats.length === 0
            ? "No categories yet"
            : "No categories found"
        }}
      </h3>
      <p class="text-sm text-muted-foreground mb-4">
        {{
          categoryStats.length === 0
            ? "Add a category to get started"
            : "Try adjusting your filters"
        }}
      </p>

      <Button
        v-if="categoryStats.length === 0"
        size="sm"
        @click="openAddCategory()"
      >
        <Plus class="size-4 mr-1" />
        Add Category
      </Button>

      <Button v-else size="sm" variant="outline" @click="clear">
        Clear Filters
      </Button>
    </div>

    <div
      v-else
      class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6"
    >
      <CategoryCard
        v-for="stat in filteredCategoryStats"
        :key="stat.category.id"
        :category="stat.category"
        :sites="stat.sites"
        :visited-count="getCategoryVisitedCount(stat.category)"
        :progress="getCategoryProgress(stat.category)"
        :max-height="maxCategoryHeight"
        :get-a-t-s="getATS"
        :is-site-visited="isSiteVisited"
        :on-visit="handleSiteClick"
        :on-add-application="handleAddApplication"
        :on-manage-applications="handleManageApplications"
        :get-applications-for-site="getApplicationsForSite"
      />
    </div>
  </div>
</template>
