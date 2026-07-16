<!-- // /src/components/app/lib/environment-badge/EnvironmentBadge.vue -->

<script setup lang="ts">
import { environment } from "@/lib/environment";
</script>

<template>
  <div
    class="flex items-center gap-2 rounded-md border px-2 py-1 text-xs font-medium"
  >
    <span>{{ environment.deployment }}</span>
    <span>•</span>
    <span>v{{ environment.version }}</span>
  </div>
</template>
