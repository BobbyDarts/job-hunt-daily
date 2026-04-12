// /src/lib/chart-utils.test.ts

import { describe, it, expect, beforeEach, afterEach } from "vitest";

import { getStatuses } from "@/types";

import {
  STATUS_CHART_COLORS,
  getStatusChartColor,
  resolveChartColor,
} from "./chart-utils";

describe("chart-utils", () => {
  describe("STATUS_CHART_COLORS", () => {
    it("has an entry for every application status", () => {
      const statuses = getStatuses().map(s => s.status);
      for (const status of statuses) {
        expect(STATUS_CHART_COLORS[status]).toBeDefined();
      }
    });

    it("all values are non-empty strings", () => {
      for (const value of Object.values(STATUS_CHART_COLORS)) {
        expect(typeof value).toBe("string");
        expect(value.length).toBeGreaterThan(0);
      }
    });
  });

  describe("getStatusChartColor", () => {
    it("returns the correct color for each status", () => {
      const statuses = getStatuses().map(s => s.status);
      for (const status of statuses) {
        expect(getStatusChartColor(status)).toBe(STATUS_CHART_COLORS[status]);
      }
    });

    it("returns a CSS variable string for applied", () => {
      expect(getStatusChartColor("applied")).toBe("var(--chart-1)");
    });

    it("returns a CSS variable string for withdrew", () => {
      expect(getStatusChartColor("withdrew")).toBe("var(--muted-foreground)");
    });
  });

  describe("resolveChartColor", () => {
    beforeEach(() => {
      document.documentElement.style.setProperty(
        "--chart-1",
        "oklch(0.646 0.222 41.116)",
      );
      document.documentElement.style.setProperty(
        "--muted-foreground",
        "oklch(0.55 0.02 264)",
      );
    });

    afterEach(() => {
      document.documentElement.style.removeProperty("--chart-1");
      document.documentElement.style.removeProperty("--muted-foreground");
    });

    it("resolves a var() CSS variable to its computed value", () => {
      const result = resolveChartColor("var(--chart-1)");
      expect(result).toBe("oklch(0.646 0.222 41.116)");
    });

    it("resolves a different CSS variable", () => {
      const result = resolveChartColor("var(--muted-foreground)");
      expect(result).toBe("oklch(0.55 0.02 264)");
    });

    it("returns empty string for an undefined CSS variable", () => {
      const result = resolveChartColor("var(--does-not-exist)");
      expect(result).toBe("");
    });

    it("strips whitespace from the resolved value", () => {
      document.documentElement.style.setProperty(
        "--chart-1",
        "  oklch(0.646 0.222 41.116)  ",
      );
      const result = resolveChartColor("var(--chart-1)");
      expect(result).toBe("oklch(0.646 0.222 41.116)");
    });
  });
});
