// /src/composables/lib/use-select-model.test.ts

import { describe, it, expect, vi } from "vitest";

import { useSelectModel } from "./use-select-model";

describe("useSelectModel", () => {
  describe("single select mode", () => {
    it("emits the selected value on toggle", () => {
      const emit = vi.fn();
      const { toggle } = useSelectModel(() => "a" as string, emit);

      toggle("b");
      expect(emit).toHaveBeenCalledWith("b");
    });

    it("emits the same value when toggling current selection", () => {
      const emit = vi.fn();
      const { toggle } = useSelectModel(() => "a" as string, emit);

      // Single select has no deselect — toggling current value re-emits it
      toggle("a");
      expect(emit).toHaveBeenCalledWith("a");
    });

    it("isSelected returns true for current value", () => {
      const { isSelected } = useSelectModel(() => "a" as string, vi.fn());
      expect(isSelected("a")).toBe(true);
    });

    it("isSelected returns false for non-current value", () => {
      const { isSelected } = useSelectModel(() => "a" as string, vi.fn());
      expect(isSelected("b")).toBe(false);
    });

    it("selectedCount returns 1 when a value is selected", () => {
      const { selectedCount } = useSelectModel(() => "a", vi.fn());
      expect(selectedCount.value).toBe(1);
    });

    it("selectedCount returns 0 when value is empty string", () => {
      const { selectedCount } = useSelectModel(() => "" as string, vi.fn());
      expect(selectedCount.value).toBe(0);
    });
  });

  describe("multiple select mode", () => {
    it("adds a value to the selection on toggle", () => {
      const emit = vi.fn();
      const { toggle } = useSelectModel(() => ["a"] as string[], emit, {
        multiple: true,
      });

      toggle("b");
      expect(emit).toHaveBeenCalledWith(["a", "b"]);
    });

    it("removes a value from the selection when already selected", () => {
      const emit = vi.fn();
      const { toggle } = useSelectModel(() => ["a", "b"] as string[], emit, {
        multiple: true,
      });

      toggle("a");
      expect(emit).toHaveBeenCalledWith(["b"]);
    });

    it("can select first item into empty array", () => {
      const emit = vi.fn();
      const { toggle } = useSelectModel(() => [] as string[], emit, {
        multiple: true,
      });

      toggle("a");
      expect(emit).toHaveBeenCalledWith(["a"]);
    });

    it("can deselect last item leaving empty array", () => {
      const emit = vi.fn();
      const { toggle } = useSelectModel(() => ["a"] as string[], emit, {
        multiple: true,
      });

      toggle("a");
      expect(emit).toHaveBeenCalledWith([]);
    });

    it("isSelected returns true for value in array", () => {
      const { isSelected } = useSelectModel(
        () => ["a", "b"] as string[],
        vi.fn(),
        {
          multiple: true,
        },
      );
      expect(isSelected("a")).toBe(true);
      expect(isSelected("b")).toBe(true);
    });

    it("isSelected returns false for value not in array", () => {
      const { isSelected } = useSelectModel(() => ["a"] as string[], vi.fn(), {
        multiple: true,
      });
      expect(isSelected("b")).toBe(false);
    });

    it("selectedCount returns number of selected items", () => {
      const { selectedCount } = useSelectModel(() => ["a", "b", "c"], vi.fn(), {
        multiple: true,
      });
      expect(selectedCount.value).toBe(3);
    });

    it("selectedCount returns 0 for empty selection", () => {
      const { selectedCount } = useSelectModel(() => [], vi.fn(), {
        multiple: true,
      });
      expect(selectedCount.value).toBe(0);
    });

    it("handles non-array current value gracefully by treating as empty", () => {
      const emit = vi.fn();
      // Simulates misconfigured state — current value is string but multiple is true
      const { toggle } = useSelectModel(
        () => "a" as unknown as string[],
        emit,
        { multiple: true },
      );

      toggle("b");
      expect(emit).toHaveBeenCalledWith(["b"]);
    });
  });

  describe("__all__ special value", () => {
    it("emits empty array when __all__ is toggled in multiple mode", () => {
      const emit = vi.fn();
      const { toggle } = useSelectModel(() => ["a", "b"] as string[], emit, {
        multiple: true,
      });

      toggle("__all__");
      expect(emit).toHaveBeenCalledWith([]);
    });

    it("emits __all__ string when __all__ is toggled in single mode", () => {
      const emit = vi.fn();
      const { toggle } = useSelectModel(() => "a" as string, emit);

      toggle("__all__");
      expect(emit).toHaveBeenCalledWith("__all__");
    });
  });
});
