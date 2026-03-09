<!-- // /src/components/app/applications/application-card/ApplicationCard.vue -->

<script setup lang="ts">
import { Edit, Trash2, ExternalLink, Calendar, Tag } from "lucide-vue-next";
import { computed } from "vue";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { displayDate, getToday, toPlainDate } from "@/lib/time";
import type { Application } from "@/types";
import { getStatusInfo, getTagInfo } from "@/types";

export interface Props {
  application: Application;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  edit: [];
  delete: [];
}>();

const statusInfo = computed(() => getStatusInfo(props.application.status));

const formattedDate = computed(() => {
  return displayDate(toPlainDate(props.application.appliedDate), {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
});

const daysSinceApplied = computed(() => {
  return getToday().since(toPlainDate(props.application.appliedDate)).days;
});

const openUrl = (url: string) => {
  window.open(url, "_blank", "noopener,noreferrer");
};
</script>

<template>
  <Card class="hover:border-primary/30 transition-colors">
    <CardHeader class="pb-3">
      <div class="flex items-start justify-between gap-2">
        <div class="flex-1 min-w-0">
          <h4 class="font-semibold truncate">{{ application.position }}</h4>
          <div
            class="flex items-center gap-2 mt-1 text-sm text-muted-foreground"
          >
            <Calendar class="size-3" />
            <span>{{ formattedDate }}</span>
            <span class="text-xs">
              ({{ daysSinceApplied }}
              {{ daysSinceApplied === 1 ? "day" : "days" }} ago)
            </span>
          </div>
        </div>
        <div class="flex gap-1">
          <Tooltip>
            <TooltipTrigger as-child>
              <Button
                variant="ghost"
                size="icon"
                class="size-7"
                aria-label="Edit"
                @click="emit('edit')"
              >
                <Edit class="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit</TooltipContent>
          </Tooltip>

          <AlertDialog>
            <Tooltip>
              <TooltipTrigger as-child>
                <AlertDialogTrigger as-child>
                  <Button
                    variant="ghost"
                    size="icon"
                    class="size-7"
                    aria-label="Delete"
                  >
                    <Trash2 class="size-3.5 text-destructive" />
                  </Button>
                </AlertDialogTrigger>
              </TooltipTrigger>
              <TooltipContent>Delete</TooltipContent>
            </Tooltip>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Application</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete your application for
                  <strong>{{ application.position }}</strong> at
                  <strong>{{ application.company }}</strong
                  >? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  class="bg-destructive hover:bg-destructive/90"
                  @click="emit('delete')"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </CardHeader>

    <CardContent class="pb-3 space-y-3">
      <!-- Status Badge -->
      <div>
        <span
          class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border"
          :class="statusInfo.color"
        >
          {{ statusInfo.label }}
        </span>
      </div>

      <!-- Tags -->
      <div
        v-if="application.tags && application.tags.length > 0"
        class="flex flex-wrap gap-1.5"
      >
        <span
          v-for="tag in application.tags"
          :key="tag"
          class="inline-flex items-center px-2 py-0.5 rounded text-xs border"
          :class="getTagInfo(tag).color"
        >
          {{ getTagInfo(tag).label }}
        </span>
      </div>

      <!-- Notes Preview -->
      <p
        v-if="application.notes"
        class="text-sm text-muted-foreground line-clamp-2"
      >
        {{ application.notes }}
      </p>

      <!-- ATS Type -->
      <div
        v-if="application.atsType"
        class="flex items-center gap-1 text-xs text-muted-foreground"
      >
        <Tag class="size-3" />
        <span class="uppercase">{{ application.atsType }}</span>
      </div>
    </CardContent>

    <CardFooter class="pt-0 pb-3 flex gap-2">
      <Button
        variant="outline"
        size="sm"
        class="flex-1 text-xs"
        aria-label="Open Job Site"
        @click="openUrl(application.jobSiteUrl)"
      >
        <ExternalLink class="size-3 mr-1" />
        Job Site
      </Button>
      <Button
        v-if="application.jobPostingUrl"
        variant="outline"
        size="sm"
        class="flex-1 text-xs"
        aria-label="Open Job Posting"
        @click="openUrl(application.jobPostingUrl)"
      >
        <ExternalLink class="size-3 mr-1" />
        Posting
      </Button>
    </CardFooter>
  </Card>
</template>
