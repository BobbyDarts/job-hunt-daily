// /src/composables/ui/use-shortcut-reference.ts

import { createDialogState } from "@/components/app/lib";

const state = createDialogState();

export function useShortcutReference() {
  return state;
}
