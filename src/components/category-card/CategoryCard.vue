// /src/components/category-card/CategoryCard.vue

<script setup lang="ts">
import { computed } from "vue";

import { JobSiteCard } from "@/components/job-site-card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ATSInfo } from "@/lib/ats-detection";
import type { JobCategory, JobSite, Application } from "@/types";

export interface Props {
  category: JobCategory;
  splitSites: {
    unvisited: JobSite[];
    visited: JobSite[];
  };
  progress: number;
  maxHeight: number;
  getATS?: (site: JobSite) => ATSInfo | undefined;
  isSiteVisited: (url: string) => boolean;
  onVisit: (url: string) => void;
  onAddApplication?: (site: JobSite) => void;
  onManageApplications?: (site: JobSite) => void;
  getApplicationsForSite?: (siteId: string) => Application[];
  getCategoryProgress: (category: JobCategory) => number;
}

const props = defineProps<Props>();

const unvisitedSites = computed(() => props.splitSites.unvisited);
const visitedSites = computed(() => props.splitSites.visited);
</script>

<template>
  <Tabs default-value="unvisited">
    <section
      class="rounded-xl border border-border/50 bg-card text-card-foreground shadow-lg overflow-hidden backdrop-blur-sm"
    >
      <!-- Header -->
      <div
        class="bg-linear-to-r from-primary/5 to-primary/10 px-4 pt-3 pb-1 sm:px-6 sm:pt-4 sm:pb-1.5 border-b border-border/30"
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
          :model-value="getCategoryProgress(category)"
          class="h-1.5 bg-primary/10"
        />

        <div class="flex justify-end mt-1 leading-none">
          <TabsList class="h-7 px-1 py-0 gap-0.5 bg-muted/40">
            <TabsTrigger
              v-if="visitedSites.length > 0"
              value="unvisited"
              class="h-6 px-2 text-xs leading-none"
            >
              Unvisited
            </TabsTrigger>
            <TabsTrigger
              v-if="visitedSites.length > 0"
              value="visited"
              class="h-6 px-2 text-xs leading-none"
            >
              Visited
            </TabsTrigger>
          </TabsList>
        </div>
      </div>

      <!-- Sites List -->
      <ScrollArea
        class="overflow-hidden bg-card/50"
        :style="{ height: `${maxHeight * 4.25}rem` }"
      >
        <div
          class="flex flex-col gap-2 px-4 pb-4 pt-1 sm:px-6 sm:pb-6 sm:pt-1.5"
        >
          <TabsContent value="unvisited" class="flex flex-col gap-2">
            <JobSiteCard
              v-for="site in unvisitedSites"
              :key="site.url"
              :site="site"
              :ats-info="getATS ? getATS(site) : undefined"
              :on-visit="onVisit"
              :on-add-application="onAddApplication"
              :on-manage-applications="onManageApplications"
              :applications="
                getApplicationsForSite ? getApplicationsForSite(site.id) : []
              "
            />
          </TabsContent>
          <TabsContent value="visited" class="flex flex-col gap-1.5 opacity-90">
            <JobSiteCard
              v-for="site in visitedSites"
              :key="site.url"
              :site="site"
              :ats-info="getATS ? getATS(site) : undefined"
              variant="visited"
              :on-visit="onVisit"
              :on-add-application="onAddApplication"
              :on-manage-applications="onManageApplications"
              :applications="
                getApplicationsForSite ? getApplicationsForSite(site.id) : []
              "
            />
          </TabsContent>
        </div>
      </ScrollArea>
    </section>
  </Tabs>
</template>
