<!-- // /src/App.vue -->

<script setup lang="ts">
import { useOnline } from "@vueuse/core";
import { computed, watch } from "vue";
import { Toaster, toast } from "vue-sonner";
import "vue-sonner/style.css";

import { GlobalDialogs, Header, HeaderActions } from "@/components/app/shell";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useJobSites, useVisitedSites } from "@/composables/data";
import { useKeyboardShortcuts } from "@/composables/keyboard";
import { useTheme } from "@/composables/ui";

// Composables
const isOnline = useOnline();

const { totalSites } = useJobSites();
const { visitedCount, isComplete } = useVisitedSites();
const { themeMode } = useTheme();
useKeyboardShortcuts();

// Computed
const progress = computed(() => {
  if (totalSites.value === 0) return 0;
  return Math.round((visitedCount.value / totalSites.value) * 100);
});

// Watchers
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
    :theme="themeMode"
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
        <template #actions>
          <HeaderActions />
        </template>
      </Header>

      <!-- Scrollable Content with ScrollArea -->
      <ScrollArea class="flex-1 overflow-y-auto h-full">
        <div class="pb-24">
          <router-view />
        </div>
      </ScrollArea>
    </div>
    <GlobalDialogs />
  </TooltipProvider>
</template>
