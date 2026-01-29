<script setup lang="ts">
import { JobSiteButton } from "@/components/job-site-button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ATSInfo } from "@/lib/ats-detection";
import type { JobCategory } from "@/types";
import { computed } from "vue";

interface Props {
  category: JobCategory;
  maxHeightRem: number;
  isSiteVisited: (url: string) => boolean;
  onSiteClick: (url: string) => void;
  getCategoryProgress: (category: JobCategory) => number;
  splitCategorySites: (category: JobCategory) => {
    unvisited: typeof category.sites;
    visited: typeof category.sites;
  };
  getATS?: (site: (typeof props.category.sites)[number]) => ATSInfo | undefined;
}

const props = defineProps<Props>();

const unvisitedSites = computed(
  () => props.splitCategorySites(props.category).unvisited,
);
const visitedSites = computed(
  () => props.splitCategorySites(props.category).visited,
);
</script>

<template>
  <section
    class="rounded-xl border border-border/50 bg-card text-card-foreground shadow-lg overflow-hidden backdrop-blur-sm"
  >
    <!-- Header -->
    <div
      class="bg-linear-to-r from-primary/5 to-primary/10 px-4 py-3 sm:px-6 sm:py-4 border-b border-border/30"
    >
      <div class="flex items-center justify-between mb-2">
        <h2 class="text-lg sm:text-xl font-semibold tracking-tight">
          {{ category.name }}
        </h2>
        <span class="text-sm font-medium text-muted-foreground tabular-nums">
          {{ visitedSites.length }} / {{ category.sites.length }}
        </span>
      </div>

      <Progress
        :model-value="props.getCategoryProgress(props.category)"
        class="h-1.5 bg-primary/10"
      />
    </div>

    <!-- Sites List -->
    <ScrollArea
      class="overflow-hidden bg-card/50"
      :style="{ height: `${props.maxHeightRem * 4.25}rem` }"
    >
      <div class="flex flex-col gap-2 p-4 sm:p-6 pt-3">
        <!-- Unvisited sites first -->
        <JobSiteButton
          v-for="site in unvisitedSites"
          :key="site.url"
          :site="site"
          :ats-info="props.getATS ? props.getATS(site) : undefined"
          @click="props.onSiteClick"
        />

        <!-- Visited sites at the bottom -->
        <JobSiteButton
          v-for="site in visitedSites"
          :key="site.url"
          :site="site"
          :ats-info="props.getATS ? props.getATS(site) : undefined"
          variant="visited"
          @click="props.onSiteClick"
        />
      </div>
    </ScrollArea>
  </section>
</template>
