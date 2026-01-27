<script setup lang="ts">
import { computed } from 'vue';
import type { JobSite } from '@/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { ATSInfo } from '@/lib/ats-detection';

type Variant = 'default' | 'visited';

interface Props {
  site: JobSite;
  atsInfo?: ATSInfo;
  variant?: Variant;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default'
});

const avatarClasses = computed(() => {
  const base = 'size-6 cursor-help';
  return props.variant === 'visited' ? `${base} opacity-70` : base;
});
</script>

<template>
  <Tooltip v-if="atsInfo">
    <TooltipTrigger as-child>
      <Avatar data-testid="ats-badge" :class="avatarClasses">
        <AvatarFallback class="text-[10px] font-bold" :class="atsInfo?.classes">
          {{ atsInfo?.initials }}
        </AvatarFallback>
      </Avatar>
    </TooltipTrigger>

    <TooltipContent side="top">
      <span class="text-sm">
        Applicant Tracking System: <strong class="capitalize">{{ atsInfo.type }}</strong>
      </span>
    </TooltipContent>
  </Tooltip>
</template>