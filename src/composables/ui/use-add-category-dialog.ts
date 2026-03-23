// /src/composables/ui/use-add-category-dialog.ts

import { createDialogState } from "@/components/app/lib";

const state = createDialogState();

export function useAddCategoryDialog() {
  return state;
}
