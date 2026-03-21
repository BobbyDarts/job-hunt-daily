<!-- // /src/components/app/sites/category-card/CategoryCard.vue -->

<script setup lang="ts">
import { Pencil, Plus, Trash2 } from "lucide-vue-next";
import { ref, computed } from "vue";

import { JobSiteCard } from "@/components/app/sites";
import { EditCategoryDialog } from "@/components/app/sites/edit-category-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useJobSites } from "@/composables/data";
import { useAddJobSiteDialog } from "@/composables/ui";
import type { ATSInfo } from "@/lib/ats-detection";
import type { JobCategory, Application, JobSite } from "@/types";

export interface Props {
  category: JobCategory;
  sites: JobSite[];
  visitedCount: number;
  progress: number;
  maxHeight: number;
  getATS?: (site: JobSite) => ATSInfo | undefined;
  isSiteVisited: (url: string) => boolean;
  onVisit: (url: string) => void;
  onAddApplication?: (site: JobSite) => void;
  onManageApplications?: (site: JobSite) => void;
  getApplicationsForSite?: (siteId: string) => Application[];
}

const props = defineProps<Props>();

const { deleteCategory } = useJobSites();
const { openDialog: openAddJobSite } = useAddJobSiteDialog();

const isHovered = ref(false);
const isDeleteDialogOpen = ref(false);
const isEditCategoryOpen = ref(false);

const categoryNameClass = computed(() => {
  const len = props.category.name.length;
  if (len > 30) return "text-sm sm:text-base font-semibold tracking-tight";
  if (len > 20) return "text-base sm:text-lg font-semibold tracking-tight";
  return "text-lg sm:text-xl font-semibold tracking-tight";
});

async function handleDeleteCategory() {
  await deleteCategory(props.category.id);
}
</script>

<template>
  <section
    class="rounded-xl border border-border/50 bg-card text-card-foreground shadow-lg overflow-hidden backdrop-blur-sm"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <!-- Header -->
    <div
      class="bg-linear-to-r from-primary/5 to-primary/10 px-4 pt-3 pb-2 sm:px-6 sm:pt-4 sm:pb-2 border-b border-border/30"
    >
      <div class="flex items-center justify-between mb-2">
        <h2 :class="categoryNameClass">
          {{ category.name }}
        </h2>

        <div class="flex items-center gap-1">
          <!-- Action bar — visible on hover -->
          <div
            class="flex items-center gap-0.5 transition-opacity"
            :class="isHovered ? 'opacity-100' : 'opacity-0'"
          >
            <!-- Add Site -->
            <Tooltip>
              <TooltipTrigger as-child>
                <Button
                  variant="ghost"
                  size="icon"
                  class="size-7"
                  @click="openAddJobSite(category.id)"
                >
                  <Plus class="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add site to category</TooltipContent>
            </Tooltip>

            <!-- Edit Category -->
            <Tooltip>
              <TooltipTrigger as-child>
                <Button
                  variant="ghost"
                  size="icon"
                  class="size-7"
                  @click="isEditCategoryOpen = true"
                >
                  <Pencil class="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit category</TooltipContent>
            </Tooltip>

            <!-- Delete Category — only when empty -->
            <Tooltip v-if="sites.length === 0">
              <TooltipTrigger as-child>
                <Button
                  variant="ghost"
                  size="icon"
                  class="size-7 text-destructive hover:text-destructive"
                  @click="isDeleteDialogOpen = true"
                >
                  <Trash2 class="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete category</TooltipContent>
            </Tooltip>
          </div>

          <span
            class="text-sm font-medium text-muted-foreground tabular-nums ml-1 shrink-0 whitespace-nowrap"
          >
            {{ visitedCount }} / {{ sites.length }}
          </span>
        </div>
      </div>
      <Progress :model-value="progress" class="h-1.5 bg-primary/10" />
    </div>

    <!-- Sites List -->
    <ScrollArea
      class="overflow-hidden bg-card/50"
      :style="{ height: `${maxHeight * 4.25}rem` }"
    >
      <div class="flex flex-col gap-2 px-4 pb-4 pt-2 sm:px-6 sm:pb-6 sm:pt-2">
        <JobSiteCard
          v-for="site in sites"
          :key="site.url"
          :site="site"
          :ats-info="getATS ? getATS(site) : undefined"
          :variant="isSiteVisited(site.url) ? 'visited' : 'default'"
          :on-visit="onVisit"
          :on-add-application="onAddApplication"
          :on-manage-applications="onManageApplications"
          :applications="
            getApplicationsForSite ? getApplicationsForSite(site.id) : []
          "
        />
      </div>
    </ScrollArea>
  </section>

  <!-- Edit Category Dialog -->
  <EditCategoryDialog v-model:open="isEditCategoryOpen" :category="category" />

  <!-- Delete confirmation -->
  <AlertDialog v-model:open="isDeleteDialogOpen">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Delete Category</AlertDialogTitle>
        <AlertDialogDescription>
          Are you sure you want to delete
          <span class="font-medium">{{ category.name }}</span
          >? This cannot be undone.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction
          class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          @click="handleDeleteCategory"
        >
          Delete
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
