// /src/composables/ui/use-app-mode.ts

import { useLocalStorage } from "@vueuse/core";
import { computed } from "vue";

import { STORAGE_KEYS } from "@/constants/storage-keys";

export type AppMode = "local" | "supabase";

const mode = useLocalStorage<AppMode | null>(STORAGE_KEYS.APP_MODE, null, {
  flush: "sync",
});

export function useAppMode() {
  const isLocal = computed(() => mode.value === "local");
  const isSupabase = computed(() => mode.value === "supabase");
  const isSet = computed(() => mode.value !== null);

  function setMode(appMode: AppMode) {
    mode.value = appMode;
  }

  function clearMode() {
    mode.value = null;
  }

  return {
    mode,
    isLocal,
    isSupabase,
    isSet,
    setMode,
    clearMode,
  };
}
