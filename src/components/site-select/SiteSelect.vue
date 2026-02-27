<!-- // /src/components/site-select/SiteSelect.vue -->

<script setup lang="ts">
import { computed, ref } from "vue";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { JobSite } from "@/types";

export interface SiteWithCategory extends JobSite {
  category?: string;
}

export interface Props {
  modelValue: string;
  sites: SiteWithCategory[];
  placeholder?: string;
  groupByCategory?: boolean;
  showAllOption?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "Select a site",
  groupByCategory: true,
  showAllOption: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const searchQuery = ref("");

// Filter and group sites
const groupedSites = computed(() => {
  const filtered = props.sites.filter(site =>
    site.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
  );

  if (!props.groupByCategory) {
    return [{ category: null, sites: filtered }];
  }

  const groups = new Map<string, SiteWithCategory[]>();

  filtered.forEach(site => {
    const category = site.category || "Other";
    if (!groups.has(category)) {
      groups.set(category, []);
    }
    groups.get(category)!.push(site);
  });

  return Array.from(groups.entries()).map(([category, sites]) => ({
    category,
    sites: sites.sort((a, b) => a.name.localeCompare(b.name)),
  }));
});

// Get the display label for the selected value
const selectedLabel = computed(() => {
  if (props.modelValue === "all") {
    return props.placeholder;
  }
  const site = props.sites.find(s => s.id === props.modelValue);
  return site?.name || props.placeholder;
});

const handleValueChange = (value: unknown) => {
  const stringValue = value != null ? String(value) : "all";
  emit("update:modelValue", stringValue);
  searchQuery.value = ""; // Reset search on selection
};
</script>

<template>
  <Select :model-value="modelValue" @update:model-value="handleValueChange">
    <SelectTrigger class="w-full h-9">
      <SelectValue :placeholder="placeholder">
        {{ selectedLabel }}
      </SelectValue>
    </SelectTrigger>
    <SelectContent>
      <!-- Search input -->
      <div class="px-2 py-1.5 border-b">
        <Input
          v-model="searchQuery"
          placeholder="Search sites..."
          class="h-8"
          @click.stop
          @keydown.stop
        />
      </div>

      <!-- All Sites option -->
      <SelectItem v-if="showAllOption" value="all">
        {{ placeholder }}
      </SelectItem>

      <!-- Grouped sites -->
      <template v-if="groupByCategory">
        <SelectGroup
          v-for="group in groupedSites"
          :key="group.category || 'ungrouped'"
        >
          <SelectLabel v-if="group.category">{{ group.category }}</SelectLabel>
          <SelectItem
            v-for="site in group.sites"
            :key="site.id"
            :value="site.id"
          >
            {{ site.name }}
          </SelectItem>
        </SelectGroup>
      </template>

      <!-- Ungrouped sites -->
      <template v-else>
        <SelectItem
          v-for="site in groupedSites[0]?.sites || []"
          :key="site.id"
          :value="site.id"
        >
          {{ site.name }}
        </SelectItem>
      </template>

      <!-- No results message -->
      <div
        v-if="groupedSites.every(g => g.sites.length === 0)"
        class="px-2 py-6 text-center text-sm text-muted-foreground"
      >
        No sites found
      </div>
    </SelectContent>
  </Select>
</template>
