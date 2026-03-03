// /src/components/category-card/CategoryCard.vue

<script setup lang="ts">
import { JobSiteCard } from "@/components/job-site-card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ATSInfo } from "@/lib/ats-detection";
import type { JobCategory, Application, JobSite } from "@/types";

export interface Props {
  category: JobCategory;
  visitedCount: number;
  progress: number;
  maxHeight: number;
  getATS?: (site: JobSite) => ATSInfo | undefined;
  isSiteVisited: (url: string) => boolean;
  onVisit: (url: string) => void;
  onAddApplication?: (site: JobSite) => void;
  onManageApplications?: (site: JobSite) => void;
  getApplicationsForSite?: (siteId: string) => Application[];
}

defineProps<Props>();
</script>

<template>
  <section
    class="rounded-xl border border-border/50 bg-card text-card-foreground shadow-lg overflow-hidden backdrop-blur-sm"
  >
    <!-- Header -->
    <div
      class="bg-linear-to-r from-primary/5 to-primary/10 px-4 pt-3 pb-2 sm:px-6 sm:pt-4 sm:pb-2 border-b border-border/30"
    >
      <div class="flex items-center justify-between mb-2">
        <h2 class="text-lg sm:text-xl font-semibold tracking-tight">
          {{ category.name }}
        </h2>
        <span class="text-sm font-medium text-muted-foreground tabular-nums">
          {{ visitedCount }} / {{ category.sites.length }}
        </span>
      </div>
      <Progress :model-value="progress" class="h-1.5 bg-primary/10" />
    </div>

    <!-- Sites List -->
    <ScrollArea
      class="overflow-hidden bg-card/50"
      :style="{ height: `${maxHeight * 4.25}rem` }"
    >
      <div class="flex flex-col gap-2 px-4 pb-4 pt-2 sm:px-6 sm:pb-6 sm:pt-2">
        <JobSiteCard
          v-for="site in category.sites"
          :key="site.url"
          :site="site"
          :ats-info="getATS ? getATS(site) : undefined"
          :variant="isSiteVisited(site.url) ? 'visited' : 'default'"
          :on-visit="onVisit"
          :on-add-application="onAddApplication"
          :on-manage-applications="onManageApplications"
          :applications="
            getApplicationsForSite ? getApplicationsForSite(site.id) : []
          "
        />
      </div>
    </ScrollArea>
  </section>
</template>
