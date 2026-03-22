<!-- // /src/views/Home.vue -->

<script setup lang="ts">
import { useRouter } from "vue-router";

import { CategoryCard } from "@/components/app/sites";
import { useCategoryProgress } from "@/composables/dashboard";
import {
  useApplications,
  useATSDetection,
  useVisitedSites,
} from "@/composables/data";
import { useAddApplicationDialog } from "@/composables/ui";
import type { JobSite } from "@/types";

// Composables
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
const { openDialog } = useAddApplicationDialog();

const handleSiteClick = (url: string) => {
  markVisited(url);
  window.open(url, "_blank", "noopener,noreferrer");
};

const handleAddApplication = (site: JobSite) => {
  openDialog(site);
};

const handleManageApplications = async (site: JobSite) => {
  try {
    await router.push({
      name: "Applications",
      query: { site: site.id },
    });
  } catch (err) {
    // Handle navigation errors (e.g., navigating to same route, navigation cancelled)
    console.error("Navigation error:", err);
  }
};

const getApplicationsForSite = (siteId: string) => {
  return applications.value.filter(app => app.jobSiteId === siteId);
};
</script>

<template>
  <div class="px-4 pt-4 sm:px-6 sm:pt-6">
    <div
      class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6"
    >
      <CategoryCard
        v-for="stat in categoryStats"
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
