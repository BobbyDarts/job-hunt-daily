// /src/composables/lib/use-toolbar-state.test.ts

import { describe, it, expect } from "vitest";
import { reactive } from "vue";

import { useToolbarState } from "./use-toolbar-state";

describe("useToolbarState", () => {
  describe("hasActiveFilters", () => {
    it("returns false when all string filters are empty", () => {
      const filters = reactive({ search: "", category: "all" });
      const { hasActiveFilters } = useToolbarState(filters);
      expect(hasActiveFilters.value).toBe(false);
    });

    it("returns true when a string filter has a value", () => {
      const filters = reactive({ search: "react", category: "all" });
      const { hasActiveFilters } = useToolbarState(filters);
      expect(hasActiveFilters.value).toBe(true);
    });

    it('treats "all" as inactive', () => {
      const filters = reactive({ category: "all" });
      const { hasActiveFilters } = useToolbarState(filters);
      expect(hasActiveFilters.value).toBe(false);
    });

    it('treats non-"all" string as active', () => {
      const filters = reactive({ category: "tech-companies" });
      const { hasActiveFilters } = useToolbarState(filters);
      expect(hasActiveFilters.value).toBe(true);
    });

    it("returns false when array filters are empty", () => {
      const filters = reactive({ tags: [] as string[] });
      const { hasActiveFilters } = useToolbarState(filters);
      expect(hasActiveFilters.value).toBe(false);
    });

    it("returns true when array filter has items", () => {
      const filters = reactive({ tags: ["referral"] });
      const { hasActiveFilters } = useToolbarState(filters);
      expect(hasActiveFilters.value).toBe(true);
    });

    it("returns false when filter is undefined", () => {
      const filters = reactive({ search: undefined as string | undefined });
      const { hasActiveFilters } = useToolbarState(filters);
      expect(hasActiveFilters.value).toBe(false);
    });

    it("returns false when filter is null", () => {
      const filters = reactive({ search: null as string | null });
      const { hasActiveFilters } = useToolbarState(filters);
      expect(hasActiveFilters.value).toBe(false);
    });

    it("is reactive — updates when filter changes", () => {
      const filters = reactive({ search: "" });
      const { hasActiveFilters } = useToolbarState(filters);
      expect(hasActiveFilters.value).toBe(false);
      filters.search = "react";
      expect(hasActiveFilters.value).toBe(true);
    });
  });

  describe("clear", () => {
    it("resets string filters to empty string", () => {
      const filters = reactive({ search: "react", category: "tech-companies" });
      const { clear } = useToolbarState(filters);
      clear();
      expect(filters.search).toBe("");
      expect(filters.category).toBe("");
    });

    it("resets array filters to empty array", () => {
      const filters = reactive({ tags: ["referral", "cold_apply"] });
      const { clear } = useToolbarState(filters);
      clear();
      expect(filters.tags).toEqual([]);
    });

    it("resets mixed filter types", () => {
      const filters = reactive({
        search: "react",
        tags: ["referral"],
        category: "tech-companies",
      });
      const { clear } = useToolbarState(filters);
      clear();
      expect(filters.search).toBe("");
      expect(filters.tags).toEqual([]);
      expect(filters.category).toBe("");
    });

    it("hasActiveFilters becomes false after clear", () => {
      const filters = reactive({ search: "react", category: "tech-companies" });
      const { hasActiveFilters, clear } = useToolbarState(filters);
      expect(hasActiveFilters.value).toBe(true);
      clear();
      expect(hasActiveFilters.value).toBe(false);
    });
  });
});
