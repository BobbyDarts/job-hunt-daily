<!-- /src/components/app/shell/header/HeaderActions.vue -->

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
  Database,
  HardDrive,
  LogOut,
  User,
} from "@lucide/vue";
import { computed, ref } from "vue";
import { useRouter, RouterLink } from "vue-router";

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
  useAppMode,
  useCommandPalette,
  useShortcutReference,
  useTheme,
} from "@/composables/ui";
import { getSession, signOut } from "@/services/supabase/auth";

import { SwitchModeDialog } from ".";

const router = useRouter();
const { openCommandPalette } = useCommandPalette();
const { exportAllData, triggerImport } = useDataManagement();
const { openDialog: openShortcutReference } = useShortcutReference();
const { toggleTheme, themeText, themeIcon } = useTheme();
const { mode, isSupabase, clearMode } = useAppMode();

const isMac = computed(
  () =>
    navigator.platform.toUpperCase().includes("MAC") ||
    navigator.userAgent.toUpperCase().includes("MAC"),
);

// Current user email for Supabase mode
const userEmail = ref<string | null>(null);
if (isSupabase.value) {
  getSession().then(session => {
    userEmail.value = session?.user?.email ?? null;
  });
}

// Mode switch dialog
const switchModeDialogOpen = ref(false);

async function handleSignOut() {
  await signOut();
  clearMode();
  router.push({ name: "Welcome" });
}
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

  <!-- Mode indicator badge — clickable -->
  <Tooltip>
    <TooltipTrigger as-child>
      <Button
        variant="ghost"
        size="icon"
        class="size-8"
        @click="switchModeDialogOpen = true"
      >
        <Database v-if="isSupabase" class="size-4 text-blue-500" />
        <HardDrive v-else class="size-4 text-muted-foreground" />
      </Button>
    </TooltipTrigger>
    <TooltipContent>
      {{ mode === "supabase" ? "Supabase mode" : "Local mode" }} — click to
      switch
    </TooltipContent>
  </Tooltip>

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

    <DropdownMenuContent align="end" class="w-56">
      <!-- Supabase user info -->
      <template v-if="isSupabase && userEmail">
        <DropdownMenuGroup>
          <DropdownMenuLabel class="text-xs text-muted-foreground">
            Signed in as
          </DropdownMenuLabel>
          <DropdownMenuItem disabled class="flex items-center">
            <User class="mr-2 size-4" />
            <span class="truncate text-xs">{{ userEmail }}</span>
          </DropdownMenuItem>
          <DropdownMenuItem @click="handleSignOut">
            <LogOut class="mr-2 size-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
      </template>

      <DropdownMenuGroup>
        <DropdownMenuLabel class="text-xs text-muted-foreground">
          Account
        </DropdownMenuLabel>
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
        <DropdownMenuLabel class="text-xs text-muted-foreground">
          Data
        </DropdownMenuLabel>
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
        <DropdownMenuLabel class="text-xs text-muted-foreground">
          Appearance
        </DropdownMenuLabel>
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

  <SwitchModeDialog v-model:open="switchModeDialogOpen" />
</template>
