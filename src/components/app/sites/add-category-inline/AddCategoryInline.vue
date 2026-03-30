<!-- // /src/components/app/sites/add-category-inline/AddCategoryInline.vue -->

<script setup lang="ts">
import { Plus } from "@lucide/vue";
import { ref } from "vue";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useJobSites } from "@/composables/data";

const emit = defineEmits<{
  added: [categoryId: string];
}>();

const { addCategory } = useJobSites();

const isAdding = ref(false);
const name = ref("");
const description = ref("");
const isSubmitting = ref(false);

async function handleAdd() {
  if (!name.value.trim() || isSubmitting.value) return;

  isSubmitting.value = true;
  try {
    const category = await addCategory({
      name: name.value.trim(),
      description: description.value.trim() || undefined,
    });
    emit("added", category.id);
    cancel();
  } finally {
    isSubmitting.value = false;
  }
}

function cancel() {
  name.value = "";
  description.value = "";
  isAdding.value = false;
}
</script>

<template>
  <div class="flex items-center gap-2">
    <slot />
    <Tooltip>
      <TooltipTrigger as-child>
        <Button
          variant="outline"
          size="icon"
          class="size-9 shrink-0"
          @click="isAdding = !isAdding"
        >
          <Plus class="size-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{{
        isAdding ? "Cancel new category" : "Add new category"
      }}</TooltipContent>
    </Tooltip>
  </div>

  <div
    v-if="isAdding"
    class="grid gap-2 mt-2 p-3 border rounded-md bg-muted/30"
  >
    <div class="grid gap-1.5">
      <Label for="new-category-name">Name *</Label>
      <Input
        id="new-category-name"
        v-model="name"
        placeholder="Category name"
        @keyup.enter="handleAdd"
        @keyup.escape="cancel"
      />
    </div>
    <div class="grid gap-1.5">
      <Label for="new-category-description">Description</Label>
      <Textarea
        id="new-category-description"
        v-model="description"
        placeholder="Optional description..."
        class="resize-none min-h-16"
        rows="2"
        @keyup.escape="cancel"
      />
    </div>
    <div class="flex items-center gap-2 justify-end">
      <Button size="sm" variant="outline" @click="cancel">Cancel</Button>
      <Button
        size="sm"
        :disabled="!name.trim() || isSubmitting"
        @click="handleAdd"
      >
        Add Category
      </Button>
    </div>
  </div>
</template>
