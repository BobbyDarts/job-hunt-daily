<!-- // /src/components/app/shell/menu-toggle/MenuToggle.vue -->

<script setup lang="ts">
import { Menu, X } from "@lucide/vue";

import { Button } from "@/components/ui/button";

export interface Props {
  open?: boolean;
  ariaLabel?: string;
}

withDefaults(defineProps<Props>(), {
  open: false,
  ariaLabel: "Toggle menu",
});
</script>

<template>
  <Button variant="ghost" size="icon" :aria-label="ariaLabel" class="relative">
    <span class="relative size-5">
      <Menu
        class="absolute inset-0 size-5 transition-all duration-150"
        :class="open ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'"
      />
      <X
        class="absolute inset-0 size-5 transition-all duration-150"
        :class="open ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'"
      />
    </span>
  </Button>
</template>
