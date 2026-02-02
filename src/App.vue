<script setup lang="ts">
import { computed } from "vue";

import { CategoryCard } from "@/components/category-card";
import { Header } from "@/components/header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useATSDetection } from "@/composables/use-ats-detection";
import { useCategoryProgress } from "@/composables/use-category-progress";
import { useVisitedSites } from "@/composables/use-visited-sites";
import jobData from "./data/job-hunt-daily.json";
import type { JobHuntData } from "./types";
import { useColorMode, useOnline } from "@vueuse/core";
import { Button } from "@/components/ui/button";
import { Moon, Sun, WifiOff } from "lucide-vue-next";

const STORAGE_KEY = "job-hunt-visited";
const data = jobData as JobHuntData;

// Total sites count
const totalSites = computed(() => {
  return data.categories.reduce((sum, cat) => sum + cat.sites.length, 0);
});

// Composables
const visitedComposable = useVisitedSites(STORAGE_KEY, totalSites);
const categoryComposable = useCategoryProgress(
  data,
  visitedComposable.isSiteVisited,
);
const atsComposable = useATSDetection(data);

// Convenience for template
const { visitedCount, isComplete, markVisited, isSiteVisited } =
  visitedComposable;
const {
  sortedCategories,
  splitCategorySites,
  getCategoryProgress,
  maxCategoryHeight,
} = categoryComposable;
const { getATS } = atsComposable;

// Progress computed from visitedCount
const progress = computed(() => {
  if (totalSites.value === 0) return 0;
  return Math.round((visitedCount.value / totalSites.value) * 100);
});

// Handle site click
const handleSiteClick = (url: string) => {
  markVisited(url);
  window.open(url, "_blank", "noopener,noreferrer");
};

const colorMode = useColorMode();

const toggleTheme = () => {
  colorMode.value = colorMode.value === "dark" ? "light" : "dark";
};

const isOnline = useOnline();

// Expose for testing
defineExpose({
  totalSites,
  visitedCount: visitedComposable.visitedCount,
  progress,
  isComplete: visitedComposable.isComplete,
  sortedCategories: categoryComposable.sortedCategories,
  markVisited: visitedComposable.markVisited,
  isSiteVisited: visitedComposable.isSiteVisited,
});
</script>

<template>
  <TooltipProvider>
    <div class="h-screen bg-background flex flex-col overflow-hidden">
      <!-- Fixed Header -->
      <Header
        title="Job Hunt Daily"
        :visited-count="visitedCount"
        :total-sites="totalSites"
        :progress="progress"
        :is-complete="isComplete"
      >
        <!-- Add theme toggle to header actions slot -->
        <template #actions>
          <Button
            variant="ghost"
            size="icon"
            @click="toggleTheme"
            aria-label="Toggle theme"
          >
            <Sun v-if="colorMode === 'dark'" class="size-5" />
            <Moon v-else class="size-5" />
          </Button>
        </template>
      </Header>

      <!-- Offline warning -->
      <Alert v-if="!isOnline" variant="destructive" class="mx-4 mt-4">
        <div class="flex items-center justify-center gap-2">
          <WifiOff class="size-4" />
          <AlertDescription class="mb-0">
            You're offline. Job sites may not load properly.
          </AlertDescription>
        </div>
      </Alert>

      <!-- Scrollable Content with ScrollArea -->
      <ScrollArea class="flex-1 h-full">
        <div class="px-4 py-4 sm:px-6 sm:py-6">
          <div
            class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            <CategoryCard
              v-for="category in sortedCategories"
              :key="category.name"
              :category="category"
              :max-height-rem="maxCategoryHeight"
              :is-site-visited="isSiteVisited"
              :on-site-click="handleSiteClick"
              :get-category-progress="getCategoryProgress"
              :split-category-sites="splitCategorySites"
              :get-a-t-s="getATS"
            />
          </div>
        </div>
      </ScrollArea>
    </div>
  </TooltipProvider>
</template>
