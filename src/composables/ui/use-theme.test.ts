import { Sun, Moon } from "@lucide/vue";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";

import { useTheme } from ".";

// --- Mock VueUse composables ---

const mockColorMode = ref<"light" | "dark" | "auto">("light");
const mockSystemDark = ref(false);

vi.mock("@vueuse/core", () => ({
  useColorMode: () => mockColorMode,
  usePreferredDark: () => mockSystemDark,
}));

// Reset state before each test
beforeEach(() => {
  mockColorMode.value = "light";
  mockSystemDark.value = false;
});

describe("useTheme", () => {
  describe("toggleTheme", () => {
    it("toggles dark → light", () => {
      mockColorMode.value = "dark";

      const { toggleTheme } = useTheme();
      toggleTheme();

      expect(mockColorMode.value).toBe("light");
    });

    it("toggles light → dark", () => {
      mockColorMode.value = "light";

      const { toggleTheme } = useTheme();
      toggleTheme();

      expect(mockColorMode.value).toBe("dark");
    });

    it("auto + system dark → light", () => {
      mockColorMode.value = "auto";
      mockSystemDark.value = true;

      const { toggleTheme } = useTheme();
      toggleTheme();

      expect(mockColorMode.value).toBe("light");
    });

    it("auto + system light → dark", () => {
      mockColorMode.value = "auto";
      mockSystemDark.value = false;

      const { toggleTheme } = useTheme();
      toggleTheme();

      expect(mockColorMode.value).toBe("dark");
    });
  });

  describe("themeMode", () => {
    it("resolves auto + system dark → dark", () => {
      mockColorMode.value = "auto";
      mockSystemDark.value = true;

      const { themeMode } = useTheme();

      expect(themeMode.value).toBe("dark");
    });

    it("resolves auto + system light → light", () => {
      mockColorMode.value = "auto";
      mockSystemDark.value = false;

      const { themeMode } = useTheme();

      expect(themeMode.value).toBe("light");
    });

    it("passes through explicit dark mode", () => {
      mockColorMode.value = "dark";

      const { themeMode } = useTheme();

      expect(themeMode.value).toBe("dark");
    });

    it("passes through explicit light mode", () => {
      mockColorMode.value = "light";

      const { themeMode } = useTheme();

      expect(themeMode.value).toBe("light");
    });
  });

  describe("themeText", () => {
    it("themeText shows 'Dark' in dark mode", () => {
      mockColorMode.value = "dark";

      const { themeText } = useTheme();

      expect(themeText.value).toBe("Dark");
    });

    it("themeText shows 'Light' in light mode", () => {
      mockColorMode.value = "light";

      const { themeText } = useTheme();

      expect(themeText.value).toBe("Light");
    });
  });

  describe("themeIcon", () => {
    it("uses Sun icon in dark mode", () => {
      mockColorMode.value = "dark";

      const { themeIcon } = useTheme();

      expect(themeIcon.value).toBe(Sun);
    });

    it("uses Moon icon in light mode", () => {
      mockColorMode.value = "light";

      const { themeIcon } = useTheme();

      expect(themeIcon.value).toBe(Moon);
    });
  });

  describe("reactivity", () => {
    it("reacts to system preference changes in auto mode", () => {
      mockColorMode.value = "auto";
      mockSystemDark.value = true;

      const { themeMode } = useTheme();

      expect(themeMode.value).toBe("dark");

      mockSystemDark.value = false;

      expect(themeMode.value).toBe("light");
    });
  });
});
