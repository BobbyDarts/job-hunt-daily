// /src/lib/time.test.ts

import { Temporal } from "@js-temporal/polyfill";
import { describe, it, expect, beforeEach } from "vitest";

import { withFrozenTime } from "@/test-utils/with-frozen-time";

import {
  getNow,
  setNow,
  getToday,
  getTimeZoneId,
  setTimeZoneId,
  resetTimeSource,
  formatLocal,
  displayDate,
  todayIso,
  isSameDayIso,
  toPlainDate,
  comparePlainDate,
  toInstant,
  compareInstants,
  isAfter,
  isBefore,
  isEqual,
  maxInstant,
  minInstant,
} from "./time";

describe("time utilities", () => {
  describe("Time Source Management", () => {
    it("getNow returns current instant", () => {
      const now = getNow();
      expect(now).toBeInstanceOf(Temporal.Instant);
    });

    it("setNow overrides the current instant and date", () => {
      const fixedInstant = Temporal.Instant.from("2026-02-19T15:00:00Z");
      setNow(fixedInstant);

      try {
        const now = getNow();
        expect(now.toString()).toBe("2026-02-19T15:00:00Z");

        // Also sets today to match
        const today = getToday();
        expect(today.toString()).toBe("2026-02-19");
      } finally {
        resetTimeSource();
      }
    });

    it("getToday returns current date", () => {
      const today = getToday();
      expect(today).toBeInstanceOf(Temporal.PlainDate);
    });

    it("getTimeZoneId returns current time zone", () => {
      const tz = getTimeZoneId();
      expect(typeof tz).toBe("string");
      expect(tz.length).toBeGreaterThan(0);
    });

    it("setTimeZoneId overrides the time zone", () => {
      setTimeZoneId("America/New_York");
      try {
        const tz = getTimeZoneId();
        expect(tz).toBe("America/New_York");
      } finally {
        resetTimeSource();
      }
    });

    it("resetTimeSource restores system time source", () => {
      // Override with a fixed instant from the past
      const fixedInstant = Temporal.Instant.from("1999-01-01T15:00:00Z");
      setNow(fixedInstant);
      expect(todayIso()).toBe("1999-01-01");

      // Reset
      resetTimeSource();

      // After reset, should return a date that's definitely not our fixed date
      expect(todayIso()).not.toBe("1999-01-01");
    });

    it("withFrozenTime auto-resets after callback", () => {
      // Use raw Temporal API to capture current date (not using helper)
      const beforeTime = Temporal.Now.plainDateISO().toString();

      withFrozenTime({
        now: "2026-02-19T15:00:00Z",
        fn: () => {
          // Inside frozen time, using helper is OK - we're testing the integration
          expect(todayIso()).toBe("2026-02-19");
        },
      });

      // Should be back to original time
      expect(todayIso()).toBe(beforeTime);
    });
  });

  describe("formatLocal", () => {
    beforeEach(() => {
      setTimeZoneId("America/New_York");
      return () => resetTimeSource();
    });

    it("formats instant in local time zone", () => {
      const instant = Temporal.Instant.from("2026-02-19T15:00:00Z");
      const formatted = formatLocal(instant);

      // Should show Eastern Time (UTC-5)
      expect(formatted).toContain("10:00"); // 15:00 UTC - 5 hours = 10:00 EST
    });

    it("accepts custom format options", () => {
      const instant = Temporal.Instant.from("2026-02-19T15:00:00Z");
      const formatted = formatLocal(instant, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      expect(formatted).toContain("10:00");
    });

    it("respects time zone setting", () => {
      setTimeZoneId("America/Los_Angeles");

      const instant = Temporal.Instant.from("2026-02-19T15:00:00Z");
      const formatted = formatLocal(instant);

      // Should show Pacific Time (UTC-8)
      expect(formatted).toContain("7:00"); // 15:00 UTC - 8 hours = 07:00 PST
    });
  });

  describe("displayDate", () => {
    beforeEach(() => {
      setTimeZoneId("America/New_York");
      return () => resetTimeSource();
    });

    it("displays plain date in local time zone", () => {
      const date = Temporal.PlainDate.from("2026-02-19");
      const displayed = displayDate(date);

      expect(displayed).toContain("2/19/2026");
    });

    it("accepts custom format options", () => {
      const date = Temporal.PlainDate.from("2026-02-19");
      const displayed = displayDate(date, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      expect(displayed).toContain("February");
      expect(displayed).toContain("19");
      expect(displayed).toContain("2026");
    });
  });

  describe("todayIso", () => {
    it("returns today as ISO string", () => {
      withFrozenTime({
        now: "2026-02-19T15:00:00Z",
        fn: () => {
          const iso = todayIso();
          expect(iso).toBe("2026-02-19");
        },
      });
    });

    it("matches ISO format (YYYY-MM-DD)", () => {
      const iso = todayIso();
      expect(iso).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe("isSameDayIso", () => {
    it("returns true for today's date", () => {
      withFrozenTime({
        now: "2026-02-19T15:00:00Z",
        fn: () => {
          expect(isSameDayIso("2026-02-19")).toBe(true);
        },
      });
    });

    it("returns false for different date", () => {
      withFrozenTime({
        now: "2026-02-19T15:00:00Z",
        fn: () => {
          expect(isSameDayIso("2026-02-20")).toBe(false);
          expect(isSameDayIso("2026-02-18")).toBe(false);
        },
      });
    });

    it("returns false for different year", () => {
      withFrozenTime({
        now: "2026-02-19T15:00:00Z",
        fn: () => {
          expect(isSameDayIso("2025-02-19")).toBe(false);
        },
      });
    });
  });

  describe("toPlainDate", () => {
    it("converts ISO string to PlainDate", () => {
      const date = toPlainDate("2026-02-19");
      expect(date).toBeInstanceOf(Temporal.PlainDate);
      expect(date.toString()).toBe("2026-02-19");
    });

    it("returns PlainDate unchanged", () => {
      const original = Temporal.PlainDate.from("2026-02-19");
      const result = toPlainDate(original);
      expect(result).toBe(original);
    });

    it("throws on invalid date string", () => {
      expect(() => toPlainDate("invalid-date")).toThrow();
    });
  });

  describe("comparePlainDate", () => {
    it("returns -1 when a < b", () => {
      // Using helper with string inputs is fine - testing the comparison logic
      expect(comparePlainDate("2026-02-18", "2026-02-19")).toBe(-1);
    });

    it("returns 0 when a === b", () => {
      expect(comparePlainDate("2026-02-19", "2026-02-19")).toBe(0);
    });

    it("returns 1 when a > b", () => {
      expect(comparePlainDate("2026-02-20", "2026-02-19")).toBe(1);
    });

    it("works with PlainDate objects", () => {
      // Use raw Temporal API for setup, test helper with those objects
      const a = Temporal.PlainDate.from("2026-02-18");
      const b = Temporal.PlainDate.from("2026-02-19");
      expect(comparePlainDate(a, b)).toBe(-1);
    });

    it("works with mixed string and PlainDate", () => {
      // Use raw Temporal API for setup
      const a = Temporal.PlainDate.from("2026-02-19");
      const b = "2026-02-19";
      expect(comparePlainDate(a, b)).toBe(0);
    });
  });

  describe("toInstant", () => {
    it("converts ISO string to Instant", () => {
      const instant = toInstant("2026-02-19T15:00:00Z");
      expect(instant).toBeInstanceOf(Temporal.Instant);
      expect(instant.toString()).toBe("2026-02-19T15:00:00Z");
    });

    it("returns Instant unchanged", () => {
      const original = Temporal.Instant.from("2026-02-19T15:00:00Z");
      const result = toInstant(original);
      expect(result).toBe(original);
    });

    it("throws on invalid instant string", () => {
      expect(() => toInstant("invalid-instant")).toThrow();
    });
  });

  describe("compareInstants", () => {
    it("returns -1 when a < b", () => {
      // Using helper with string inputs is fine - testing the comparison logic
      expect(
        compareInstants("2026-02-19T14:00:00Z", "2026-02-19T15:00:00Z"),
      ).toBe(-1);
    });

    it("returns 0 when a === b", () => {
      expect(
        compareInstants("2026-02-19T15:00:00Z", "2026-02-19T15:00:00Z"),
      ).toBe(0);
    });

    it("returns 1 when a > b", () => {
      expect(
        compareInstants("2026-02-19T16:00:00Z", "2026-02-19T15:00:00Z"),
      ).toBe(1);
    });

    it("works with Instant objects", () => {
      // Use raw Temporal API for setup
      const a = Temporal.Instant.from("2026-02-19T14:00:00Z");
      const b = Temporal.Instant.from("2026-02-19T15:00:00Z");
      expect(compareInstants(a, b)).toBe(-1);
    });
  });

  describe("isAfter", () => {
    it("returns true when a > b", () => {
      expect(isAfter("2026-02-19T16:00:00Z", "2026-02-19T15:00:00Z")).toBe(
        true,
      );
    });

    it("returns false when a < b", () => {
      expect(isAfter("2026-02-19T14:00:00Z", "2026-02-19T15:00:00Z")).toBe(
        false,
      );
    });

    it("returns false when a === b", () => {
      expect(isAfter("2026-02-19T15:00:00Z", "2026-02-19T15:00:00Z")).toBe(
        false,
      );
    });
  });

  describe("isBefore", () => {
    it("returns true when a < b", () => {
      expect(isBefore("2026-02-19T14:00:00Z", "2026-02-19T15:00:00Z")).toBe(
        true,
      );
    });

    it("returns false when a > b", () => {
      expect(isBefore("2026-02-19T16:00:00Z", "2026-02-19T15:00:00Z")).toBe(
        false,
      );
    });

    it("returns false when a === b", () => {
      expect(isBefore("2026-02-19T15:00:00Z", "2026-02-19T15:00:00Z")).toBe(
        false,
      );
    });
  });

  describe("isEqual", () => {
    it("returns true when a === b", () => {
      expect(isEqual("2026-02-19T15:00:00Z", "2026-02-19T15:00:00Z")).toBe(
        true,
      );
    });

    it("returns false when a !== b", () => {
      expect(isEqual("2026-02-19T14:00:00Z", "2026-02-19T15:00:00Z")).toBe(
        false,
      );
    });

    it("works with Instant objects", () => {
      // Use raw Temporal API for setup
      const a = Temporal.Instant.from("2026-02-19T15:00:00Z");
      const b = Temporal.Instant.from("2026-02-19T15:00:00Z");
      expect(isEqual(a, b)).toBe(true);
    });
  });

  describe("maxInstant", () => {
    it("returns the latest instant from array", () => {
      const instants = [
        "2026-02-19T14:00:00Z",
        "2026-02-19T16:00:00Z",
        "2026-02-19T15:00:00Z",
      ];

      const max = maxInstant(instants);
      expect(max?.toString()).toBe("2026-02-19T16:00:00Z");
    });

    it("returns null for empty array", () => {
      expect(maxInstant([])).toBeNull();
    });

    it("works with single element", () => {
      const max = maxInstant(["2026-02-19T15:00:00Z"]);
      expect(max?.toString()).toBe("2026-02-19T15:00:00Z");
    });

    it("works with Instant objects", () => {
      // Use raw Temporal API for setup
      const instants = [
        Temporal.Instant.from("2026-02-19T14:00:00Z"),
        Temporal.Instant.from("2026-02-19T16:00:00Z"),
        Temporal.Instant.from("2026-02-19T15:00:00Z"),
      ];

      const max = maxInstant(instants);
      expect(max?.toString()).toBe("2026-02-19T16:00:00Z");
    });

    it("works with mixed strings and Instant objects", () => {
      // Use raw Temporal API for setup
      const instants = [
        "2026-02-19T14:00:00Z",
        Temporal.Instant.from("2026-02-19T16:00:00Z"),
        "2026-02-19T15:00:00Z",
      ];

      const max = maxInstant(instants);
      expect(max?.toString()).toBe("2026-02-19T16:00:00Z");
    });
  });

  describe("minInstant", () => {
    it("returns the earliest instant from array", () => {
      const instants = [
        "2026-02-19T16:00:00Z",
        "2026-02-19T14:00:00Z",
        "2026-02-19T15:00:00Z",
      ];

      const min = minInstant(instants);
      expect(min?.toString()).toBe("2026-02-19T14:00:00Z");
    });

    it("returns null for empty array", () => {
      expect(minInstant([])).toBeNull();
    });

    it("works with single element", () => {
      const min = minInstant(["2026-02-19T15:00:00Z"]);
      expect(min?.toString()).toBe("2026-02-19T15:00:00Z");
    });

    it("works with Instant objects", () => {
      // Use raw Temporal API for setup
      const instants = [
        Temporal.Instant.from("2026-02-19T16:00:00Z"),
        Temporal.Instant.from("2026-02-19T14:00:00Z"),
        Temporal.Instant.from("2026-02-19T15:00:00Z"),
      ];

      const min = minInstant(instants);
      expect(min?.toString()).toBe("2026-02-19T14:00:00Z");
    });

    it("works with mixed strings and Instant objects", () => {
      // Use raw Temporal API for setup
      const instants = [
        "2026-02-19T16:00:00Z",
        Temporal.Instant.from("2026-02-19T14:00:00Z"),
        "2026-02-19T15:00:00Z",
      ];

      const min = minInstant(instants);
      expect(min?.toString()).toBe("2026-02-19T14:00:00Z");
    });
  });

  describe("Edge cases", () => {
    it("handles leap year dates correctly", () => {
      // Using helper is fine here - we're testing it handles leap years
      const leapDay = toPlainDate("2024-02-29");
      expect(leapDay.toString()).toBe("2024-02-29");
    });

    it("handles year boundaries correctly", () => {
      // Use raw Temporal API for setup, test helpers with those values
      const newYear = Temporal.Instant.from("2026-01-01T00:00:00Z");
      const oldYear = Temporal.Instant.from("2025-12-31T23:59:59Z");

      expect(isAfter(newYear, oldYear)).toBe(true);
    });

    it("handles same instant in different formats", () => {
      // Use raw Temporal API for setup
      const a = "2026-02-19T15:00:00Z";
      const b = Temporal.Instant.from("2026-02-19T15:00:00Z");

      expect(isEqual(a, b)).toBe(true);
    });
  });
});
