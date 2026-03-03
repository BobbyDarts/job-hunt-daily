// /src/composables/use-shortcut-reference.ts

import { ref } from "vue";

const open = ref(false);

export function useShortcutReference() {
  return {
    open,
    openDialog: () => {
      open.value = true;
    },
    closeDialog: () => {
      open.value = false;
    },
  };
}
