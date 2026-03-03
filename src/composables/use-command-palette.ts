// /src/composables/use-command-palette.ts

import { useActiveElement, useMagicKeys, whenever } from "@vueuse/core";
import { computed, ref } from "vue";

const open = ref(false);

export function useCommandPalette() {
  const activeElement = useActiveElement();
  const notUsingInput = computed(() => {
    return !["INPUT", "TEXTAREA"].includes(activeElement.value?.tagName ?? "");
  });

  const setOpen = (value: boolean) => (open.value = value);

  const { ctrl_k, meta_k } = useMagicKeys({
    passive: false,
    onEventFired(e) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) e.preventDefault();
    },
  });

  whenever(ctrl_k, () => {
    if (notUsingInput.value) setOpen(true);
  });

  whenever(meta_k, () => {
    if (notUsingInput.value) setOpen(true);
  });

  return {
    open,
    openCommandPalette: () => setOpen(true),
    closeCommandPalette: () => setOpen(false),
  };
}
