<!-- // /src/components/app/lib/BaseSelect.vue -->

<script setup lang="ts">
import { Check, ChevronsUpDown } from "lucide-vue-next";
import type { AcceptableValue } from "reka-ui";
import { computed, ref, toRef } from "vue";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGroupedOptions, useSelectModel } from "@/composables/lib";
import { cn } from "@/lib/utils";

export interface BaseSelectOption {
  value: string;
  label: string;
  description?: string;
  color?: string;
  category?: string;
}

type BaseSelectVariant =
  | "default"
  | "accordion"
  | "dropdown"
  | "pills"
  | "tabs";

export interface BaseSelectProps {
  modelValue: string | string[];
  options: BaseSelectOption[];
  multiple?: boolean;
  variant?: BaseSelectVariant;
  placeholder?: string;
  searchable?: boolean;
  groupByCategory?: boolean;
  showAllOption?: boolean;
  allOptionLabel?: string;
  insideDialog?: boolean;
}

const props = withDefaults(defineProps<BaseSelectProps>(), {
  multiple: false,
  variant: "default",
  placeholder: "Select...",
  searchable: false,
  groupByCategory: false,
  showAllOption: false,
  insideDialog: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: string | string[]];
}>();

//  Search (dropdown variant only)
const searchQuery = ref("");
const popoverOpen = ref(false);

//  Grouping
const { grouped, isEmpty, selectedCountByCategory } = useGroupedOptions(
  () => props.options,
  {
    groupByCategory: toRef(props, "groupByCategory"),
    // Only wire up search for non-dialog dropdown (Combobox has its own input)
    searchQuery:
      props.variant === "dropdown" && props.insideDialog
        ? searchQuery
        : undefined,
    sortWithin: true,
  },
);

//  Selection
const { isSelected, toggle, selectedCount } = useSelectModel(
  () => props.modelValue,
  val => emit("update:modelValue", val),
  { multiple: props.multiple },
);

const countByCategory = selectedCountByCategory(isSelected);

//  Trigger label (dropdown only)
const triggerLabel = computed(() => {
  if (!props.multiple) {
    const found = props.options.find(o => isSelected(o.value));
    return found?.label ?? props.placeholder;
  }
  const count = selectedCount.value;
  if (count === 0) return props.placeholder;
  if (count === 1) {
    const found = props.options.find(o => isSelected(o.value));
    return found?.label ?? props.placeholder;
  }
  return `${count} selected`;
});

//  Shared button classes (inline variants)
const getButtonClasses = (
  opt: BaseSelectOption,
  shape: "pill" | "rounded" = "rounded",
) => {
  const active = isSelected(opt.value);
  if (shape === "pill") {
    return cn(
      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
      active
        ? [opt.color ?? "bg-primary text-primary-foreground", "shadow-sm"]
        : "bg-muted/40 text-muted-foreground hover:bg-muted",
    );
  }
  return cn(
    "px-2.5 py-1.5 rounded-md border text-xs font-medium transition-all",
    active
      ? [opt.color ?? "border-primary bg-primary/10 text-primary", "shadow-sm"]
      : "bg-muted/40 text-muted-foreground hover:bg-muted hover:border-border",
  );
};

const getCategoryLabel = (category: string | null) => {
  if (!category) return "Options";
  return category.charAt(0).toUpperCase() + category.slice(1);
};

//  Handlers
const handleSelect = (val: string) => {
  toggle(val === "__all__" ? "__all__" : (val as string));
  if (!props.multiple) {
    popoverOpen.value = false;
    searchQuery.value = "";
  }
};

const handleSelectChange = (val: AcceptableValue) => {
  if (val == null) return;
  handleSelect(String(val));
  searchQuery.value = "";
};
</script>

<template>
  <div class="contents">
    <!-- ── DROPDOWN — inside Dialog: shadcn Select (portal-safe) ── -->
    <template v-if="variant === 'dropdown' && insideDialog">
      <Select
        :model-value="Array.isArray(modelValue) ? modelValue[0] : modelValue"
        @update:model-value="handleSelectChange"
      >
        <SelectTrigger class="w-full h-9">
          <SelectValue :placeholder="placeholder">{{
            triggerLabel
          }}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <!-- Search inside Select (SiteSelect pattern) -->
          <div v-if="searchable" class="px-2 py-1.5 border-b">
            <Input
              v-model="searchQuery"
              placeholder="Search..."
              class="h-8"
              @click.stop
              @keydown.stop
            />
          </div>

          <SelectItem v-if="showAllOption" value="__all__">
            {{ allOptionLabel ?? placeholder }}
          </SelectItem>

          <template
            v-for="group in grouped"
            :key="group.category ?? 'ungrouped'"
          >
            <SelectGroup>
              <SelectLabel v-if="group.category">{{
                group.category
              }}</SelectLabel>
              <SelectItem
                v-for="opt in group.options"
                :key="opt.value"
                :value="opt.value"
              >
                <div class="flex flex-col">
                  <span>{{ opt.label }}</span>
                  <span
                    v-if="opt.description"
                    class="text-xs text-muted-foreground"
                  >
                    {{ opt.description }}
                  </span>
                </div>
              </SelectItem>
            </SelectGroup>
          </template>

          <div
            v-if="isEmpty"
            class="px-2 py-6 text-center text-sm text-muted-foreground"
          >
            No results found
          </div>
        </SelectContent>
      </Select>
    </template>

    <!-- ── DROPDOWN — outside Dialog: Popover + Command ── -->
    <template v-else-if="variant === 'dropdown'">
      <Popover v-model:open="popoverOpen">
        <PopoverTrigger as-child>
          <button
            class="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm hover:bg-accent"
          >
            <span :class="selectedCount === 0 ? 'text-muted-foreground' : ''">
              {{ triggerLabel }}
            </span>
            <Badge
              v-if="multiple && selectedCount > 1"
              variant="secondary"
              class="ml-2"
            >
              {{ selectedCount }}
            </Badge>
            <ChevronsUpDown class="size-4 shrink-0 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          class="w-[--radix-popover-trigger-width] p-0"
          align="start"
        >
          <Command>
            <CommandInput v-if="searchable" placeholder="Search..." />
            <CommandList class="max-h-none overflow-visible">
              <ScrollArea>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup v-if="showAllOption">
                  <CommandItem
                    v-if="showAllOption"
                    value="__all__"
                    @select="handleSelect('__all__')"
                  >
                    {{ allOptionLabel ?? placeholder }}
                  </CommandItem>
                </CommandGroup>
                <template
                  v-for="group in grouped"
                  :key="group.category ?? 'ungrouped'"
                >
                  <CommandGroup :heading="group.category ?? undefined">
                    <CommandItem
                      v-for="opt in group.options"
                      :key="opt.value"
                      :value="opt.value"
                      @select="handleSelect(opt.value)"
                    >
                      <Check
                        v-if="multiple"
                        class="mr-2 size-4 shrink-0 transition-opacity"
                        :class="
                          isSelected(opt.value) ? 'opacity-100' : 'opacity-0'
                        "
                      />
                      <div class="flex flex-col">
                        <span>{{ opt.label }}</span>
                        <span
                          v-if="opt.description"
                          class="w-full text-xs text-muted-foreground"
                        >
                          {{ opt.description }}
                        </span>
                      </div>
                    </CommandItem>
                  </CommandGroup>
                </template>
              </ScrollArea>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </template>

    <!-- ── ACCORDION ─ -->
    <template v-else-if="variant === 'accordion'">
      <Accordion
        type="multiple"
        class="w-full"
        :default-value="grouped.map(g => g.category ?? '')"
      >
        <AccordionItem
          v-for="group in grouped"
          :key="group.category ?? 'ungrouped'"
          :value="group.category ?? ''"
          class="border-b-0"
        >
          <AccordionTrigger class="py-2 text-sm font-medium hover:no-underline">
            <div class="flex items-center justify-between w-full mr-2">
              <span>{{ getCategoryLabel(group.category) }}</span>
              <Badge
                v-if="countByCategory[group.category ?? ''] > 0"
                variant="secondary"
                class="h-5 px-1.5 text-xs font-medium"
              >
                {{ countByCategory[group.category ?? ""] }}
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent class="pb-3">
            <div class="flex flex-wrap gap-2">
              <button
                v-for="opt in group.options"
                :key="opt.value"
                type="button"
                :class="getButtonClasses(opt, 'rounded')"
                @click="handleSelect(opt.value)"
              >
                {{ opt.label }}
              </button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </template>

    <!-- ── TABS ─ -->
    <template v-else-if="variant === 'tabs'">
      <Tabs :default-value="grouped[0]?.category ?? ''" class="w-full">
        <TabsList class="flex w-full">
          <TabsTrigger
            v-for="group in grouped"
            :key="group.category ?? 'ungrouped'"
            :value="group.category ?? ''"
            class="flex-1"
          >
            {{ getCategoryLabel(group.category) }}
          </TabsTrigger>
        </TabsList>
        <TabsContent
          v-for="group in grouped"
          :key="group.category ?? 'ungrouped'"
          :value="group.category ?? ''"
          class="mt-3"
        >
          <div class="flex flex-wrap gap-2">
            <button
              v-for="opt in group.options"
              :key="opt.value"
              type="button"
              :class="getButtonClasses(opt, 'rounded')"
              @click="handleSelect(opt.value)"
            >
              {{ opt.label }}
            </button>
          </div>
        </TabsContent>
      </Tabs>
    </template>

    <!-- ── PILLS  -->
    <template v-else-if="variant === 'pills'">
      <div class="space-y-3">
        <div
          v-for="group in grouped"
          :key="group.category ?? 'ungrouped'"
          class="space-y-2"
        >
          <h4
            v-if="group.category"
            class="text-sm font-medium text-muted-foreground"
          >
            {{ getCategoryLabel(group.category) }}
          </h4>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="opt in group.options"
              :key="opt.value"
              type="button"
              :class="getButtonClasses(opt, 'pill')"
              @click="handleSelect(opt.value)"
            >
              <Check v-if="isSelected(opt.value)" class="size-3" />
              {{ opt.label }}
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- ── DEFAULT ─ -->
    <template v-else>
      <div class="space-y-2">
        <div v-for="group in grouped" :key="group.category ?? 'ungrouped'">
          <p v-if="group.category" class="text-xs text-muted-foreground mb-1">
            {{ group.category.toUpperCase() }}
          </p>
          <div class="flex flex-wrap gap-2 mb-3">
            <button
              v-for="opt in group.options"
              :key="opt.value"
              type="button"
              :class="getButtonClasses(opt, 'rounded')"
              @click="handleSelect(opt.value)"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
