<!-- // /src/components/command-palette/CommandPaletteSites.vue -->

<script setup lang="ts">
import { Globe } from "lucide-vue-next";
import { computed } from "vue";

import {
  CommandGroup,
  CommandItem,
  CommandSeparator,
  useCommand,
} from "@/components/ui/command";
import { useJobData } from "@/composables/use-job-data";
import { useVisitedSites } from "@/composables/use-visited-sites";

const emit = defineEmits<{
  siteSelect: [url: string];
}>();

const { filterState } = useCommand();
const { allSitesWithCategory } = useJobData();
const { markVisited } = useVisitedSites();

const matchingSites = computed(() => {
  if (!filterState.search.trim()) return [];
  const q = filterState.search.toLowerCase();
  return allSitesWithCategory.value.filter(
    site =>
      site.name.toLowerCase().includes(q) ||
      site.category.toLowerCase().includes(q),
  );
});

function handleSiteSelect(url: string) {
  markVisited(url);
  window.open(url, "_blank", "noopener,noreferrer");
  emit("siteSelect", url);
}
</script>

<template>
  <template v-if="matchingSites.length">
    <CommandSeparator />
    <CommandGroup heading="Sites">
      <CommandItem
        v-for="site in matchingSites"
        :key="site.id"
        :value="site.id"
        @select="handleSiteSelect(site.url)"
      >
        <Globe class="mr-2 size-4" />
        <span>{{ site.name }}</span>
        <span class="ml-auto text-xs text-muted-foreground">{{
          site.category
        }}</span>
      </CommandItem>
    </CommandGroup>
  </template>
</template>
