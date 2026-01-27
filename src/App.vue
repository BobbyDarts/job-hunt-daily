<script setup lang="ts">
import { computed } from 'vue';

import type { JobHuntData } from './types';
import jobData from './data/job-hunt-daily.json';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Header } from '@/components/header';
import { CategoryCard } from '@/components/category-card';
import { useVisitedSites } from '@/composables/use-visited-sites';
import { useCategoryProgress } from '@/composables/use-category-progress';
import { useATSDetection } from '@/composables/use-ats-detection';

const STORAGE_KEY = 'job-hunt-visited';
const data = jobData as JobHuntData;

// Total sites count
const totalSites = computed(() => {
  return data.categories.reduce((sum, cat) => sum + cat.sites.length, 0);
});

// Composables
const visitedComposable = useVisitedSites(STORAGE_KEY, totalSites);
const categoryComposable = useCategoryProgress(data, visitedComposable.isSiteVisited);
const atsComposable = useATSDetection(data);

// Convenience for template
const { visitedCount, isComplete, markVisited, isSiteVisited } = visitedComposable;
const { sortedCategories, splitCategorySites, getCategoryProgress, maxCategoryHeight } = categoryComposable;
const { getATS } = atsComposable;

// Progress computed from visitedCount
const progress = computed(() => {
  if (totalSites.value === 0) return 0;
  return Math.round((visitedCount.value / totalSites.value) * 100);
});

// Handle site click
const handleSiteClick = (url: string) => {
  markVisited(url);
  window.open(url, '_blank', 'noopener,noreferrer');
};

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
      <Header title="Job Hunt Daily" :visitedCount="visitedCount" :totalSites="totalSites" :progress="progress"
        :isComplete="isComplete">
      </Header>

      <!-- Scrollable Content with ScrollArea -->
      <ScrollArea class="flex-1 h-full">
        <div class="px-4 py-4 sm:px-6 sm:py-6">
          <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <CategoryCard v-for="category in sortedCategories" :key="category.name" :category="category"
              :maxHeightRem="maxCategoryHeight" :isSiteVisited="isSiteVisited" :onSiteClick="handleSiteClick"
              :getCategoryProgress="getCategoryProgress" :splitCategorySites="splitCategorySites" :getATS="getATS" />
          </div>
        </div>
      </ScrollArea>
    </div>
  </TooltipProvider>
</template>