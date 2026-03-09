// /src/views/Home.vue

<script setup lang="ts">
import { useRouter } from "vue-router";
import { toast } from "vue-sonner";

import { AddApplicationDialog } from "@/components/app/applications/add-application-dialog";
import { CategoryCard } from "@/components/app/sites/category-card";
import { useCategoryProgress } from "@/composables/dashboard";
import {
  useApplications,
  useATSDetection,
  useVisitedSites,
} from "@/composables/data";
import { useAddApplicationDialog } from "@/composables/ui";
import type { JobSite, Application } from "@/types";

// Composables
const router = useRouter();
const { markVisited, isSiteVisited } = useVisitedSites();
const {
  sortedCategories,
  getCategoryProgress,
  getCategoryVisitedCount,
  maxCategoryHeight,
} = useCategoryProgress();
const { getATS } = useATSDetection();
const { addApplication, applications } = useApplications();
const {
  open: isAddApplicationDialogOpen,
  site: selectedSite,
  openDialog,
} = useAddApplicationDialog();

// Handle site click
const handleSiteClick = (url: string) => {
  markVisited(url);
  window.open(url, "_blank", "noopener,noreferrer");
};

// Handler for "Add Application" button
const handleAddApplication = (site: JobSite) => {
  openDialog(site);
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
        :visited-count="getCategoryVisitedCount(category)"
        :progress="getCategoryProgress(category)"
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

  <!-- Add Application Dialog -->
  <AddApplicationDialog
    v-model:open="isAddApplicationDialogOpen"
    :site="selectedSite"
    @submit="handleApplicationSubmit"
  />
</template>
