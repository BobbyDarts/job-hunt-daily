<!-- // /src/components/app/lib/ats-select/ATSMultiSelect.vue -->

<script setup lang="ts">
import { computed } from "vue";

import {
  BaseSelect,
  type BaseSelectOption,
  type BaseSelectProps,
} from "@/components/app/lib";
import { ATS_TABLE } from "@/lib/ats-detection";
import type { ATSType } from "@/types";

export interface Props extends Partial<BaseSelectProps> {
  modelValue: ATSType[];
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "Select ATS types",
  searchable: false,
  variant: "dropdown",
  multiple: true,
});

const emit = defineEmits<{
  "update:modelValue": [value: ATSType[]];
}>();

const options = computed<BaseSelectOption[]>(() =>
  ATS_TABLE.map(t => ({
    value: t.type,
    label: t.type,
  })),
);

const baseProps = computed(() => ({ ...props }));
</script>

<template>
  <BaseSelect
    v-bind="baseProps"
    :options="options"
    @update:model-value="emit('update:modelValue', $event as ATSType[])"
  />
</template>
