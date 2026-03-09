// /src/composables/ui/use-add-application-dialog.ts

import { createDialogState } from "@/components/app/lib/dialog";
import type { JobSite } from "@/types";

// use-add-application-dialog.ts

const state = createDialogState<JobSite>();

export function useAddApplicationDialog() {
  return {
    ...state,
    site: state.payload,
  };
}
