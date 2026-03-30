<!-- // /src/components/app/shell/command-palette/CommandPalette.vue -->

<script setup lang="ts">
import {
  Home,
  Download,
  Upload,
  FolderOpen,
  Plus,
  Globe,
  ListTree,
} from "@lucide/vue";
import { useRouter } from "vue-router";

import { CommandPaletteSites } from "@/components/app/shell";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useDataManagement } from "@/composables/data";
import {
  useAddApplicationDialog,
  useCommandPalette,
  useAddJobSiteDialog,
  useTheme,
  useAddCategoryDialog,
} from "@/composables/ui";

// composables
const router = useRouter();

const { triggerImport, exportAllData } = useDataManagement();
const { open, closeCommandPalette, withClose } = useCommandPalette();
const { openDialog: openAddApplication } = useAddApplicationDialog();
const { openDialog: openAddCategory } = useAddCategoryDialog();
const { openDialog: openAddJobSite } = useAddJobSiteDialog();
const { toggleTheme, themeText, themeIcon } = useTheme();

// actions
const actions = {
  home: withClose(() => void router.push("/")),
  applications: withClose(() => void router.push("/applications")),
  categories: withClose(() => void router.push("/categories")),
  jobSites: withClose(() => void router.push("/job-sites")),

  addApplication: withClose(() => openAddApplication()),
  addCategory: withClose(() => openAddCategory()),
  addJobSite: withClose(() => openAddJobSite()),

  export: withClose(() => exportAllData()),
  import: withClose(() => triggerImport()),

  theme: withClose(() => toggleTheme()),
};
</script>

<template>
  <CommandDialog
    v-model:open="open"
    class="rounded-lg border shadow-md max-w-112.5"
  >
    <CommandInput placeholder="Type a command or search..." />
    <CommandList>
      <CommandEmpty>No results found.</CommandEmpty>

      <CommandGroup heading="Navigation">
        <CommandItem value="home" @select="actions.home">
          <Home class="mr-2 size-4" />
          <span>Go to Home</span>
        </CommandItem>
        <CommandItem value="applications" @select="actions.applications">
          <FolderOpen class="mr-2 size-4" />
          <span>Go to Applications</span>
        </CommandItem>
        <CommandItem value="categories" @select="actions.categories">
          <ListTree class="mr-2 size-4" />
          <span>Go to Categories</span>
        </CommandItem>
        <CommandItem value="job-sites" @select="actions.jobSites">
          <Globe class="mr-2 size-4" />
          <span>Go to Job Sites</span>
        </CommandItem>
      </CommandGroup>

      <CommandGroup heading="Actions">
        <CommandItem value="application" @select="actions.addApplication">
          <Plus class="mr-2 size-4" />
          <span>Add Application</span>
        </CommandItem>
        <CommandItem value="add-category" @select="actions.addCategory">
          <Plus class="mr-2 size-4" />
          <span>Add Category</span>
        </CommandItem>
        <CommandItem value="add-job-site" @select="actions.addJobSite">
          <Plus class="mr-2 size-4" />
          <span>Add Job Site</span>
        </CommandItem>
        <CommandItem value="export" @select="actions.export">
          <Download class="mr-2 size-4" />
          <span>Export Data</span>
        </CommandItem>
        <CommandItem value="import" @select="actions.import">
          <Upload class="mr-2 size-4" />
          <span>Import Data</span>
        </CommandItem>
      </CommandGroup>

      <CommandGroup heading="Appearance">
        <CommandItem value="theme" @select="actions.theme">
          <Component :is="themeIcon" class="mr-2 size-4" />
          Theme
          <span class="ml-auto text-xs text-muted-foreground">
            {{ themeText }}
          </span>
        </CommandItem>
      </CommandGroup>

      <CommandPaletteSites @site-select="closeCommandPalette" />
    </CommandList>
  </CommandDialog>
</template>
