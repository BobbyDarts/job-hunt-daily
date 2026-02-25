// /src/views/Home.vue

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { toast } from "vue-sonner";

import { AddApplicationDialog } from "@/components/add-application-dialog";
import { CategoryCard } from "@/components/category-card";
import { useApplications } from "@/composables/use-applications";
import { useATSDetection } from "@/composables/use-ats-detection";
import { useCategoryProgress } from "@/composables/use-category-progress";
import { useVisitedSites } from "@/composables/use-visited-sites";
import jobData from "@/data/job-hunt-daily.json";
import type { JobSite, Application, JobHuntData } from "@/types";

const data = jobData as JobHuntData;
const router = useRouter();

// Total sites count
const totalSites = computed(() => {
  return data.categories.reduce((sum, cat) => sum + cat.sites.length, 0);
});

// Composables
const visitedComposable = useVisitedSites({ totalSites });
const categoryComposable = useCategoryProgress(
  data,
  visitedComposable.isSiteVisited,
);
const atsComposable = useATSDetection();

// Convenience for template
const { markVisited, isSiteVisited } = visitedComposable;
const {
  sortedCategories,
  splitCategorySites,
  getCategoryProgress,
  maxCategoryHeight,
} = categoryComposable;
const { getATS } = atsComposable;

// Add applications composable
const { addApplication, applications } = useApplications();

// Modal state
const isAddApplicationDialogOpen = ref(false);
const selectedSite = ref<JobSite | null>(null);

// Handle site click
const handleSiteClick = (url: string) => {
  markVisited(url);
  window.open(url, "_blank", "noopener,noreferrer");
};

// Handler for "Add Application" button
const handleAddApplication = (site: JobSite) => {
  selectedSite.value = site;
  isAddApplicationDialogOpen.value = true;
};

// Handler for "Manage Applications" button
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

// Get applications for a specific site (by ID)
const getApplicationsForSite = (siteId: string) => {
  return applications.value.filter(app => app.jobSiteId === siteId);
};

const handleApplicationSubmit = (
  data: Omit<Application, "id" | "createdAt" | "updatedAt">,
) => {
  addApplication(data);
  toast.success("Application added successfully");
};
</script>

<template>
  <div class="px-4 pt-4 sm:px-6 sm:pt-6">
    <div
      class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6"
    >
      <CategoryCard
        v-for="category in sortedCategories"
        :key="category.name"
        :category="category"
        :split-sites="splitCategorySites(category)"
        :progress="getCategoryProgress(category)"
        :max-height="maxCategoryHeight"
        :get-a-t-s="getATS"
        :is-site-visited="isSiteVisited"
        :on-visit="handleSiteClick"
        :on-add-application="handleAddApplication"
        :on-manage-applications="handleManageApplications"
        :get-applications-for-site="getApplicationsForSite"
        :get-category-progress="getCategoryProgress"
      />
    </div>
  </div>

  <!-- Add Application Dialog -->
  <AddApplicationDialog
    v-model:open="isAddApplicationDialogOpen"
    :site="selectedSite"
    @submit="handleApplicationSubmit"
  />
</template>
