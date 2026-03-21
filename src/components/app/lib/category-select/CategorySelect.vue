<!-- // /src/components/app/lib/CategorySelect.vue -->

<script setup lang="ts">
import { computed } from "vue";

import {
  BaseSelect,
  type BaseSelectOption,
  type BaseSelectProps,
} from "@/components/app/lib";
import { useJobSites } from "@/composables/data";

export interface Props extends Partial<BaseSelectProps> {
  modelValue: string | "all";
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "Select a category",
  searchable: true,
  variant: "dropdown",
});

const emit = defineEmits<{
  "update:modelValue": [value: string | "all"];
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
    @update:model-value="
      emit(
        'update:modelValue',
        ($event === '__all__' ? 'all' : $event) as string | 'all',
      )
    "
  />
</template>
