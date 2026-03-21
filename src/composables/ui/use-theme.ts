// /src/composables/ui/use-theme.ts

import { useColorMode, usePreferredDark } from "@vueuse/core";
import { Moon, Sun } from "lucide-vue-next";
import { computed } from "vue";

export function useTheme() {
  const colorMode = useColorMode();
  const isSystemDark = usePreferredDark();

  const toggleTheme = () => {
    if (colorMode.value === "auto") {
      colorMode.value = isSystemDark.value ? "light" : "dark";
    } else {
      colorMode.value = colorMode.value === "dark" ? "light" : "dark";
    }
  };

  const themeMode = computed<"light" | "dark">(() =>
    colorMode.value === "auto"
      ? isSystemDark.value
        ? "dark"
        : "light"
      : colorMode.value,
  );

  const themeText = computed(() =>
    themeMode.value === "dark" ? "Dark" : "Light",
  );

  const themeIcon = computed(() => (themeMode.value === "dark" ? Sun : Moon));

  return {
    colorMode,
    toggleTheme,
    themeMode,
    themeText,
    themeIcon,
  };
}
