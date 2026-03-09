// /src/composables/ui/use-site-focus.ts

import { ref } from "vue";

import type { JobSite } from "@/types";

const focusedIndex = ref(-1);
const focusedSite = ref<JobSite | null>(null);
const siteButtons = ref<{ el: HTMLElement; site: JobSite }[]>([]);

export function useSiteFocus() {
  const register = (el: HTMLElement, site: JobSite) =>
    siteButtons.value.push({ el, site });

  const unregister = (el: HTMLElement) => {
    const index = siteButtons.value.findIndex(entry => entry.el === el);
    if (index === -1) return;
    siteButtons.value.splice(index, 1);
    // Keep focusedIndex valid after removal
    if (index < focusedIndex.value) {
      focusedIndex.value--;
    } else if (index === focusedIndex.value) {
      focusedIndex.value = Math.min(
        focusedIndex.value,
        siteButtons.value.length - 1,
      );
      focusedSite.value = siteButtons.value[focusedIndex.value]?.site ?? null;
    }
  };

  const clear = () => {
    siteButtons.value = [];
    focusedSite.value = null;
    focusedIndex.value = -1;
  };

  const focusNext = () => {
    if (siteButtons.value.length === 0) return;
    const startIndex = focusedIndex.value === -1 ? -1 : focusedIndex.value;
    focusedIndex.value = (startIndex + 1) % siteButtons.value.length;
    const entry = siteButtons.value[focusedIndex.value];
    if (entry) {
      entry.el.focus();
      focusedSite.value = entry.site;
    }
  };

  const focusPrev = () => {
    if (siteButtons.value.length === 0) return;
    const startIndex = focusedIndex.value === -1 ? 0 : focusedIndex.value;
    focusedIndex.value =
      (startIndex - 1 + siteButtons.value.length) % siteButtons.value.length;
    const entry = siteButtons.value[focusedIndex.value];
    if (entry) {
      entry.el.focus();
      focusedSite.value = entry.site;
    }
  };

  return { register, unregister, clear, focusNext, focusPrev, focusedSite };
}
