<script setup lang="ts">
import { Progress } from "@/components/ui/progress";
import { useTitle, useTransition } from "@vueuse/core";
import { watchEffect } from "vue";

interface Props {
  title: string;
  visitedCount: number;
  totalSites: number;
  progress: number; // 0-100
  isComplete?: boolean;
}

const props = defineProps<Props>();

// Update browser tab title with progress
const pageTitle = useTitle();

watchEffect(() => {
  if (props.isComplete) {
    pageTitle.value = `✅ ${props.title}`;
  } else {
    pageTitle.value = `(${props.progress}%) ${props.title}`;
  }
});

const animatedProgress = useTransition(() => props.progress, {
  duration: 400,
});
</script>

<template>
  <header
    class="sticky top-0 z-10 bg-background border-b px-4 py-3 sm:px-6 md:py-4"
  >
    <div class="max-w-7xl mx-auto flex flex-col gap-2">
      <!-- Actions slot at the very top, right-aligned -->
      <div class="flex justify-end">
        <slot name="actions" />
      </div>

      <!-- Title + numeric progress / checkmark -->
      <div class="flex items-center justify-between mb-1">
        <h1 class="text-2xl sm:text-3xl font-bold">{{ props.title }}</h1>

        <div class="text-right">
          <p class="text-xs sm:text-sm text-muted-foreground">Progress</p>
          <p
            class="text-lg sm:text-xl font-bold flex items-center justify-end gap-1"
          >
            <template v-if="props.isComplete">✅</template>
            <template v-else
              >{{ props.visitedCount }} / {{ props.totalSites }}</template
            >
          </p>
        </div>
      </div>

      <!-- Progress bar (hidden if complete) -->
      <div v-if="!props.isComplete" class="flex items-center gap-3">
        <Progress :model-value="props.progress" class="flex-1 h-2" />
        <span
          v-if="props.progress < 100"
          class="text-sm font-semibold min-w-12 text-right"
        >
          {{ Math.round(animatedProgress) }}%
        </span>
      </div>

      <div class="flex justify-start">
        <slot name="alert" />
      </div>
    </div>
  </header>
</template>
