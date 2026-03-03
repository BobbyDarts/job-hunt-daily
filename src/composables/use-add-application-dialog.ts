// /src/composables/use-add-application-dialog.ts

import { ref } from "vue";

import type { JobSite } from "@/types";

const open = ref(false);
const site = ref<JobSite | null>(null);

export function useAddApplicationDialog() {
  return {
    open,
    site,
    openDialog: (s: JobSite | null = null) => {
      site.value = s;
      open.value = true;
    },
    closeDialog: () => {
      open.value = false;
      site.value = null;
    },
  };
}
