<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { JobHuntData, VisitedSites } from './types';
import jobData from './data/job-hunt-daily.json';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip';

import { getATSType, getATSClasses, getATSInitials } from "@/lib/ats-detection";

const data = jobData as JobHuntData;
const visitedSites = ref<Set<string>>(new Set());
const lastVisitDate = ref<string>('');

const STORAGE_KEY = 'job-hunt-visited';

const totalSites = computed(() => {
  return data.categories.reduce((sum, cat) => sum + cat.sites.length, 0);
});

const visitedCount = computed(() => visitedSites.value.size);

const progress = computed(() => {
  if (totalSites.value === 0) return 0;
  return Math.round((visitedCount.value / totalSites.value) * 100);
});

const isComplete = computed(() => visitedCount.value === totalSites.value);

// Sort categories by size (number of sites) for better visual balance
const sortedCategories = computed(() => {
  return [...data.categories].map(category => ({
    ...category,
    sites: [...category.sites].sort((a, b) => a.name.localeCompare(b.name))
  })).sort((a, b) => {
    // Sort by number of sites, descending
    return b.sites.length - a.sites.length;
  });
});

const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

const loadVisitedSites = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const parsed: VisitedSites = JSON.parse(stored);
    const today = getTodayDate();

    if (parsed.date === today) {
      visitedSites.value = new Set(parsed.visited);
      lastVisitDate.value = parsed.date;
    } else {
      // New day, reset
      visitedSites.value = new Set();
      lastVisitDate.value = today;
    }
  }
};

const saveVisitedSites = () => {
  const toSave: VisitedSites = {
    date: getTodayDate(),
    visited: Array.from(visitedSites.value)
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
};

const handleSiteClick = (url: string) => {
  visitedSites.value.add(url);
  saveVisitedSites();
  window.open(url, '_blank', 'noopener,noreferrer');
};

const isSiteVisited = (url: string): boolean => {
  return visitedSites.value.has(url);
};


const getCategoryProgress = (category: typeof data.categories[0]): number => {
  const visitedInCategory = category.sites.filter(site => isSiteVisited(site.url)).length;
  if (category.sites.length === 0) return 0;
  return Math.round((visitedInCategory / category.sites.length) * 100);
};

const getCategoryVisitedCount = (category: typeof data.categories[0]): number => {
  return category.sites.filter(site => isSiteVisited(site.url)).length;
};

// Calculate max category height (max 6 items)
const maxCategoryHeight = computed(() => {
  const maxItems = Math.max(...data.categories.map(cat => cat.sites.length));
  return Math.min(maxItems, 6);
});

// Split sites into unvisited and visited, both sorted alphabetically
const splitCategorySites = (category: typeof data.categories[0]) => {
  const unvisited = category.sites.filter(site => !isSiteVisited(site.url));
  const visited = category.sites.filter(site => isSiteVisited(site.url));

  return {
    unvisited: [...unvisited].sort((a, b) => a.name.localeCompare(b.name)),
    visited: [...visited].sort((a, b) => a.name.localeCompare(b.name))
  };
};

onMounted(() => {
  loadVisitedSites();
});

// Expose for testing
defineExpose({
  totalSites,
  visitedCount,
  progress,
  isComplete,
  isSiteVisited
});
</script>

<template>
  <TooltipProvider>
    <div class="h-screen bg-background flex flex-col overflow-hidden">
      <!-- Fixed Header -->
      <header class="sticky top-0 z-10 bg-background border-b px-4 py-3 sm:px-6 md:py-4">
        <div class="max-w-7xl mx-auto">
          <div class="flex items-center justify-between gap-4 mb-3">
            <h1 class="text-2xl sm:text-3xl font-bold">Job Hunt Daily</h1>
            <div class="text-right">
              <p class="text-xs sm:text-sm text-muted-foreground">Progress</p>
              <p class="text-lg sm:text-xl font-bold">
                {{ visitedCount }} / {{ totalSites }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <Progress :model-value="progress" class="flex-1 h-2">
            </Progress>
            <span class="text-sm font-semibold min-w-12 text-right">{{ progress }}%</span>
          </div>

          <p v-if="isComplete" class="mt-2 text-center text-sm text-green-600 dark:text-green-400 font-semibold">
            🎉 All done for today!
          </p>
        </div>
      </header>

      <!-- Scrollable Content with ScrollArea -->
      <ScrollArea class="flex-1 h-full">
        <div class="px-4 py-4 sm:px-6 sm:py-6">
          <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <section v-for="(category, _) in sortedCategories" :key="category.name"
              class="rounded-xl border border-border/50 bg-card text-card-foreground shadow-lg overflow-hidden backdrop-blur-sm">
              <div
                class="bg-linear-to-r from-primary/5 to-primary/10 px-4 py-3 sm:px-6 sm:py-4 border-b border-border/30">
                <div class="flex items-center justify-between mb-2">
                  <h2 class="text-lg sm:text-xl font-semibold tracking-tight">{{ category.name }}</h2>
                  <span class="text-sm font-medium text-muted-foreground tabular-nums">
                    {{ getCategoryVisitedCount(category) }} / {{ category.sites.length }}
                  </span>
                </div>

                <Progress :model-value="getCategoryProgress(category)" class="h-1.5 bg-primary/10">
                </Progress>
              </div>

              <ScrollArea class="overflow-hidden bg-card/50" :style="{ height: `${maxCategoryHeight * 4.25}rem` }">
                <div class="flex flex-col gap-2 p-4 sm:p-6 pt-3">
                  <!-- Unvisited sites first -->
                  <button v-for="site in splitCategorySites(category).unvisited" :key="site.url"
                    @click="handleSiteClick(site.url)"
                    class="w-full inline-flex items-center justify-between gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-border/40 hover:border-primary/30 hover:bg-accent/50 hover:shadow-md p-3 sm:p-4 text-left bg-background/80 backdrop-blur-sm">
                    <div class="flex items-center gap-2 min-w-0">
                      <Tooltip v-if="getATSType(site)">
                        <TooltipTrigger as-child>
                          <Avatar class="size-6 cursor-help">
                            <AvatarFallback class="text-[10px] font-bold" :class="getATSClasses(getATSType(site))">
                              {{ getATSInitials(getATSType(site)) }}
                            </AvatarFallback>
                          </Avatar>
                        </TooltipTrigger>

                        <TooltipContent side="top">
                          <span class="text-sm">
                            Applicant Tracking System: <strong class="capitalize">{{ getATSType(site) }}</strong>
                          </span>
                        </TooltipContent>
                      </Tooltip>

                      <span class="truncate">
                        {{ site.name }}
                      </span>
                    </div>
                  </button>

                  <!-- Visited sites at the bottom -->
                  <button v-for="site in splitCategorySites(category).visited" :key="site.url"
                    @click="handleSiteClick(site.url)"
                    class="w-full inline-flex items-center justify-between gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-border/20 hover:border-primary/20 hover:bg-accent/30 p-3 sm:p-4 text-left bg-muted/40 backdrop-blur-sm opacity-75">
                    <div class="flex items-center gap-2 min-w-0">
                      <Tooltip v-if="getATSType(site)">
                        <TooltipTrigger as-child>
                          <Avatar class="size-6 cursor-help opacity-70">
                            <AvatarFallback class="text-[10px] font-bold" :class="getATSClasses(getATSType(site))">
                              {{ getATSInitials(getATSType(site)) }}
                            </AvatarFallback>
                          </Avatar>
                        </TooltipTrigger>

                        <TooltipContent side="top">
                          <span class="text-sm">
                            Applicant Tracking System: <strong class="capitalize">{{ getATSType(site) }}</strong>
                          </span>
                        </TooltipContent>
                      </Tooltip>

                      <span class="truncate">
                        {{ site.name }}
                      </span>
                    </div>
                    <span class="text-green-600 dark:text-green-400 shrink-0">
                      ✓
                    </span>
                  </button>
                </div>
              </ScrollArea>
            </section>
          </div>
        </div>
      </ScrollArea>
    </div>
  </TooltipProvider>
</template>