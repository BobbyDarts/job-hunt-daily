<!-- // /src/components/app/sites/job-site-card/JobSiteCard.vue -->

<script setup lang="ts">
import { Plus, FolderOpen } from "@lucide/vue";
import { computed, onMounted, onUnmounted, ref } from "vue";

import { JobSiteButton } from "@/components/app/sites";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSiteFocus } from "@/composables/ui";
import type { ATSInfo } from "@/lib/ats-detection";
import type { JobSite, Application } from "@/types";

export interface Props {
  site: JobSite;
  atsInfo?: ATSInfo;
  variant?: "default" | "visited"; // TODO: move Variant type to a shared location
  applications?: Application[];
  onVisit: (url: string) => void;
  onAddApplication?: (site: JobSite) => void;
  onManageApplications?: (site: JobSite) => void;
}

const props = withDefaults(defineProps<Props>(), {
  atsInfo: undefined,
  applications: () => [],
  variant: "default",
  onAddApplication: undefined,
  onManageApplications: undefined,
});

const { register, unregister } = useSiteFocus();
const cardRef = ref<HTMLElement | null>(null);

onMounted(() => {
  if (cardRef.value) register(cardRef.value, props.site);
});

onUnmounted(() => {
  if (cardRef.value) unregister(cardRef.value);
});

const hasApplications = computed(() => props.applications.length > 0);

const handleCardClick = () => {
  props.onVisit(props.site.url);
};

const handleAddClick = (e: Event) => {
  e.stopPropagation();
  props.onAddApplication?.(props.site);
};

const handleManageClick = (e: Event) => {
  e.stopPropagation();
  props.onManageApplications?.(props.site);
};
</script>

<template>
  <div
    ref="cardRef"
    tabindex="0"
    @click="handleCardClick"
    @keydown.enter="handleCardClick"
    class="rounded-xl focus:outline-none focus:ring-2 focus:ring-ring"
  >
    <Card
      class="py-0 gap-0 overflow-hidden transition-colors cursor-pointer flex flex-col"
      :class="
        variant === 'default'
          ? 'hover:border-primary/30 hover:bg-accent/50 hover:shadow-md'
          : 'hover:border-primary/20 hover:bg-accent/30'
      "
    >
      <CardContent class="pl-4 flex-1">
        <JobSiteButton
          layout="card"
          :site="site"
          :ats-info="atsInfo"
          :variant="variant"
          :on-click="() => {}"
          class="hover:bg-transparent hover:border-transparent hover:shadow-none"
        />
      </CardContent>

      <CardFooter
        class="flex items-center justify-end gap-1 px-2 h-8 bg-muted/90"
      >
        <!-- Add button: only if visited today -->
        <Tooltip v-if="variant === 'visited'">
          <TooltipTrigger as-child>
            <Button
              size="icon"
              variant="ghost"
              class="size-6"
              aria-label="Add application"
              @click="handleAddClick"
            >
              <Plus class="size-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add application</TooltipContent>
        </Tooltip>

        <!-- Manage button: only if has applications -->
        <Tooltip v-if="hasApplications">
          <TooltipTrigger as-child>
            <Button
              size="icon"
              variant="ghost"
              class="size-6"
              aria-label="Manage applications"
              @click="handleManageClick"
            >
              <FolderOpen class="size-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Manage applications</TooltipContent>
        </Tooltip>
      </CardFooter>
    </Card>
  </div>
</template>
