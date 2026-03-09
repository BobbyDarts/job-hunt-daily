import { useMagicKeys, whenever } from "@vueuse/core";

import { createDialogState } from "@/components/app/lib/dialog";
import { useInputGuard } from "@/composables/use-input-guard";

const state = createDialogState();

export function useCommandPalette() {
  const { notUsingInput } = useInputGuard();

  const { ctrl_k, meta_k } = useMagicKeys({
    passive: false,
    onEventFired(e) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) e.preventDefault();
    },
  });

  whenever(ctrl_k, () => {
    if (notUsingInput.value) state.open.value = true;
  });
  whenever(meta_k, () => {
    if (notUsingInput.value) state.open.value = true;
  });

  return {
    ...state,
    openCommandPalette: () => {
      state.open.value = true;
    },
    closeCommandPalette: () => {
      state.open.value = false;
    },
  };
}
