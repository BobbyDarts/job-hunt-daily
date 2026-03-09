// /src/components/app/lib/dialog.ts

import { ref } from "vue";

export function createDialogState<T = void>() {
  const open = ref(false);
  const payload = ref<T | null>(null);
  return {
    open,
    payload,
    openDialog: (p?: T) => {
      payload.value = p ?? null;
      open.value = true;
    },
    closeDialog: () => {
      open.value = false;
      payload.value = null;
    },
  };
}
