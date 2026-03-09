<!-- // /src/components/app/applications/add-application-dialog/AddApplicationDialog.vue -->

<script setup lang="ts">
import { ref, watch, computed, nextTick } from "vue";

import { TagsMultiSelect } from "@/components/app/applications/tags-multi-select";
import { SiteSelect } from "@/components/app/sites/site-select";
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
import { useJobData } from "@/composables/use-job-data";
import { buildApplicationPayload } from "@/lib/application-utils";
import { todayIso } from "@/lib/time";
import type { JobSite, Application, ApplicationTag } from "@/types";

const props = defineProps<Props>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  submit: [data: Omit<Application, "id" | "createdAt" | "updatedAt">];
}>();

const { allSitesWithCategory, getSiteById } = useJobData();

export interface Props {
  open: boolean;
  site: JobSite | null;
}

// Form state
const defaultFormData = () => ({
  company: "",
  position: "",
  jobPostingUrl: "",
  notes: "",
  tags: [] as ApplicationTag[],
});

const selectedSiteId = ref<string>("all");
const formData = ref(defaultFormData());

// Compute the active site (either from prop or from selection)
const activeSite = computed(() => {
  if (props.site) return props.site;
  if (selectedSiteId.value !== "all") return getSiteById(selectedSiteId.value);
  return null;
});

const isValid = computed(
  () =>
    activeSite.value &&
    formData.value.company.trim() &&
    formData.value.position.trim(),
);

// Reset everything to empty/default
function resetForm() {
  selectedSiteId.value = "all";
  formData.value = defaultFormData();
}

// Always reset when dialog opens
watch(
  () => props.open,
  isOpen => {
    if (isOpen) {
      resetForm();
    }
  },
);

// Also reset if site prop changes while open
watch(
  () => props.site?.id,
  (newId, oldId) => {
    if (props.open && newId !== oldId) resetForm();
  },
);

const handleSubmit = () => {
  if (!activeSite.value || !isValid.value) return;

  emit(
    "submit",
    buildApplicationPayload(formData.value, {
      jobSiteId: activeSite.value.id,
      jobSiteUrl: activeSite.value.url,
      atsType: activeSite.value.atsType,
      appliedDate: todayIso(),
      status: "applied",
    }),
  );

  emit("update:open", false);
  resetForm();
};

const handleCancel = () => {
  emit("update:open", false);
  resetForm();
};

const companyInputRef = ref<InstanceType<typeof Input> | null>(null);

watch(
  () => props.open,
  async isOpen => {
    if (isOpen) {
      resetForm();
      await nextTick();
      setTimeout(() => {
        companyInputRef.value?.$el?.focus();
      }, 50);
    }
  },
);
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-125 p-0">
      <DialogHeader class="px-6 pt-6 pb-4">
        <DialogTitle>Add Application</DialogTitle>
        <DialogDescription> Log a job application </DialogDescription>
      </DialogHeader>

      <ScrollArea class="h-[60vh] px-6">
        <div class="grid gap-4 pr-4">
          <!-- Site Select (only if no site prop) -->
          <div v-if="!props.site" class="grid gap-2">
            <Label for="site">Job Site *</Label>
            <SiteSelect
              id="site"
              v-model="selectedSiteId"
              :sites="allSitesWithCategory"
              placeholder="Select a job site"
              :inside-dialog="true"
              show-all-option
            />
          </div>

          <div class="grid gap-2">
            <Label for="company">Company *</Label>
            <Input
              id="company"
              ref="companyInputRef"
              v-model="formData.company"
              placeholder="e.g., Acme Corp"
              @keyup.enter="handleSubmit"
            />
          </div>

          <div class="grid gap-2">
            <Label for="position">Position *</Label>
            <Input
              id="position"
              v-model="formData.position"
              placeholder="e.g., Senior Developer"
              @keyup.enter="handleSubmit"
            />
          </div>

          <div class="grid gap-2">
            <Label for="jobPostingUrl">Job Posting URL</Label>
            <Input
              id="jobPostingUrl"
              v-model="formData.jobPostingUrl"
              placeholder="https://..."
              type="url"
            />
          </div>

          <div class="grid gap-2">
            <Label for="notes">Notes</Label>
            <Textarea
              id="notes"
              v-model="formData.notes"
              placeholder="Add any notes about this application..."
              class="resize-none min-h-30"
              rows="5"
            />
          </div>

          <div class="grid gap-2">
            <Label>Tags</Label>
            <TagsMultiSelect
              v-model="formData.tags"
              variant="accordion"
              :multiple="true"
            />
          </div>
        </div>
      </ScrollArea>

      <DialogFooter class="px-6 pb-6 pt-4">
        <Button variant="outline" @click="handleCancel"> Cancel </Button>
        <Button :disabled="!isValid" @click="handleSubmit">
          Add Application
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
