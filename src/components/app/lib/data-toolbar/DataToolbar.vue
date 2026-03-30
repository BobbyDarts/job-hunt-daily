<!-- // /src/components/app/lib/data-toolbar/DataToolbar.vue -->

<script setup lang="ts">
import { X } from "@lucide/vue";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

defineProps<{
  total?: number;
  filtered?: number;
  hasActiveFilters?: boolean;
}>();

defineEmits<{
  (e: "clear"): void;
}>();
</script>

<template>
  <div class="flex flex-col gap-2 w-full">
    <!-- Top row: back + title (left) / add button (right) -->
    <div class="flex items-center justify-between w-full">
      <div class="flex items-center gap-2">
        <slot name="back" />
        <slot name="title" />
      </div>
      <div class="flex items-center gap-2">
        <slot name="actions" />
      </div>
    </div>

    <!-- Bottom row: filters + clear (left) / count (right) -->
    <div class="flex items-center justify-between w-full">
      <div class="flex items-center gap-2">
        <slot name="filters" />

        <!-- Clear button immediately after filters -->
        <Button
          v-if="hasActiveFilters"
          variant="outline"
          size="icon"
          class="size-9"
          @click="$emit('clear')"
          aria-label="Clear filters"
        >
          <X class="size-4" />
        </Button>
      </div>

      <!-- Stats slot (right-aligned) -->
      <div class="flex items-center gap-2 text-xs">
        <slot name="stats">
          <Tooltip>
            <TooltipTrigger as-child>
              <div
                v-if="total !== undefined"
                class="flex items-center gap-1 px-2 py-1 rounded-md bg-muted text-muted-foreground"
              >
                {{ filtered ?? total }} / {{ total }}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Showing {{ filtered ?? total }} of {{ total }} entries</p>
            </TooltipContent>
          </Tooltip>
        </slot>
      </div>
    </div>
  </div>
</template>
