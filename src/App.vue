// /src/App.vue

<script setup lang="ts">
import { useColorMode, useOnline } from "@vueuse/core";
import {
  Sun,
  Moon,
  Upload,
  Download,
  FolderOpen,
  Search,
  CircleHelp,
} from "lucide-vue-next";
import { computed, watch } from "vue";
import { RouterLink } from "vue-router";
import { Toaster, toast } from "vue-sonner";
import "vue-sonner/style.css";

import { CommandPalette } from "@/components/app/shell/command-palette";
import { Header } from "@/components/app/shell/header";
import { MenuToggle } from "@/components/app/shell/menu-toggle";
import { ShortcutReferenceDialog } from "@/components/app/shell/shortcut-reference-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  useDataManagement,
  useJobData,
  useVisitedSites,
} from "@/composables/data";
import { useKeyboardShortcuts } from "@/composables/keyboard";
import { useCommandPalette, useShortcutReference } from "@/composables/ui";

// Composables
const colorMode = useColorMode();
const isOnline = useOnline();

const { totalSites } = useJobData();
const { visitedCount, isComplete } = useVisitedSites();
const { openCommandPalette } = useCommandPalette();
const { openDialog: openShortcutReference } = useShortcutReference();
const { exportAllData, triggerImport } = useDataManagement();
useKeyboardShortcuts();

// Computed
const progress = computed(() => {
  if (totalSites.value === 0) return 0;
  return Math.round((visitedCount.value / totalSites.value) * 100);
});

const isMac = computed(
  () =>
    navigator.platform.toUpperCase().includes("MAC") ||
    navigator.userAgent.toUpperCase().includes("MAC"),
);

// Actions
const toggleTheme = () => {
  colorMode.value = colorMode.value === "dark" ? "light" : "dark";
};

// Watchers
watch(isOnline, online => {
  if (online) {
    toast.success("You're back online!");
  } else {
    toast.error("You're offline. Some features may not work.");
  }
});
</script>

<template>
  <Toaster
    :duration="5000"
    :close-button="true"
    close-button-position="top-right"
    position="bottom-right"
    :theme="colorMode === 'auto' ? 'dark' : colorMode"
  />
  <CommandPalette />
  <ShortcutReferenceDialog />
  <TooltipProvider>
    <div class="h-screen bg-background flex flex-col overflow-hidden">
      <!-- Fixed Header -->
      <Header
        title="Job Hunt Daily"
        :visited-count="visitedCount"
        :total-sites="totalSites"
        :progress="progress"
        :is-complete="isComplete"
        :is-online="isOnline"
      >
        <!-- Add theme toggle to header actions slot -->
        <template #actions>
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
                  <Sun v-if="colorMode === 'dark'" class="mr-2 size-4" />
                  <Moon v-else class="mr-2 size-4" />
                  Theme
                  <span class="ml-auto text-xs text-muted-foreground">
                    {{ colorMode === "dark" ? "Dark" : "Light" }}
                  </span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </template>
      </Header>

      <!-- Scrollable Content with ScrollArea -->
      <ScrollArea class="flex-1 overflow-y-auto h-full">
        <div class="pb-24">
          <router-view />
        </div>
      </ScrollArea>
    </div>
  </TooltipProvider>
</template>
