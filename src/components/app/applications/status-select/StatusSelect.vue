<!-- // /src/components/app/applications/status-select/StatusSelect.vue -->

<script setup lang="ts">
import { computed } from "vue";

import { BaseSelect } from "@/components/app/lib";
import {
  type BaseSelectOption,
  type BaseSelectProps,
} from "@/components/app/lib";
import type { ApplicationStatus } from "@/types";
import { getStatuses } from "@/types";

export interface Props extends Partial<BaseSelectProps> {
  modelValue: ApplicationStatus | "all";
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "Select a status",
  searchable: true,
  variant: "dropdown",
});

const emit = defineEmits<{
  "update:modelValue": [value: ApplicationStatus | "all"];
}>();

const options = computed<BaseSelectOption[]>(() =>
  getStatuses().map(s => ({
    value: s.status,
    label: s.label,
    description: s.description,
    color: s.color,
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
        ($event === '__all__' ? 'all' : $event) as ApplicationStatus | 'all',
      )
    "
  />
</template>
