<!-- // /src/components/app/shell/header/Header.vue -->

<script setup lang="ts">
import { WifiOff } from "@lucide/vue"; // or your existing icon
import { useTitle } from "@vueuse/core";
import { computed, watchEffect } from "vue";
import { useRoute, RouterLink } from "vue-router";

import logo from "@/assets/logo.svg";
import { Progress } from "@/components/ui/progress";

export interface Props {
  title: string;
  visitedCount: number;
  totalSites: number;
  progress: number; // 0-100
  isComplete?: boolean;
  isOnline?: boolean;
}

const props = defineProps<Props>();

// Update browser tab title with progress
const pageTitle = useTitle();

const route = useRoute();
const isHome = computed(() => route.name === "Home");

watchEffect(() => {
  if (props.isComplete) {
    pageTitle.value = `✅ ${props.title}`;
  } else {
    pageTitle.value = `(${props.progress}%) ${props.title}`;
  }
});
</script>

<template>
  <header class="sticky top-0 z-10 bg-background border-b px-4 py-2 sm:px-6">
    <div class="max-w-7xl mx-auto flex flex-col">
      <!-- Row 1: Logo + Actions -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <RouterLink v-if="!isHome" to="/">
            <img :src="logo" alt="Job Hunt Daily" class="h-8 w-auto sm:h-9" />
          </RouterLink>
          <img
            v-else
            :src="logo"
            alt="Job Hunt Daily"
            class="h-8 w-auto sm:h-9"
          />
          <WifiOff
            v-if="!props.isOnline"
            class="size-5 text-destructive"
            aria-label="Offline"
          />
        </div>

        <div class="flex items-center">
          <slot name="actions" />
        </div>
      </div>

      <!-- Row 2: Progress bar -->
      <div v-if="!props.isComplete" class="mt-2">
        <Progress
          :model-value="props.progress"
          class="w-full h-1 rounded-full"
        />
      </div>
    </div>
  </header>
</template>
