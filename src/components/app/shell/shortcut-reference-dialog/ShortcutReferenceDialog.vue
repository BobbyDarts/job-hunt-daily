<!-- /src/components/shortcut-reference-dialog/ShortcutReferenceDialog.vue -->
<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useShortcutReference } from "@/composables/ui";

const { open, closeDialog } = useShortcutReference();
</script>

<template>
  <Dialog :open="open" @update:open="closeDialog">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Keyboard Shortcuts</DialogTitle>
        <DialogDescription
          >Available shortcuts when not in an input field.</DialogDescription
        >
      </DialogHeader>

      <div class="space-y-4">
        <div>
          <h3
            class="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2"
          >
            Navigation
          </h3>
          <div class="space-y-1.5">
            <div class="flex items-center justify-between text-sm">
              <span>Open command palette</span>
              <div class="flex gap-1">
                <kbd
                  class="px-1.5 py-0.5 text-xs rounded bg-muted border border-border font-mono"
                  >⌘</kbd
                >
                <kbd
                  class="px-1.5 py-0.5 text-xs rounded bg-muted border border-border font-mono"
                  >K</kbd
                >
              </div>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span>Go to Home</span>
              <div class="flex gap-1">
                <kbd
                  class="px-1.5 py-0.5 text-xs rounded bg-muted border border-border font-mono"
                  >g</kbd
                >
                <kbd
                  class="px-1.5 py-0.5 text-xs rounded bg-muted border border-border font-mono"
                  >h</kbd
                >
              </div>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span>Go to Applications</span>
              <div class="flex gap-1">
                <kbd
                  class="px-1.5 py-0.5 text-xs rounded bg-muted border border-border font-mono"
                  >g</kbd
                >
                <kbd
                  class="px-1.5 py-0.5 text-xs rounded bg-muted border border-border font-mono"
                  >a</kbd
                >
              </div>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span>Go to Job Sites</span>
              <div class="flex gap-1">
                <kbd
                  class="px-1.5 py-0.5 text-xs rounded bg-muted border border-border font-mono"
                  >g</kbd
                >
                <kbd
                  class="px-1.5 py-0.5 text-xs rounded bg-muted border border-border font-mono"
                  >j</kbd
                >
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3
            class="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2"
          >
            Site List (Home)
          </h3>
          <div class="space-y-1.5">
            <div class="flex items-center justify-between text-sm">
              <span>Move focus down</span>
              <kbd
                class="px-1.5 py-0.5 text-xs rounded bg-muted border border-border font-mono"
                >j</kbd
              >
            </div>
            <div class="flex items-center justify-between text-sm">
              <span>Move focus up</span>
              <kbd
                class="px-1.5 py-0.5 text-xs rounded bg-muted border border-border font-mono"
                >k</kbd
              >
            </div>
            <div class="flex items-center justify-between text-sm">
              <span>Open focused site</span>
              <kbd
                class="px-1.5 py-0.5 text-xs rounded bg-muted border border-border font-mono"
                >Enter</kbd
              >
            </div>
            <div class="flex items-center justify-between text-sm">
              <span>Mark focused site visited</span>
              <kbd
                class="px-1.5 py-0.5 text-xs rounded bg-muted border border-border font-mono"
                >v</kbd
              >
            </div>
            <div class="flex items-center justify-between text-sm">
              <span>Add application for focused site</span>
              <kbd
                class="px-1.5 py-0.5 text-xs rounded bg-muted border border-border font-mono"
                >a</kbd
              >
            </div>
          </div>
        </div>

        <div>
          <h3
            class="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2"
          >
            General
          </h3>
          <div class="space-y-1.5">
            <div class="flex items-center justify-between text-sm">
              <span>Toggle theme</span>
              <kbd
                class="px-1.5 py-0.5 text-xs rounded bg-muted border border-border font-mono"
                >t</kbd
              >
            </div>
            <div class="flex items-center justify-between text-sm">
              <span>Show this reference</span>
              <kbd
                class="px-1.5 py-0.5 text-xs rounded bg-muted border border-border font-mono"
                >?</kbd
              >
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
