<!-- // /src/components/status-select/StatusSelect.vue -->

<script setup lang="ts">
import { computed } from "vue";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ApplicationStatus } from "@/types";
import { getStatuses } from "@/types";

export interface Props {
  modelValue: ApplicationStatus | "all";
  placeholder?: string;
  showAllOption?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "Select status",
  showAllOption: false,
});

// Emits
const emit = defineEmits<{
  "update:modelValue": [value: ApplicationStatus | "all"];
}>();

// Get all statuses once
const statuses = getStatuses();

// Compute the label to display in the trigger
const selectedLabel = computed(() => {
  if (props.modelValue === "all") return props.placeholder;
  const selected = statuses.find(s => s.status === props.modelValue);
  return selected?.label ?? props.placeholder;
});

// Computed proxy for v-model
const model = computed<ApplicationStatus | "all">({
  get: () => props.modelValue,
  set: val => {
    const newValue: ApplicationStatus | "all" =
      val === null || val === undefined || val === "all"
        ? "all"
        : (val as ApplicationStatus);
    emit("update:modelValue", newValue);
  },
});
</script>

<template>
  <Select v-model="model">
    <!-- Trigger -->
    <SelectTrigger class="w-full h-9">
      <SelectValue :placeholder="props.placeholder">
        {{ selectedLabel }}
      </SelectValue>
    </SelectTrigger>

    <!-- Dropdown -->
    <SelectContent>
      <!-- Optional "All" item -->
      <SelectItem v-if="props.showAllOption" value="all">
        {{ props.placeholder }}
      </SelectItem>

      <!-- Status items -->
      <SelectItem
        v-for="status in statuses"
        :key="status.status"
        :value="status.status"
      >
        <div class="flex flex-col">
          <span>{{ status.label }}</span>
          <span class="text-xs text-muted-foreground">{{
            status.description
          }}</span>
        </div>
      </SelectItem>
    </SelectContent>
  </Select>
</template>
