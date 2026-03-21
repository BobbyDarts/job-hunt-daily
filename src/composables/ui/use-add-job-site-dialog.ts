// /src/composables/ui/use-add-job-site-dialog.ts

import { createDialogState } from "@/components/app/lib";

const state = createDialogState<string>();

export function useAddJobSiteDialog() {
  return {
    ...state,
    category: state.payload,
  };
}
