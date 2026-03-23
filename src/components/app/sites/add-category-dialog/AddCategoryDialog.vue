<!-- // /src/components/app/sites/add-category-dialog/AddCategoryDialog.vue -->

<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { toast } from "vue-sonner";

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

export interface Props {
  open: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  "update:open": [value: boolean];
}>();

const { addCategory, getCategoryBySlug } = useJobSites();

// form state
const formData = ref({
  name: "",
  description: "",
});

const nameWarning = computed(() => {
  const name = formData.value.name.trim();
  if (!name) return "";
  const existing = getCategoryBySlug(name);
  return existing
    ? `"${existing.name}" already exists with a similar name`
    : "";
});

const isValid = computed(() => formData.value.name.trim().length > 0);

function resetForm() {
  formData.value = { name: "", description: "" };
}

// focus
const nameInputRef = ref<InstanceType<typeof Input> | null>(null);

watch(
  () => props.open,
  async isOpen => {
    if (isOpen) {
      resetForm();
      await nextTick();
      setTimeout(() => {
        nameInputRef.value?.$el?.focus();
      }, 50);
    }
  },
);

const isSubmitting = ref(false);

// actions
async function handleSubmit() {
  if (!isValid.value || isSubmitting.value) return;

  isSubmitting.value = true;
  try {
    await addCategory({
      name: formData.value.name.trim(),
      description: formData.value.description.trim() || undefined,
    });
    toast.success("Category added successfully");
    emit("update:open", false);
    resetForm();
  } finally {
    isSubmitting.value = false;
  }
}

function handleCancel() {
  emit("update:open", false);
  resetForm();
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Add Category</DialogTitle>
        <DialogDescription>
          Add a new category to organize your job sites
        </DialogDescription>
      </DialogHeader>

      <div class="grid gap-4">
        <div class="grid gap-2">
          <Label for="category-name">Name *</Label>
          <Input
            id="category-name"
            ref="nameInputRef"
            v-model="formData.name"
            placeholder="e.g., Remote Jobs"
            @keyup.enter="handleSubmit"
          />
          <p class="text-sm text-amber-500 min-h-5">
            {{ nameWarning }}
          </p>
        </div>

        <div class="grid gap-2">
          <Label for="category-description">Description</Label>
          <Textarea
            id="category-description"
            v-model="formData.description"
            placeholder="Optional description..."
            class="resize-none min-h-16"
            rows="2"
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="handleCancel">Cancel</Button>
        <Button :disabled="!isValid || isSubmitting" @click="handleSubmit">
          Add Category
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
