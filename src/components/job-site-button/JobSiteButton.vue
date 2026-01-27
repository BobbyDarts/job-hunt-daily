<script setup lang="ts">
import type { JobSite } from '@/types';
import { ATSAvatar } from '@/components/ats-avatar';
import { ATSInfo } from '@/lib/ats-detection';
import { computed } from 'vue';
import { cn } from '@/lib/utils';

type Variant = 'default' | 'visited';

interface Props {
  site: JobSite;
  variant?: Variant;
  atsInfo?: ATSInfo;
  onClick: (url: string) => void;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default'
});

const handleClick = () => props.onClick(props.site.url);

const buttonClasses = computed(() =>
  cn(
    'w-full inline-flex items-center justify-between gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 p-3 sm:p-4 text-left backdrop-blur-sm',
    props.variant === 'default'
      ? 'border border-border/40 hover:border-primary/30 hover:bg-accent/50 hover:shadow-md bg-background/80'
      : 'border border-border/20 hover:border-primary/20 hover:bg-accent/30 bg-muted/40 opacity-75'
  )
);
</script>

<template>
  <button data-testid="job-site" @click="handleClick" :class="buttonClasses">
    <div class="flex items-center gap-2 min-w-0">
      <ATSAvatar v-if="atsInfo" :site="site" :atsInfo="atsInfo" :variant="variant" />
      <span class="truncate">{{ site.name }}</span>
    </div>

    <span v-if="variant === 'visited'" class="text-green-600 dark:text-green-400 shrink-0">
      ✓
    </span>
  </button>
</template>
