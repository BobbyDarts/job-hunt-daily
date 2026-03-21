<!-- // /src/components/app/sites/edit-category-dialog/EditCategoryDialog.vue -->

<script setup lang="ts">
import { computed, ref, watch } from "vue";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useJobSites } from "@/composables/data";
import type { JobCategory } from "@/types";

export interface Props {
  open: boolean;
  category: JobCategory | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  "update:open": [value: boolean];
}>();

const { updateCategory } = useJobSites();

const name = ref("");
const description = ref("");

watch(
  () => props.category,
  category => {
    if (category) {
      name.value = category.name;
      description.value = category.description ?? "";
    }
  },
  { immediate: true },
);

const isValid = computed(() => name.value.trim().length > 0);

async function handleSubmit() {
  if (!isValid.value || !props.category) return;
  await updateCategory(props.category.id, {
    name: name.value.trim(),
    description: description.value.trim() || undefined,
  });
  emit("update:open", false);
}

function handleCancel() {
  emit("update:open", false);
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Edit Category</DialogTitle>
        <DialogDescription
          >Update the category name and description</DialogDescription
        >
      </DialogHeader>

      <div class="grid gap-4 py-2">
        <div class="grid gap-2">
          <Label for="edit-cat-name">Name *</Label>
          <Input
            id="edit-cat-name"
            v-model="name"
            placeholder="Category name"
            @keyup.enter="handleSubmit"
            @keyup.escape="handleCancel"
          />
        </div>
        <div class="grid gap-2">
          <Label for="edit-cat-description">Description</Label>
          <Textarea
            id="edit-cat-description"
            v-model="description"
            placeholder="Optional description..."
            class="resize-none min-h-20"
            rows="3"
            @keyup.escape="handleCancel"
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="handleCancel">Cancel</Button>
        <Button :disabled="!isValid" @click="handleSubmit">Save Changes</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
