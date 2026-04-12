<!-- // /src/components/app/shell/header/HeaderActions.vue -->

<script setup lang="ts">
import {
  Upload,
  Download,
  FolderOpen,
  Search,
  CircleHelp,
  Globe,
  ListTree,
  BarChart2,
} from "@lucide/vue";
import { computed } from "vue";
import { RouterLink } from "vue-router";

import { MenuToggle } from "@/components/app/shell";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { useDataManagement } from "@/composables/data";
import {
  useCommandPalette,
  useShortcutReference,
  useTheme,
} from "@/composables/ui";

// composables
const { openCommandPalette } = useCommandPalette();
const { exportAllData, triggerImport } = useDataManagement();
const { openDialog: openShortcutReference } = useShortcutReference();
const { toggleTheme, themeText, themeIcon } = useTheme();

// reactives
const isMac = computed(
  () =>
    navigator.platform.toUpperCase().includes("MAC") ||
    navigator.userAgent.toUpperCase().includes("MAC"),
);
</script>

<template>
  <!-- Fake search bar -->
  <Button
    variant="outline"
    class="hidden sm:flex items-center gap-2 px-3 h-8 text-sm text-muted-foreground w-48"
    @click="openCommandPalette"
  >
    <Search class="size-3.5 shrink-0" />
    <span class="flex-1 text-left">Search...</span>
    <kbd
      class="text-xs font-mono bg-background border border-border/50 rounded px-1"
    >
      {{ isMac ? "⌘" : "Ctrl " }}K
    </kbd>
  </Button>

  <!-- Shortcut reference button -->
  <Tooltip>
    <TooltipTrigger as-child>
      <Button
        variant="ghost"
        size="icon"
        class="size-8"
        @click="openShortcutReference"
      >
        <CircleHelp class="size-4" />
      </Button>
    </TooltipTrigger>
    <TooltipContent>Keyboard shortcuts (?)</TooltipContent>
  </Tooltip>
  <DropdownMenu v-slot="{ open }">
    <DropdownMenuTrigger as-child>
      <MenuToggle :open="open" />
    </DropdownMenuTrigger>

    <DropdownMenuContent align="end" class="w-48">
      <DropdownMenuGroup>
        <DropdownMenuLabel class="text-xs text-muted-foreground"
          >Account</DropdownMenuLabel
        >
        <DropdownMenuItem as-child>
          <RouterLink to="/applications" class="flex items-center">
            <FolderOpen class="mr-2 size-4" />
            My Applications
          </RouterLink>
        </DropdownMenuItem>

        <DropdownMenuItem as-child>
          <RouterLink to="/categories" class="flex items-center">
            <ListTree class="mr-2 size-4" />
            My Categories
          </RouterLink>
        </DropdownMenuItem>

        <DropdownMenuItem as-child>
          <RouterLink to="/reports" class="flex items-center">
            <BarChart2 class="mr-2 size-4" />
            My Reports
          </RouterLink>
        </DropdownMenuItem>

        <DropdownMenuItem as-child>
          <RouterLink to="/job-sites" class="flex items-center">
            <Globe class="mr-2 size-4" />
            My Job Sites
          </RouterLink>
        </DropdownMenuItem>
      </DropdownMenuGroup>

      <DropdownMenuSeparator />

      <DropdownMenuGroup>
        <DropdownMenuLabel class="text-xs text-muted-foreground"
          >Data</DropdownMenuLabel
        >
        <DropdownMenuItem @click="triggerImport">
          <Upload class="mr-2 size-4" />
          Import...
        </DropdownMenuItem>

        <DropdownMenuItem @click="exportAllData">
          <Download class="mr-2 size-4" />
          Export...
        </DropdownMenuItem>
      </DropdownMenuGroup>

      <DropdownMenuSeparator />

      <DropdownMenuGroup>
        <DropdownMenuLabel class="text-xs text-muted-foreground"
          >Appearance</DropdownMenuLabel
        >
        <DropdownMenuItem @select.prevent @click="toggleTheme">
          <Component :is="themeIcon" class="mr-2 size-4" />
          Theme
          <span class="ml-auto text-xs text-muted-foreground">
            {{ themeText }}
          </span>
        </DropdownMenuItem>
      </DropdownMenuGroup>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
