<!-- // /src/components/app/sites/edit-job-site-dialog/EditJobSiteDialog.vue -->

<script setup lang="ts">
import { computed, ref, watch } from "vue";

import { ATSSelect, CategorySelect } from "@/components/app/lib";
import { AddCategoryInline } from "@/components/app/sites";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useJobSites } from "@/composables/data";
import type { ATSType, JobSite } from "@/types";

export interface Props {
  open: boolean;
  site: JobSite | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  "update:open": [value: boolean];
}>();

const { updateSite, getSiteByUrl } = useJobSites();

// -------------------------
// Form state
// -------------------------

const formData = ref({
  name: "",
  url: "",
  categoryId: "",
  atsType: "" as ATSType | "",
  notes: "",
});

const urlError = ref("");

// -------------------------
// Populate on open
// -------------------------

watch(
  () => props.site,
  site => {
    if (site) {
      formData.value = {
        name: site.name,
        url: site.url,
        categoryId: site.categoryId,
        atsType: site.atsType ?? "",
        notes: site.notes ?? "",
      };
      urlError.value = "";
    }
  },
  { immediate: true },
);

// -------------------------
// Validation
// -------------------------

function validateUrl() {
  const url = formData.value.url.trim();
  if (!url) {
    urlError.value = "";
    return;
  }

  try {
    new URL(url);
  } catch {
    urlError.value = "Please enter a valid URL";
    return;
  }

  // Allow same URL as current site
  if (url !== props.site?.url) {
    const existing = getSiteByUrl(url);
    if (existing) {
      urlError.value = `URL already exists as "${existing.name}"`;
      return;
    }
  }

  urlError.value = "";
}

const isValid = computed(
  () =>
    formData.value.name.trim() &&
    formData.value.url.trim() &&
    formData.value.categoryId &&
    !urlError.value,
);

// -------------------------
// Submit / Cancel
// -------------------------

async function handleSubmit() {
  validateUrl();
  if (!isValid.value || !props.site) return;

  await updateSite(props.site.id, {
    name: formData.value.name.trim(),
    url: formData.value.url.trim(),
    categoryId: formData.value.categoryId,
    atsType: formData.value.atsType || undefined,
    notes: formData.value.notes.trim() || undefined,
  });

  emit("update:open", false);
}

function handleCancel() {
  emit("update:open", false);
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-125 p-0">
      <DialogHeader class="px-6 pt-6 pb-4">
        <DialogTitle>Edit Job Site</DialogTitle>
        <DialogDescription
          >Update the details of this job site</DialogDescription
        >
      </DialogHeader>

      <ScrollArea class="h-[60vh] px-6">
        <div class="grid gap-4 pr-4">
          <div class="grid gap-2">
            <Label for="edit-site-name">Name *</Label>
            <Input
              id="edit-site-name"
              v-model="formData.name"
              placeholder="e.g., Acme Corp Careers"
              @keyup.enter="handleSubmit"
            />
          </div>

          <div class="grid gap-2">
            <Label for="edit-site-url">URL *</Label>
            <Input
              id="edit-site-url"
              v-model="formData.url"
              placeholder="https://..."
              type="url"
              @blur="validateUrl"
              @keyup.enter="handleSubmit"
            />
            <p v-if="urlError" class="text-sm text-destructive">
              {{ urlError }}
            </p>
          </div>

          <div class="grid gap-2">
            <Label for="site-category">Category *</Label>
            <AddCategoryInline @added="formData.categoryId = $event">
              <CategorySelect
                id="site-category"
                v-model="formData.categoryId"
                placeholder="Select a category"
                :inside-dialog="true"
                class="flex-1"
              />
            </AddCategoryInline>
          </div>

          <div class="grid gap-2">
            <Label for="edit-site-ats">ATS Type</Label>
            <ATSSelect
              id="edit-site-ats"
              v-model="formData.atsType"
              placeholder="None"
              :inside-dialog="true"
              show-all-option
            />
          </div>

          <div class="grid gap-2">
            <Label for="edit-site-notes">Notes</Label>
            <Textarea
              id="edit-site-notes"
              v-model="formData.notes"
              placeholder="Add any notes about this site..."
              class="resize-none min-h-24"
              rows="3"
            />
          </div>
        </div>
      </ScrollArea>

      <DialogFooter class="px-6 pb-6 pt-4">
        <Button variant="outline" @click="handleCancel">Cancel</Button>
        <Button :disabled="!isValid" @click="handleSubmit">Save Changes</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
