<!-- // /src/views/Applications.vue -->

<script setup lang="ts">
import { ArrowLeft, Plus, Search, Calendar, Building2 } from "@lucide/vue";
import { computed, reactive, ref } from "vue";
import { useRouter } from "vue-router";

import {
  ApplicationCard,
  EditApplicationDialog,
  StatusSelect,
} from "@/components/app/applications";
import { DataToolbar } from "@/components/app/lib";
import { SiteSelect } from "@/components/app/sites";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { useApplications, useJobSites } from "@/composables/data";
import { useQuerySync, useToolbarState } from "@/composables/lib";
import { useAddApplicationDialog } from "@/composables/ui";
import { comparePlainDate } from "@/lib/time";
import type { Application, ApplicationStatus } from "@/types";
import { getStatuses, getStatusInfo } from "@/types";

type ApplicationFilters = {
  search: string;
  status: ApplicationStatus | "all";
  site: string | "all";
};

// composables
const router = useRouter();
const { allSitesWithCategory } = useJobSites();
const {
  applications,
  totalCount,
  countByStatus,
  search: searchApplications,
} = useApplications();

// reactive filters
const filters = reactive<ApplicationFilters>({
  search: "",
  status: "all",
  site: "all",
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
  if (filters.search) {
    results = searchApplications(filters.search);
  }

  // Filter by status
  if (filters.status !== "all") {
    results = results.filter(app => app.status === filters.status);
  }

  // Filter by site (using jobSiteId)
  if (filters.site !== "all") {
    results = results.filter(app => app.jobSiteId === filters.site);
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
const handleEditApplication = (app: Application) => {
  selectedApplication.value = app;
  isEditDialogOpen.value = true;
};

// -----------------------------
// Sync filters with URL
// -----------------------------
const APPLICATION_STATUSES = new Set(getStatuses().map(s => s.status));

useQuerySync({
  state: filters,
  toQuery: f => {
    const q: Record<string, string> = {};
    if (f.search) q.search = f.search;
    if (f.status && f.status !== "all") q.status = f.status;
    if (f.site && f.site !== "all") q.site = f.site;
    return q;
  },
  fromQuery: q => {
    const rawStatus = (
      Array.isArray(q.status) ? q.status[0] : q.status
    ) as ApplicationStatus;

    return {
      search: Array.isArray(q.search) ? (q.search[0] ?? "") : (q.search ?? ""),
      status: APPLICATION_STATUSES.has(rawStatus) ? rawStatus : "all",
      site: (Array.isArray(q.site) ? q.site[0] : q.site) ?? "all",
    };
  },
});

const { hasActiveFilters, clear } = useToolbarState(filters);
</script>

<template>
  <!-- Page Header -->
  <div class="border-b bg-card">
    <div class="mx-auto px-4 py-3 max-w-7xl">
      <!-- Top Row -->
      <DataToolbar :has-active-filters="hasActiveFilters" @clear="clear">
        <template #back>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Back to home"
            @click="router.push('/')"
          >
            <ArrowLeft class="size-4" />
          </Button>
        </template>

        <template #title>
          <h1 class="text-xl font-semibold">Applications</h1>
        </template>

        <template #filters>
          <div class="relative w-64 shrink-0">
            <Search
              class="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground"
            />
            <Input
              v-model="filters.search"
              placeholder="Search..."
              class="pl-8 h-9"
            />
          </div>

          <div class="w-36 shrink-0">
            <StatusSelect
              v-model="filters.status"
              placeholder="All Statuses"
              show-all-option
            />
          </div>

          <div class="w-40 shrink-0">
            <SiteSelect
              v-model="filters.site"
              :sites="sitesWithApplications"
              placeholder="All Sites"
              :group-by-category="false"
              show-all-option
            />
          </div>
        </template>

        <template #actions>
          <Button size="sm" @click="isAddDialogOpen = true">
            <Plus class="size-4 mr-1" />
            <span class="hidden sm:inline">Add</span>
          </Button>
        </template>

        <template #stats>
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
        </template>
      </DataToolbar>
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

      <Button v-else size="sm" variant="outline" @click="clear">
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
          />
        </div>
      </div>
    </div>
  </div>

  <!-- Dialogs -->
  <EditApplicationDialog
    v-model:open="isEditDialogOpen"
    :application="selectedApplication"
  />
</template>
