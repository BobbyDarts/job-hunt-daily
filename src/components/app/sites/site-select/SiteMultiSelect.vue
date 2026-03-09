<!-- // /src/components/app/sites/site-select/SiteMultiSelect.vue -->

<script setup lang="ts">
import { computed } from "vue";

import { BaseSelect } from "@/components/app/lib";
import {
  type BaseSelectOption,
  type BaseSelectProps,
} from "@/components/app/lib";
import type { SiteWithCategory } from "@/components/app/sites/site-select";

export interface Props extends Partial<BaseSelectProps> {
  modelValue: string[];
  sites: SiteWithCategory[];
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "Select a site",
  groupByCategory: true,
  showAllOption: false,
  searchable: true,
  variant: "dropdown",
  multiple: true,
});

const emit = defineEmits<{
  "update:modelValue": [value: string[]];
}>();

const options = computed<BaseSelectOption[]>(() =>
  props.sites.map(site => ({
    value: site.id,
    label: site.name,
    category: site.category,
  })),
);

const baseProps = computed(() => {
  const { sites: _sites, ...rest } = props;
  return rest;
});
</script>

<template>
  <BaseSelect
    v-bind="baseProps"
    :options="options"
    @update:model-value="emit('update:modelValue', $event as string[])"
  />
</template>
