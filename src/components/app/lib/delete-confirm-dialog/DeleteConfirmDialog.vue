<!-- // /src/components/app/lib/delete-confirm-dialog/DeleteConfirmDialog.vue -->

<script setup lang="ts">
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
defineProps<{
  open: boolean;
  title: string;
  description: string;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  confirm: [];
}>();
</script>

<template>
  <AlertDialog :open="open" @update:open="emit('update:open', $event)">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{{ title }}</AlertDialogTitle>
        <AlertDialogDescription
          v-html="description"
          class="[&_strong]:text-foreground"
        />
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel @click="emit('update:open', false)">
          Cancel
        </AlertDialogCancel>
        <AlertDialogAction
          class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          @click="emit('confirm')"
        >
          Delete
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
