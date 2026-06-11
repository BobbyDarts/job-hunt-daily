<!-- /src/components/app/shell/header/SwitchModeDialog.vue -->

<script setup lang="ts">
import { Database, HardDrive, AlertTriangle } from "@lucide/vue";
import { ref } from "vue";
import { useRouter } from "vue-router";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useDataManagement } from "@/composables/data";
import { useAppMode, type AppMode } from "@/composables/ui/use-app-mode";
import { getSession } from "@/services/supabase/auth";

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ "update:open": [value: boolean] }>();

const router = useRouter();
const { isSupabase, setMode } = useAppMode();
const { exportAllData } = useDataManagement();

const step = ref<"confirm" | "switching">("confirm");

function close() {
  emit("update:open", false);
  step.value = "confirm";
}

async function handleExportAndSwitch() {
  await exportAllData();
  await doSwitch();
}

async function doSwitch() {
  step.value = "switching";

  const newMode = isSupabase.value ? "local" : "supabase";
  setMode(newMode as AppMode);

  // If switching to Supabase, check for session
  if (newMode === "supabase") {
    const session = await getSession();
    close();
    if (!session) {
      router.push({ name: "Login" });
    } else {
      window.location.reload();
    }
  } else {
    // Switching to local — reload to re-init with local repositories
    window.location.reload();
  }
}
</script>

<template>
  <Dialog :open="props.open" @update:open="close">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <AlertTriangle class="size-4 text-yellow-500" />
          Switch to {{ isSupabase ? "Local" : "Supabase" }} mode?
        </DialogTitle>
        <DialogDescription>
          <span v-if="isSupabase">
            Switching to local mode means your data will be stored in this
            browser only. Your Supabase data will not be affected and will be
            available when you switch back.
          </span>
          <span v-else>
            Switching to Supabase mode requires signing in. Your local data will
            not be automatically migrated — you can export first and import
            after signing in.
          </span>
        </DialogDescription>
      </DialogHeader>

      <div class="flex items-center justify-center gap-4 py-4">
        <div
          class="flex flex-col items-center gap-2 p-4 rounded-lg border"
          :class="
            !isSupabase
              ? 'border-primary bg-primary/5'
              : 'border-border opacity-50'
          "
        >
          <HardDrive class="size-8" />
          <span class="text-sm font-medium">Local</span>
          <span class="text-xs text-muted-foreground">This browser</span>
        </div>

        <span class="text-muted-foreground">→</span>

        <div
          class="flex flex-col items-center gap-2 p-4 rounded-lg border"
          :class="
            isSupabase
              ? 'border-primary bg-primary/5'
              : 'border-border opacity-50'
          "
        >
          <Database class="size-8" />
          <span class="text-sm font-medium">Supabase</span>
          <span class="text-xs text-muted-foreground">Cloud sync</span>
        </div>
      </div>

      <DialogFooter class="flex-col sm:flex-row gap-2">
        <Button variant="outline" @click="close">Cancel</Button>
        <Button variant="outline" @click="handleExportAndSwitch">
          <Database class="mr-2 size-4" />
          Export first, then switch
        </Button>
        <Button @click="doSwitch" :disabled="step === 'switching'">
          {{ step === "switching" ? "Switching..." : "Switch now" }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
