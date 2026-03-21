// /src/composables/ui/use-command-palette.ts

import { useMagicKeys, whenever } from "@vueuse/core";

import { createDialogState } from "@/components/app/lib/dialog";
import { useInputGuard } from "@/composables/keyboard";

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

  function openCommandPalette() {
    state.open.value = true;
  }

  function closeCommandPalette() {
    state.open.value = false;
  }

  function withClose<T extends unknown[], R>(
    fn: (...args: T) => R | Promise<R>,
  ) {
    return async (...args: T): Promise<R> => {
      const result = await fn(...args);
      closeCommandPalette();
      return result;
    };
  }

  return {
    ...state,
    openCommandPalette,
    closeCommandPalette,
    withClose,
  };
}
