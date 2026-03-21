// /src/composables/keyboard/use-keyboard-shortcuts.ts

import { useMagicKeys, whenever } from "@vueuse/core";
import { logicAnd } from "@vueuse/math";
import { computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { useVisitedSites } from "@/composables/data";
import {
  useAddApplicationDialog,
  useShortcutReference,
  useSiteFocus,
  useTheme,
} from "@/composables/ui";

import { useInputGuard } from "./use-input-guard";

/**
 * | Key | Action |
 * |-----------|------------------------------------|
 * | `j` / `k` | Move focus down / up through sites
 * | `a`       | Log application for focused site
 * | `v`       | Mark focused site as visited
 * | `g a`     | Go to Applications view
 * | `g h`     | Go to Home
 * | `g j`     | Go to Job Sites
 * | `t`       | Toggle theme
 * | `?`       | Show shortcut reference
 */
export function useKeyboardShortcuts() {
  // composables
  const route = useRoute();
  const router = useRouter();

  const { openDialog: openShortcutReference } = useShortcutReference();

  const onHome = computed(() => route.name === "Home");
  const { notUsingInput } = useInputGuard();

  const { clear, focusNext, focusPrev, focusedSite } = useSiteFocus();
  const { openDialog } = useAddApplicationDialog();
  const { markVisited } = useVisitedSites();
  const { toggleTheme } = useTheme();

  const { j, k, a, v, g, h, t, shift_slash } = useMagicKeys({ passive: false });

  watch(
    () => route.name,
    () => clear(),
  );

  // g sequence
  let gPressed = false;
  let gTimer: ReturnType<typeof setTimeout>;

  whenever(logicAnd(g, notUsingInput), () => {
    gPressed = true;
    clearTimeout(gTimer);
    gTimer = setTimeout(() => {
      gPressed = false;
    }, 500);
  });

  whenever(logicAnd(j, notUsingInput), () => {
    if (gPressed) {
      gPressed = false;
      void router.push("/job-sites");
      return;
    }
    if (onHome.value) focusNext();
  });
  whenever(logicAnd(k, notUsingInput, onHome), () => focusPrev());

  whenever(logicAnd(a, notUsingInput), () => {
    if (gPressed) {
      gPressed = false;
      void router.push("/applications");
      return;
    }
    if (focusedSite.value) openDialog(focusedSite.value);
  });

  whenever(logicAnd(h, notUsingInput), () => {
    if (gPressed) {
      gPressed = false;
      void router.push("/");
    }
  });

  whenever(logicAnd(v, notUsingInput), async () => {
    if (focusedSite.value) await markVisited(focusedSite.value.url);
  });

  whenever(logicAnd(t, notUsingInput), async () => {
    toggleTheme();
  });

  // shift+/ === "?"
  whenever(logicAnd(shift_slash, notUsingInput), () => {
    openShortcutReference();
  });

  return {};
}
