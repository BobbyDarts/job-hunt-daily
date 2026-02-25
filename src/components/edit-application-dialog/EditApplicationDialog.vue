// /src/components/edit-application-dialog/EditApplicationDialog.vue

<script setup lang="ts">
import { ref, watch } from "vue";

import { TagsMultiSelect } from "@/components/tags-multi-select";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Application, ApplicationStatus, ApplicationTag } from "@/types";
import { getStatuses } from "@/types";

const props = defineProps<Props>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  submit: [data: Partial<Omit<Application, "id" | "createdAt">>];
}>();

export interface Props {
  open: boolean;
  application: Application | null;
}

// Form state
const formData = ref({
  company: "",
  position: "",
  jobSiteUrl: "",
  jobPostingUrl: "",
  appliedDate: "",
  status: "applied" as ApplicationStatus,
  tags: [] as ApplicationTag[],
  notes: "",
  followUpDate: "",
});

// Watch for application changes to populate form
watch(
  () => props.application,
  app => {
    if (app) {
      formData.value = {
        company: app.company,
        position: app.position,
        jobSiteUrl: app.jobSiteUrl,
        jobPostingUrl: app.jobPostingUrl || "",
        appliedDate: app.appliedDate,
        status: app.status,
        tags: app.tags || [],
        notes: app.notes || "",
        followUpDate: app.followUpDate || "",
      };
    }
  },
  { immediate: true },
);

const handleSubmit = () => {
  const updates: Partial<Omit<Application, "id" | "createdAt">> = {
    company: formData.value.company,
    position: formData.value.position,
    jobSiteUrl: formData.value.jobSiteUrl,
    jobPostingUrl: formData.value.jobPostingUrl || undefined,
    appliedDate: formData.value.appliedDate,
    status: formData.value.status,
    tags: formData.value.tags.length > 0 ? formData.value.tags : undefined,
    notes: formData.value.notes || undefined,
    followUpDate: formData.value.followUpDate || undefined,
  };

  emit("submit", updates);
  emit("update:open", false);
};
</script>

<template>
  <Dialog :open="open" @update:open="val => emit('update:open', val)">
    <DialogContent class="sm:max-w-125 p-0">
      <!-- Fixed Header -->
      <DialogHeader class="px-6 pt-6 pb-4">
        <DialogTitle>Edit Application</DialogTitle>
        <DialogDescription>
          Update the details of your job application
        </DialogDescription>
      </DialogHeader>

      <!-- Scrollable Content with explicit height -->
      <ScrollArea class="h-[60vh] px-6">
        <form @submit.prevent="handleSubmit" class="grid gap-4 pr-4">
          <!-- Company & Position -->
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="edit-company">Company *</Label>
              <Input
                id="edit-company"
                v-model="formData.company"
                placeholder="Acme Corp"
                required
              />
            </div>

            <div class="space-y-2">
              <Label for="edit-position">Position *</Label>
              <Input
                id="edit-position"
                v-model="formData.position"
                placeholder="Senior Developer"
                required
              />
            </div>
          </div>

          <!-- URLs -->
          <div class="space-y-2">
            <Label for="edit-job-site-url">Job Site URL *</Label>
            <Input
              id="edit-job-site-url"
              v-model="formData.jobSiteUrl"
              type="url"
              placeholder="https://example.wd5.myworkdayjobs.com"
              required
            />
          </div>

          <div class="space-y-2">
            <Label for="edit-job-posting-url">Job Posting URL (optional)</Label>
            <Input
              id="edit-job-posting-url"
              v-model="formData.jobPostingUrl"
              type="url"
              placeholder="https://example.com/careers/job/123"
            />
          </div>

          <!-- Dates & Status -->
          <div class="grid grid-cols-3 gap-4">
            <div class="space-y-2">
              <Label for="edit-applied-date">Applied Date *</Label>
              <Input
                id="edit-applied-date"
                v-model="formData.appliedDate"
                type="date"
                required
              />
            </div>

            <div class="space-y-2">
              <Label for="edit-status">Status *</Label>
              <Select v-model="formData.status">
                <SelectTrigger id="edit-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="item in getStatuses()"
                    :key="item.status"
                    :value="item.status"
                  >
                    {{ item.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="space-y-2">
              <Label for="edit-follow-up-date">Follow-up Date</Label>
              <Input
                id="edit-follow-up-date"
                v-model="formData.followUpDate"
                type="date"
              />
            </div>
          </div>

          <!-- Tags -->
          <div class="space-y-2">
            <Label>Tags</Label>
            <TagsMultiSelect v-model="formData.tags" variant="accordion" />
          </div>

          <!-- Notes -->
          <div class="space-y-2">
            <Label for="edit-notes">Notes</Label>
            <Textarea
              id="edit-notes"
              v-model="formData.notes"
              placeholder="Add any notes about this application..."
              rows="4"
            />
          </div>
        </form>
      </ScrollArea>

      <!-- Fixed Footer -->
      <DialogFooter class="px-6 pb-6 pt-4">
        <Button
          type="button"
          variant="outline"
          @click="emit('update:open', false)"
        >
          Cancel
        </Button>
        <Button type="submit" @click="handleSubmit">Save Changes</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
