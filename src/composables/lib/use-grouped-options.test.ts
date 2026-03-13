// /src/composables/lib/use-grouped-options.test.ts

import { describe, it, expect } from "vitest";
import { ref } from "vue";

import type { GroupableOption } from "./use-grouped-options";
import { useGroupedOptions } from "./use-grouped-options";

describe("useGroupedOptions", () => {
  const basicOptions: GroupableOption[] = [
    { value: "apple", label: "Apple", category: "Fruit" },
    { value: "banana", label: "Banana", category: "Fruit" },
    { value: "carrot", label: "Carrot", category: "Vegetable" },
    { value: "daikon", label: "Daikon", category: "Vegetable" },
    { value: "elderberry", label: "Elderberry" },
  ];

  describe("filtered", () => {
    it("returns all options when no search query", () => {
      const { filtered } = useGroupedOptions(() => basicOptions);
      expect(filtered.value).toHaveLength(5);
    });

    it("filters by label case-insensitively", () => {
      const query = ref("APPLE");
      const { filtered } = useGroupedOptions(() => basicOptions, {
        searchQuery: query,
      });
      expect(filtered.value).toHaveLength(1);
      expect(filtered.value[0].value).toBe("apple");
    });

    it("filters by partial label match", () => {
      const query = ref("an");
      const { filtered } = useGroupedOptions(() => basicOptions, {
        searchQuery: query,
      });
      // Banana matches "an"
      expect(filtered.value).toHaveLength(1);
      expect(filtered.value[0].value).toBe("banana");
    });

    it("returns empty array when no options match query", () => {
      const query = ref("zzz");
      const { filtered } = useGroupedOptions(() => basicOptions, {
        searchQuery: query,
      });
      expect(filtered.value).toHaveLength(0);
    });

    it("returns all options when query is empty string", () => {
      const query = ref("");
      const { filtered } = useGroupedOptions(() => basicOptions, {
        searchQuery: query,
      });
      expect(filtered.value).toHaveLength(5);
    });

    it("reacts to query changes", () => {
      const query = ref("apple");
      const { filtered } = useGroupedOptions(() => basicOptions, {
        searchQuery: query,
      });
      expect(filtered.value).toHaveLength(1);

      query.value = "carrot";
      expect(filtered.value).toHaveLength(1);
      expect(filtered.value[0].value).toBe("carrot");

      query.value = "";
      expect(filtered.value).toHaveLength(5);
    });
  });

  describe("grouped — ungrouped mode", () => {
    it("returns single group with null category by default", () => {
      const { grouped } = useGroupedOptions(() => basicOptions);
      expect(grouped.value).toHaveLength(1);
      expect(grouped.value[0].category).toBeNull();
      expect(grouped.value[0].options).toHaveLength(5);
    });

    it("returns single group when groupByCategory is false", () => {
      const { grouped } = useGroupedOptions(() => basicOptions, {
        groupByCategory: false,
      });
      expect(grouped.value).toHaveLength(1);
      expect(grouped.value[0].options).toHaveLength(5);
    });

    it("returns single group when groupByCategory ref is false", () => {
      const groupBy = ref(false);
      const { grouped } = useGroupedOptions(() => basicOptions, {
        groupByCategory: groupBy,
      });
      expect(grouped.value).toHaveLength(1);
    });
  });

  describe("grouped — grouped mode", () => {
    it("groups options by category", () => {
      const { grouped } = useGroupedOptions(() => basicOptions, {
        groupByCategory: true,
      });
      expect(grouped.value).toHaveLength(3); // Fruit, Vegetable, Other
      const categories = grouped.value.map(g => g.category);
      expect(categories).toContain("Fruit");
      expect(categories).toContain("Vegetable");
      expect(categories).toContain("Other");
    });

    it("places options without category into Other group", () => {
      const { grouped } = useGroupedOptions(() => basicOptions, {
        groupByCategory: true,
      });
      const other = grouped.value.find(g => g.category === "Other");
      expect(other?.options).toHaveLength(1);
      expect(other?.options[0].value).toBe("elderberry");
    });

    it("places all options in Other when none have categories", () => {
      const noCategoryOptions: GroupableOption[] = [
        { value: "a", label: "A" },
        { value: "b", label: "B" },
      ];
      const { grouped } = useGroupedOptions(() => noCategoryOptions, {
        groupByCategory: true,
      });
      expect(grouped.value).toHaveLength(1);
      expect(grouped.value[0].category).toBe("Other");
      expect(grouped.value[0].options).toHaveLength(2);
    });

    it("reacts to groupByCategory ref changes", () => {
      const groupBy = ref(false);
      const { grouped } = useGroupedOptions(() => basicOptions, {
        groupByCategory: groupBy,
      });
      expect(grouped.value).toHaveLength(1);

      groupBy.value = true;
      expect(grouped.value).toHaveLength(3);

      groupBy.value = false;
      expect(grouped.value).toHaveLength(1);
    });

    it("preserves insertion order of categories", () => {
      const { grouped } = useGroupedOptions(() => basicOptions, {
        groupByCategory: true,
      });
      // Fruit appears first in the options array
      expect(grouped.value[0].category).toBe("Fruit");
      expect(grouped.value[1].category).toBe("Vegetable");
    });
  });

  describe("sortWithin", () => {
    it("sorts options alphabetically within groups when sortWithin is true", () => {
      const unsorted: GroupableOption[] = [
        { value: "z", label: "Zebra", category: "Animals" },
        { value: "a", label: "Ant", category: "Animals" },
        { value: "m", label: "Moose", category: "Animals" },
      ];
      const { grouped } = useGroupedOptions(() => unsorted, {
        sortWithin: true,
      });
      const labels = grouped.value[0].options.map(o => o.label);
      expect(labels).toEqual(["Ant", "Moose", "Zebra"]);
    });

    it("does not sort options when sortWithin is false", () => {
      const unsorted: GroupableOption[] = [
        { value: "z", label: "Zebra" },
        { value: "a", label: "Ant" },
        { value: "m", label: "Moose" },
      ];
      const { grouped } = useGroupedOptions(() => unsorted, {
        sortWithin: false,
      });
      const labels = grouped.value[0].options.map(o => o.label);
      expect(labels).toEqual(["Zebra", "Ant", "Moose"]);
    });

    it("does not mutate the original options array", () => {
      const opts: GroupableOption[] = [
        { value: "z", label: "Zebra" },
        { value: "a", label: "Ant" },
      ];
      const originalOrder = opts.map(o => o.value);
      useGroupedOptions(() => opts, { sortWithin: true });
      expect(opts.map(o => o.value)).toEqual(originalOrder);
    });
  });

  describe("isEmpty", () => {
    it("returns false when options exist", () => {
      const { isEmpty } = useGroupedOptions(() => basicOptions);
      expect(isEmpty.value).toBe(false);
    });

    it("returns true when options array is empty", () => {
      const { isEmpty } = useGroupedOptions(() => []);
      expect(isEmpty.value).toBe(true);
    });

    it("returns true when search query filters out all options", () => {
      const query = ref("zzz");
      const { isEmpty } = useGroupedOptions(() => basicOptions, {
        searchQuery: query,
      });
      expect(isEmpty.value).toBe(true);
    });

    it("reacts to query changes", () => {
      const query = ref("zzz");
      const { isEmpty } = useGroupedOptions(() => basicOptions, {
        searchQuery: query,
      });
      expect(isEmpty.value).toBe(true);

      query.value = "";
      expect(isEmpty.value).toBe(false);
    });
  });

  describe("selectedCountByCategory", () => {
    it("counts selected options per category", () => {
      const selected = new Set(["apple", "carrot"]);
      const { selectedCountByCategory } = useGroupedOptions(
        () => basicOptions,
        { groupByCategory: true },
      );
      const counts = selectedCountByCategory(v => selected.has(v));
      expect(counts.value["Fruit"]).toBe(1);
      expect(counts.value["Vegetable"]).toBe(1);
      expect(counts.value["Other"]).toBe(0);
    });

    it("returns zero counts when nothing is selected", () => {
      const { selectedCountByCategory } = useGroupedOptions(
        () => basicOptions,
        { groupByCategory: true },
      );
      const counts = selectedCountByCategory(() => false);
      expect(counts.value["Fruit"]).toBe(0);
      expect(counts.value["Vegetable"]).toBe(0);
    });

    it("counts all options when all are selected", () => {
      const { selectedCountByCategory } = useGroupedOptions(
        () => basicOptions,
        { groupByCategory: true },
      );
      const counts = selectedCountByCategory(() => true);
      expect(counts.value["Fruit"]).toBe(2);
      expect(counts.value["Vegetable"]).toBe(2);
      expect(counts.value["Other"]).toBe(1);
    });

    it("works in ungrouped mode with null category key", () => {
      const selected = new Set(["apple", "banana"]);
      const { selectedCountByCategory } = useGroupedOptions(() => basicOptions);
      const counts = selectedCountByCategory(v => selected.has(v));
      expect(counts.value[String(null)]).toBe(2);
    });
  });
});
