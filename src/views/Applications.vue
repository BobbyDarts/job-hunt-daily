<!-- // /src/views/Applications.vue -->

<script setup lang="ts">
import {
  ArrowLeft,
  Plus,
  Search,
  X,
  Calendar,
  Building2,
} from "lucide-vue-next";
import { computed, ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { toast } from "vue-sonner";

import {
  AddApplicationDialog,
  ApplicationCard,
  EditApplicationDialog,
  StatusSelect,
} from "@/components/app/applications";
import { SiteSelect } from "@/components/app/sites";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { useApplications, useJobSites } from "@/composables/data";
import { useAddApplicationDialog } from "@/composables/ui";
import { comparePlainDate } from "@/lib/time";
import type { Application, ApplicationStatus } from "@/types";
import { getStatusInfo } from "@/types";

const router = useRouter();
const route = useRoute();
const { allSitesWithCategory } = useJobSites();
const {
  applications,
  addApplication,
  updateApplication,
  deleteApplication,
  totalCount,
  countByStatus,
  search: searchApplications,
} = useApplications();

// Filters - initialize from query params
const searchQuery = ref((route.query.search as string) || "");
const statusFilter = ref<ApplicationStatus | "all">(
  (route.query.status as ApplicationStatus) || "all",
);
const siteFilter = ref<string>((route.query.site as string) || "all");

// Watch route query params and update filters
watch(
  () => route.query,
  query => {
    searchQuery.value = (query.search as string) || "";
    statusFilter.value = (query.status as ApplicationStatus) || "all";
    siteFilter.value = (query.site as string) || "all";
  },
  { immediate: true },
);

// Watch filters and update URL (without navigation)
watch([searchQuery, statusFilter, siteFilter], ([search, status, site]) => {
  const query: Record<string, string> = {};

  if (search) query.search = search;
  if (status !== "all") query.status = status;
  if (site && site !== "all") query.site = site;

  // Use replace to update URL without adding to history
  if (JSON.stringify(query) !== JSON.stringify(route.query)) {
    router.replace({
      name: "Applications",
      query,
    });
  }
});

// Dialog states
const { open: isAddDialogOpen } = useAddApplicationDialog();
const isEditDialogOpen = ref(false);
const selectedApplication = ref<Application | null>(null);

// Sites that have applications (for filter dropdown)
const sitesWithApplications = computed(() => {
  const siteIds = new Set(applications.value.map(app => app.jobSiteId));
  return allSitesWithCategory.value.filter(site => siteIds.has(site.id));
});

// Filtered applications
const filteredApplications = computed(() => {
  let results = [...applications.value];

  // Filter by search query
  if (searchQuery.value) {
    results = searchApplications(searchQuery.value);
  }

  // Filter by status
  if (statusFilter.value !== "all") {
    results = results.filter(app => app.status === statusFilter.value);
  }

  // Filter by site (using jobSiteId)
  if (siteFilter.value !== "all") {
    results = results.filter(app => app.jobSiteId === siteFilter.value);
  }

  // Sort by most recent first
  return [...results].sort((a, b) =>
    comparePlainDate(b.appliedDate, a.appliedDate),
  );
});

// Group by company for better organization
const groupedApplications = computed(() => {
  const groups = new Map<string, Application[]>();

  filteredApplications.value.forEach(app => {
    if (!groups.has(app.company)) {
      groups.set(app.company, []);
    }
    groups.get(app.company)!.push(app);
  });

  return Array.from(groups.entries()).map(([company, apps]) => ({
    company,
    applications: apps,
    count: apps.length,
  }));
});

// Handlers
const handleAddApplication = async (
  data: Omit<Application, "id" | "createdAt" | "updatedAt">,
) => {
  await addApplication(data);
  toast.success("Application added successfully");
};

const handleEditApplication = (app: Application) => {
  selectedApplication.value = app;
  isEditDialogOpen.value = true;
};

const handleUpdateApplication = async (
  updates: Partial<Omit<Application, "id" | "createdAt">>,
) => {
  if (!selectedApplication.value) return;

  const updated = await updateApplication(
    selectedApplication.value.id,
    updates,
  );
  if (updated) {
    toast.success("Application updated successfully");
  } else {
    toast.error("Failed to update application");
  }
};

const handleDeleteApplication = async (id: string) => {
  const deleted = await deleteApplication(id);
  if (deleted) {
    toast.success("Application deleted successfully");
  } else {
    toast.error("Failed to delete application");
  }
};

const clearFilters = () => {
  searchQuery.value = "";
  statusFilter.value = "all";
  siteFilter.value = "all";
  // URL will be updated automatically by the watch
};

const hasActiveFilters = computed(() => {
  return (
    !!searchQuery.value ||
    statusFilter.value !== "all" ||
    siteFilter.value !== "all"
  );
});
</script>

<template>
  <!-- Page Header -->
  <div class="border-b bg-card">
    <div class="mx-auto px-4 py-3 max-w-7xl">
      <!-- Top Row -->
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            @click="router.push('/')"
            aria-label="Back to home"
          >
            <ArrowLeft class="size-4" />
          </Button>

          <h1 class="text-xl font-semibold">Applications</h1>
        </div>

        <Button size="sm" @click="isAddDialogOpen = true">
          <Plus class="size-4 mr-1" />
          <span class="hidden sm:inline">Add</span>
        </Button>
      </div>

      <!-- Filters + Stats (Merged Row) -->
      <div class="flex flex-wrap items-center gap-2">
        <!-- Search -->
        <div class="relative w-64 shrink-0">
          <Search
            class="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground"
          />
          <Input
            v-model="searchQuery"
            placeholder="Search..."
            class="pl-8 h-9"
          />
        </div>

        <!-- Status Filter -->
        <div class="w-36 shrink-0">
          <StatusSelect
            v-model="statusFilter"
            placeholder="All Statuses"
            show-all-option
          />
        </div>

        <!-- Site Filter + Clear -->
        <div class="flex items-center gap-1">
          <div class="w-40">
            <SiteSelect
              v-model="siteFilter"
              :sites="sitesWithApplications"
              placeholder="All Sites"
              :group-by-category="false"
              show-all-option
            />
          </div>

          <Button
            v-if="hasActiveFilters"
            variant="outline"
            size="icon"
            class="size-9 shrink-0"
            @click="clearFilters"
            aria-label="Clear filters"
          >
            <X class="size-4" />
          </Button>
        </div>

        <!-- Spacer -->
        <div class="flex-1 hidden md:block" />

        <!-- Stats Badges -->
        <div class="flex items-center gap-2 text-xs">
          <!-- Total Applications Badge -->
          <Tooltip>
            <TooltipTrigger as-child>
              <div
                class="flex items-center gap-1 px-2 py-1 rounded-md bg-muted text-muted-foreground"
              >
                <Building2 class="size-3" />
                {{ filteredApplications.length }} / {{ totalCount }}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                Showing {{ filteredApplications.length }} of
                {{ totalCount }} total applications
              </p>
            </TooltipContent>
          </Tooltip>

          <!-- Status Badges -->
          <Tooltip v-for="(count, status) in countByStatus" :key="status">
            <TooltipTrigger as-child>
              <div
                class="flex items-center gap-1 px-2 py-1 rounded-md bg-muted"
              >
                <span
                  class="size-2 rounded-full"
                  :class="getStatusInfo(status).color.split(' ')[0]"
                />
                {{ count }}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {{ getStatusInfo(status).label }}: {{ count }} application{{
                  count === 1 ? "" : "s"
                }}
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  </div>

  <!-- Applications List -->
  <div class="mx-auto px-4 pt-4 max-w-7xl">
    <!-- Empty State -->
    <div
      v-if="filteredApplications.length === 0"
      class="flex flex-col items-center justify-center py-10 text-center"
    >
      <Calendar class="size-10 text-muted-foreground mb-3" />
      <h3 class="text-base font-semibold mb-1">
        {{ totalCount === 0 ? "No applications yet" : "No applications found" }}
      </h3>
      <p class="text-sm text-muted-foreground mb-4">
        {{
          totalCount === 0
            ? "Start tracking your job applications"
            : "Try adjusting your filters"
        }}
      </p>

      <Button v-if="totalCount === 0" size="sm" @click="isAddDialogOpen = true">
        <Plus class="size-4 mr-1" />
        Add Application
      </Button>

      <Button v-else size="sm" variant="outline" @click="clearFilters">
        Clear Filters
      </Button>
    </div>

    <!-- Grouped by Company -->
    <div v-else class="space-y-4">
      <div
        v-for="group in groupedApplications"
        :key="group.company"
        class="space-y-2"
      >
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold">{{ group.company }}</h3>
          <span class="text-xs text-muted-foreground">
            {{ group.count }}
          </span>
        </div>

        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <ApplicationCard
            v-for="app in group.applications"
            :key="app.id"
            :application="app"
            @edit="handleEditApplication(app)"
            @delete="handleDeleteApplication(app.id)"
          />
        </div>
      </div>
    </div>
  </div>

  <!-- Dialogs -->
  <AddApplicationDialog
    v-model:open="isAddDialogOpen"
    :site="null"
    @submit="handleAddApplication"
  />

  <EditApplicationDialog
    v-model:open="isEditDialogOpen"
    :application="selectedApplication"
    @submit="handleUpdateApplication"
  />
</template>
