// /src/components/tags-multi-select/TagsMultiSelect.vue

<script setup lang="ts">
import { Check } from "lucide-vue-next";
import { computed, ref } from "vue";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { ApplicationTag, ApplicationTagCategory } from "@/types";
import { getTags } from "@/types";

export interface Props {
  modelValue: ApplicationTag[];
  variant?: "default" | "accordion" | "tabs" | "pills";
}

const props = withDefaults(defineProps<Props>(), {
  variant: "default",
});

const emit = defineEmits<{
  "update:modelValue": [ApplicationTag[]];
}>();

const activeCategory = ref<"interview" | "context" | "action">("interview");
const categories = ["interview", "action"] as const;

const options = getTags().map(({ tag, ...rest }) => ({
  value: tag,
  ...rest,
}));

const optionsByCategory = categories.reduce(
  (grouped, cat) => {
    grouped[cat] = options
      .filter(o => o.category === cat)
      .sort((a, b) => a.label.localeCompare(b.label));
    return grouped;
  },
  {} as Record<ApplicationTagCategory, typeof options>,
);

const selected = computed(() => new Set(props.modelValue));

// Count selected tags per category
const selectedCountByCategory = computed(() => {
  const counts: Record<string, number> = {};

  categories.forEach(cat => {
    counts[cat] = optionsByCategory[cat].filter(opt =>
      selected.value.has(opt.value),
    ).length;
  });

  return counts;
});

const toggleTag = (tag: ApplicationTag) => {
  const next = new Set(props.modelValue);

  if (next.has(tag)) {
    next.delete(tag);
  } else {
    next.add(tag);
  }

  emit("update:modelValue", Array.from(next));
};

const getCategoryLabel = (category: string) => {
  return category.charAt(0).toUpperCase() + category.slice(1);
};

const getButtonClasses = (opt: { value: ApplicationTag; color: string }) => {
  if (props.variant === "pills") {
    return cn(
      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
      selected.value.has(opt.value)
        ? [opt.color, "shadow-sm"]
        : "bg-muted/40 text-muted-foreground hover:bg-muted",
    );
  }

  return cn(
    "px-2.5 py-1.5 rounded-md border text-xs font-medium transition-all",
    selected.value.has(opt.value)
      ? [opt.color, props.variant === "default" ? "" : "shadow-sm"]
      : "bg-muted/40 text-muted-foreground hover:bg-muted hover:border-border",
  );
};
</script>

<template>
  <!-- Accordion Variant -->
  <Accordion
    v-if="variant === 'accordion'"
    type="multiple"
    class="w-full"
    :default-value="['interview', 'context', 'action']"
  >
    <AccordionItem
      v-for="category in categories"
      :key="category"
      :value="category"
      class="border-b-0"
    >
      <AccordionTrigger class="py-2 text-sm font-medium hover:no-underline">
        <div class="flex items-center justify-between w-full mr-2">
          <span>{{ getCategoryLabel(category) }}</span>
          <Badge
            v-if="selectedCountByCategory[category] > 0"
            :class="
              cn(
                'h-5 px-1.5 text-xs font-medium',
                category === 'interview'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-yellow-100 text-yellow-700',
              )
            "
          >
            {{ selectedCountByCategory[category] }}
          </Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent class="pb-3">
        <div class="flex flex-wrap gap-2">
          <button
            v-for="opt in optionsByCategory[category]"
            :key="opt.value"
            type="button"
            @click="toggleTag(opt.value)"
            :class="getButtonClasses(opt)"
          >
            {{ opt.label }}
          </button>
        </div>
      </AccordionContent>
    </AccordionItem>
  </Accordion>

  <!-- Tabs Variant -->
  <Tabs v-else-if="variant === 'tabs'" v-model="activeCategory" class="w-full">
    <TabsList class="grid w-full grid-cols-3">
      <TabsTrigger
        v-for="category in categories"
        :key="category"
        :value="category"
      >
        {{ getCategoryLabel(category) }}
      </TabsTrigger>
    </TabsList>

    <TabsContent
      v-for="category in categories"
      :key="category"
      :value="category"
      class="mt-3"
    >
      <div class="flex flex-wrap gap-2">
        <button
          v-for="opt in optionsByCategory[category]"
          :key="opt.value"
          type="button"
          @click="toggleTag(opt.value)"
          :class="getButtonClasses(opt)"
        >
          {{ opt.label }}
        </button>
      </div>
    </TabsContent>
  </Tabs>

  <!-- Pills Variant -->
  <div v-else-if="variant === 'pills'" class="space-y-3">
    <div v-for="category in categories" :key="category" class="space-y-2">
      <h4 class="text-sm font-medium text-muted-foreground">
        {{ getCategoryLabel(category) }}
      </h4>

      <div class="flex flex-wrap gap-2">
        <button
          v-for="opt in optionsByCategory[category]"
          :key="opt.value"
          type="button"
          @click="toggleTag(opt.value)"
          :class="getButtonClasses(opt)"
        >
          <Check v-if="selected.has(opt.value)" class="size-3" />
          {{ opt.label }}
        </button>
      </div>
    </div>
  </div>

  <!-- Default Variant (Original) -->
  <div v-else class="space-y-2">
    <div v-for="category in categories" :key="category">
      <p class="text-xs text-muted-foreground mb-1">
        {{ category.toUpperCase() }}
      </p>

      <div class="flex flex-wrap gap-2 mb-3">
        <button
          v-for="opt in optionsByCategory[category]"
          :key="opt.value"
          type="button"
          @click="toggleTag(opt.value)"
          :class="getButtonClasses(opt)"
        >
          {{ opt.label }}
        </button>
      </div>
    </div>
  </div>
</template>
