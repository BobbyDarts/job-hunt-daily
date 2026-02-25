// /src/App.vue

<script setup lang="ts">
import { useColorMode, useOnline } from "@vueuse/core";
import { Sun, Moon, Upload, Download, FolderOpen } from "lucide-vue-next";
import { computed, watch } from "vue";
import { RouterLink } from "vue-router";
import { Toaster, toast } from "vue-sonner";
import "vue-sonner/style.css";

import { Header } from "@/components/header";
import { MenuToggle } from "@/components/menu-toggle";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useDataManagement } from "@/composables/use-data-management";
import { useVisitedSites } from "@/composables/use-visited-sites";
import jobData from "@/data/job-hunt-daily.json";
import type { JobHuntData } from "@/types";

const data = jobData as JobHuntData;

// Total sites count
const totalSites = computed(() => {
  return data.categories.reduce((sum, cat) => sum + cat.sites.length, 0);
});

// Composables
const visitedComposable = useVisitedSites({ totalSites });
const { visitedCount, isComplete } = visitedComposable;

// Progress computed from visitedCount
const progress = computed(() => {
  if (totalSites.value === 0) return 0;
  return Math.round((visitedCount.value / totalSites.value) * 100);
});

const colorMode = useColorMode();

const toggleTheme = () => {
  colorMode.value = colorMode.value === "dark" ? "light" : "dark";
};

const { exportAllData, triggerImport } = useDataManagement({ totalSites });

const isOnline = useOnline();
watch(isOnline, online => {
  if (online) {
    toast.success("You're back online!");
  } else {
    toast.error("You're offline. Some features may not work.");
  }
});
</script>

<template>
  <Toaster
    :duration="5000"
    :close-button="true"
    close-button-position="top-right"
    position="bottom-right"
    :theme="colorMode === 'auto' ? 'dark' : colorMode"
  />
  <TooltipProvider>
    <div class="h-screen bg-background flex flex-col overflow-hidden">
      <!-- Fixed Header -->
      <Header
        title="Job Hunt Daily"
        :visited-count="visitedCount"
        :total-sites="totalSites"
        :progress="progress"
        :is-complete="isComplete"
        :is-online="isOnline"
      >
        <!-- Add theme toggle to header actions slot -->
        <template #actions>
          <DropdownMenu v-slot="{ open }">
            <DropdownMenuTrigger as-child>
              <MenuToggle :open="open" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" class="w-48">
              <DropdownMenuGroup>
                <DropdownMenuLabel class="text-xs text-muted-foreground"
                  >Account</DropdownMenuLabel
                >
                <DropdownMenuItem as-child>
                  <RouterLink to="/applications" class="flex items-center">
                    <FolderOpen class="mr-2 size-4" />
                    My Applications
                  </RouterLink>
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuLabel class="text-xs text-muted-foreground"
                  >Data</DropdownMenuLabel
                >
                <DropdownMenuItem @click="triggerImport">
                  <Upload class="mr-2 size-4" />
                  Import…
                </DropdownMenuItem>

                <DropdownMenuItem @click="exportAllData">
                  <Download class="mr-2 size-4" />
                  Export…
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuLabel class="text-xs text-muted-foreground"
                  >Appearance</DropdownMenuLabel
                >
                <DropdownMenuItem @select.prevent @click="toggleTheme">
                  <Sun v-if="colorMode === 'dark'" class="mr-2 size-4" />
                  <Moon v-else class="mr-2 size-4" />
                  Theme
                  <span class="ml-auto text-xs text-muted-foreground">
                    {{ colorMode === "dark" ? "Dark" : "Light" }}
                  </span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </template>
      </Header>

      <!-- Scrollable Content with ScrollArea -->
      <ScrollArea class="flex-1 overflow-y-auto h-full">
        <div class="pb-24">
          <router-view />
        </div>
      </ScrollArea>
    </div>
  </TooltipProvider>
</template>
