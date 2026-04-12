// /src/composables/dashboard/use-report-time-range.test.ts

import { describe, it, expect, vi, beforeEach } from "vitest";

import { useReportTimeRange } from "./use-report-time-range";

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
  const { state } = useReportTimeRange();
  state.timeRange = "30d";
});

describe("useReportTimeRange", () => {
  describe("default state", () => {
    it("defaults to '30d'", () => {
      const { state } = useReportTimeRange();
      expect(state.timeRange).toBe("30d");
    });
  });

  describe("TIME_RANGES", () => {
    it("exposes all four time range options", () => {
      const { TIME_RANGES } = useReportTimeRange();
      expect(TIME_RANGES.map(r => r.value)).toEqual([
        "7d",
        "30d",
        "90d",
        "all",
      ]);
    });

    it("each range has a label", () => {
      const { TIME_RANGES } = useReportTimeRange();
      for (const range of TIME_RANGES) {
        expect(typeof range.label).toBe("string");
        expect(range.label.length).toBeGreaterThan(0);
      }
    });
  });

  describe("state is shared across callers", () => {
    it("returns the same state instance from multiple calls", () => {
      const a = useReportTimeRange();
      const b = useReportTimeRange();
      a.state.timeRange = "7d";
      expect(b.state.timeRange).toBe("7d");
    });
  });

  describe("URL sync — toQuery", () => {
    it("omits range param when value is default '30d'", () => {
      const { state } = useReportTimeRange();
      state.timeRange = "30d";
      const query = mockReplace.mock.calls.at(-1)?.[0]?.query ?? {};
      expect(query.range).toBeUndefined();
    });

    it("includes range param when value is '7d'", async () => {
      const { state } = useReportTimeRange();
      state.timeRange = "7d";
      await Promise.resolve();
      const query = mockReplace.mock.calls.at(-1)?.[0]?.query ?? {};
      expect(query.range).toBe("7d");
    });

    it("includes range param when value is '90d'", async () => {
      const { state } = useReportTimeRange();
      state.timeRange = "90d";
      await Promise.resolve();
      const query = mockReplace.mock.calls.at(-1)?.[0]?.query ?? {};
      expect(query.range).toBe("90d");
    });

    it("includes range param when value is 'all'", async () => {
      const { state } = useReportTimeRange();
      state.timeRange = "all";
      await Promise.resolve();
      const query = mockReplace.mock.calls.at(-1)?.[0]?.query ?? {};
      expect(query.range).toBe("all");
    });
  });

  describe("URL sync — fromQuery", () => {
    it("reads '7d' from query param on mount", () => {
      mockQuery.value = { range: "7d" };
      const { state } = useReportTimeRange();
      expect(state.timeRange).toBe("7d");
    });

    it("reads '90d' from query param on mount", () => {
      mockQuery.value = { range: "90d" };
      const { state } = useReportTimeRange();
      expect(state.timeRange).toBe("90d");
    });

    it("reads 'all' from query param on mount", () => {
      mockQuery.value = { range: "all" };
      const { state } = useReportTimeRange();
      expect(state.timeRange).toBe("all");
    });

    it("falls back to '30d' for an invalid query param", () => {
      mockQuery.value = { range: "invalid" };
      const { state } = useReportTimeRange();
      expect(state.timeRange).toBe("30d");
    });

    it("falls back to '30d' when range param is absent", () => {
      mockQuery.value = {};
      const { state } = useReportTimeRange();
      expect(state.timeRange).toBe("30d");
    });
  });
});
