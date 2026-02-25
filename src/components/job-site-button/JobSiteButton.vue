// /src/components/job-site-button/JobSiteButton.vue

<script setup lang="ts">
import { computed } from "vue";

import { ATSAvatar } from "@/components/ats-avatar";
import type { ATSInfo } from "@/lib/ats-detection";
import { cn } from "@/lib/utils";
import type { JobSite } from "@/types";

type Variant = "default" | "visited";
type Layout = "standalone" | "card";

export interface Props {
  site: JobSite;
  variant?: Variant;
  layout?: Layout;
  atsInfo?: ATSInfo;
  onClick: (url: string) => void;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "default",
  layout: "standalone",
  atsInfo: undefined,
});

const handleClick = () => props.onClick(props.site.url);

const buttonClasses = computed(() =>
  cn(
    "w-full inline-flex items-center justify-between gap-2 whitespace-nowrap text-sm font-medium transition-all focus-visible:outline-none",
    props.layout === "card"
      ? "pl-0 pr-3 py-3 rounded-none bg-transparent hover:bg-accent/40"
      : "p-3 sm:p-4 rounded-lg border backdrop-blur-sm",
    props.variant === "visited" && "opacity-75",
  ),
);
</script>

<template>
  <button data-testid="job-site" :class="buttonClasses" @click="handleClick">
    <div class="flex items-baseline gap-1 min-w-0 h-6">
      <ATSAvatar
        v-if="atsInfo"
        :site="site"
        :ats-info="atsInfo"
        :variant="variant"
      />
      <span class="truncate">{{ site.name }}</span>
    </div>

    <span
      v-if="variant === 'visited'"
      class="text-green-600 dark:text-green-400 shrink-0"
    >
      ✓
    </span>
  </button>
</template>
