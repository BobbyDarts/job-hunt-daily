<!-- /src/components/app/applications/tags-multi-select/TagsMultiSelect.vue -->

<script setup lang="ts">
import { computed } from "vue";

import { BaseSelect } from "@/components/app/lib";
import {
  type BaseSelectOption,
  type BaseSelectProps,
} from "@/components/app/lib";
import type { ApplicationTag } from "@/types";
import { getTags } from "@/types";

export interface Props extends Partial<BaseSelectProps> {
  modelValue: ApplicationTag[];
}

const props = withDefaults(defineProps<Props>(), {
  multiple: true,
  groupByCategory: true,
});

const emit = defineEmits<{
  "update:modelValue": [value: ApplicationTag[]];
}>();

const options = computed<BaseSelectOption[]>(() =>
  getTags().map(({ tag, label, color, category }) => ({
    value: tag,
    label,
    color,
    category,
  })),
);

const baseProps = computed(() => ({ ...props }));
</script>

<template>
  <BaseSelect
    v-bind="baseProps"
    :options="options"
    @update:model-value="emit('update:modelValue', $event as ApplicationTag[])"
  />
</template>
