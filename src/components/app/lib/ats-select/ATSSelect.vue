<!-- // /src/components/app/lib/ats-select/ATSSelect.vue -->

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
  modelValue: ATSType | "all" | "";
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "Select ATS type",
  searchable: false,
  variant: "dropdown",
});

const emit = defineEmits<{
  "update:modelValue": [value: ATSType | "all" | ""];
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
    @update:model-value="
      emit(
        'update:modelValue',
        ($event === '__all__' ? 'all' : $event) as ATSType | 'all' | '',
      )
    "
  />
</template>
