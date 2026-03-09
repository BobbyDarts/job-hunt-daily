// /src/composables/use-input-guard.ts

import { useActiveElement } from "@vueuse/core";
import { computed } from "vue";

export function useInputGuard() {
  const activeElement = useActiveElement();
  const notUsingInput = computed(() => {
    return !["INPUT", "TEXTAREA"].includes(activeElement.value?.tagName ?? "");
  });

  return {
    notUsingInput,
  };
}
