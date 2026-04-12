// /src/composables/dashboard/use-period-unit.test.ts

import { describe, it, expect, vi, beforeEach } from "vitest";

import { usePeriodUnit } from "./use-period-unit";

const mockReplace = vi.fn();
const mockQuery = { value: {} as Record<string, string> };

vi.mock("vue-router", () => ({
  useRoute: () => ({ name: "test", query: mockQuery.value }),
  useRouter: () => ({ replace: mockReplace }),
}));

beforeEach(() => {
  mockReplace.mockReset();
  mockQuery.value = {};
  // Reset singleton state to default
  const { state } = usePeriodUnit();
  state.periodUnit = "day";
});

describe("usePeriodUnit", () => {
  describe("default state", () => {
    it("defaults to 'day'", () => {
      const { state } = usePeriodUnit();
      expect(state.periodUnit).toBe("day");
    });
  });

  describe("state is shared across callers", () => {
    it("returns the same state instance from multiple calls", () => {
      const a = usePeriodUnit();
      const b = usePeriodUnit();
      a.state.periodUnit = "week";
      expect(b.state.periodUnit).toBe("week");
    });
  });

  describe("URL sync — toQuery", () => {
    it("omits period param when value is default 'day'", () => {
      const { state } = usePeriodUnit();
      state.periodUnit = "day";
      const query = mockReplace.mock.calls.at(-1)?.[0]?.query ?? {};
      expect(query.period).toBeUndefined();
    });

    it("includes period param when value is 'week'", async () => {
      const { state } = usePeriodUnit();
      state.periodUnit = "week";
      await Promise.resolve();
      const query = mockReplace.mock.calls.at(-1)?.[0]?.query ?? {};
      expect(query.period).toBe("week");
    });

    it("includes period param when value is 'month'", async () => {
      const { state } = usePeriodUnit();
      state.periodUnit = "month";
      await Promise.resolve();
      const query = mockReplace.mock.calls.at(-1)?.[0]?.query ?? {};
      expect(query.period).toBe("month");
    });
  });

  describe("URL sync — fromQuery", () => {
    it("reads 'week' from query param on mount", () => {
      mockQuery.value = { period: "week" };
      const { state } = usePeriodUnit();
      expect(state.periodUnit).toBe("week");
    });

    it("reads 'month' from query param on mount", () => {
      mockQuery.value = { period: "month" };
      const { state } = usePeriodUnit();
      expect(state.periodUnit).toBe("month");
    });

    it("falls back to 'day' for an invalid query param", () => {
      mockQuery.value = { period: "invalid" };
      const { state } = usePeriodUnit();
      expect(state.periodUnit).toBe("day");
    });

    it("falls back to 'day' when period param is absent", () => {
      mockQuery.value = {};
      const { state } = usePeriodUnit();
      expect(state.periodUnit).toBe("day");
    });
  });
});
