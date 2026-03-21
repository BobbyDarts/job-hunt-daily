<!-- // /src/components/app/lib/CategoryMultiSelect.vue -->

<script setup lang="ts">
import { computed } from "vue";

import {
  BaseSelect,
  type BaseSelectOption,
  type BaseSelectProps,
} from "@/components/app/lib";
import { useJobSites } from "@/composables/data";

export interface Props extends Partial<BaseSelectProps> {
  modelValue: string[];
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "Select categories",
  searchable: true,
  variant: "dropdown",
  multiple: true,
});

const emit = defineEmits<{
  "update:modelValue": [value: string[]];
}>();

const { categories } = useJobSites();

const options = computed<BaseSelectOption[]>(() =>
  categories.value.map(c => ({
    value: c.id,
    label: c.name,
    description: c.description,
  })),
);

const baseProps = computed(() => ({ ...props }));
</script>

<template>
  <BaseSelect
    v-bind="baseProps"
    :options="options"
    @update:model-value="emit('update:modelValue', $event as string[])"
  />
</template>
