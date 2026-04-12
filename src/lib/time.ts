// /src/lib/time.ts

import { Temporal } from "@js-temporal/polyfill";

import type { PeriodUnit } from "@/types";

/**
 * Temporal rules (project conventions):
 * - Store application dates/times in UTC whenever possible.
 * - Use `Temporal.PlainDate` for calendar-only values (appliedDate, dueDate).
 * - Use `Temporal.Instant` for timestamp values (createdAt, updatedAt).
 * - Convert to local time zone only for display with `displayDate` or `formatLocal`.
 * - Use `toPlainDate` and `toInstant` for parsing/normalizing input.
 */

/**
 * Interface representing a source of time.
 * Can be the system clock or a custom/fixed time source (useful for testing).
 */
export interface TimeSource {
  /**
   * Returns the current instant in time (UTC).
   */
  now(): Temporal.Instant;

  /**
   * Returns the current calendar date (year, month, day).
   */
  today(): Temporal.PlainDate;

  /**
   * Returns the current time zone ID.
   * Example: `"America/New_York"`.
   */
  timeZoneId(): string;
}

/**
 * Default system-based time source.
 * Uses the real system clock and time zone.
 */
const systemTimeSource: TimeSource = {
  now: () => Temporal.Now.instant(),
  today: () => Temporal.Now.plainDateISO(),
  timeZoneId: () => Temporal.Now.timeZoneId(),
};

/** Current active time source. Defaults to systemTimeSource. */
let currentTimeSource: TimeSource = systemTimeSource;

/**
 * Partially overrides the current time source.
 * Useful for mocking `now`, `today`, or `timeZoneId` in tests.
 *
 * @param source Partial `TimeSource` to override specific methods.
 * @example
 * setTimeSource({ today: () => Temporal.PlainDate.from("2026-02-19") });
 */
export function setTimeSource(source: Partial<TimeSource>) {
  currentTimeSource = {
    ...currentTimeSource,
    ...source,
  };
}

/**
 * Resets the time source back to the default system clock.
 */
export function resetTimeSource() {
  currentTimeSource = systemTimeSource;
}

/**
 * Returns the current instant in time (UTC) according to the active time source.
 *
 * @returns `Temporal.Instant` representing the current UTC time.
 * @example
 * const now = getNow();
 * console.log(now.toString()); // "2026-02-19T15:00:00Z"
 */
export function getNow(): Temporal.Instant {
  return currentTimeSource.now();
}

/**
 * Overrides the current instant returned by `getNow`.
 * Useful for testing or simulating a specific moment in time.
 *
 * @param now `Temporal.Instant` to use as the current time.
 */
export function setNow(now: Temporal.Instant) {
  const today = now.toZonedDateTimeISO(getTimeZoneId()).toPlainDate();
  setTimeSource({
    now: () => now,
    today: () => today,
  });
}

/**
 * Returns the current calendar date according to the active time source.
 *
 * @returns `Temporal.PlainDate` representing the current date.
 * @example
 * const today = getToday();
 * console.log(today.toString()); // "2026-02-19"
 */
export function getToday(): Temporal.PlainDate {
  return currentTimeSource.today();
}

/**
 * Returns the current time zone ID of the active time source.
 *
 * @returns string, e.g., `"America/New_York"`.
 */
export function getTimeZoneId(): string {
  return currentTimeSource.timeZoneId();
}

/**
 * Overrides the current time zone ID returned by `getTimeZoneId`.
 *
 * @param timeZoneId String representing the time zone, e.g., `"America/New_York"`.
 */
export function setTimeZoneId(timeZoneId: string) {
  setTimeSource({ timeZoneId: () => timeZoneId });
}

/**
 * Formats a `Temporal.Instant` in the local time of the active time zone.
 *
 * @param instant `Temporal.Instant` to format.
 * @param options Optional `Intl.DateTimeFormatOptions` for customizing output.
 * @returns A string representing the instant in local time.
 * @example
 * const instant = Temporal.Instant.from("2026-02-19T15:00:00Z");
 * formatLocal(instant); // "2/19/2026, 10:00:00 AM" (Eastern Time)
 * formatLocal(instant, { hour: "2-digit", minute: "2-digit" }); // "10:00 AM"
 */
export function formatLocal(
  instant: Temporal.Instant,
  options?: Intl.DateTimeFormatOptions,
): string {
  const zoned = instant.toZonedDateTimeISO(getTimeZoneId());
  return zoned.toLocaleString(undefined, options);
}

/**
 * Converts a `Temporal.PlainDate` to a string using the system's local time zone.
 *
 * @param plainDate `Temporal.PlainDate` to display.
 * @param options Optional `Intl.DateTimeFormatOptions` for customizing output.
 * @returns A string representing the date in local time.
 * @example
 * const date = Temporal.PlainDate.from("2026-02-19");
 * displayDate(date); // "2/19/2026"
 * displayDate(date, { weekday: "short", month: "long", day: "numeric" }); // "Thu, February 19"
 */
export function displayDate(
  plainDate: Temporal.PlainDate,
  options?: Omit<Intl.DateTimeFormatOptions, "dateStyle" | "timeStyle">,
): string {
  // Convert PlainDate to ZonedDateTime at local midnight
  const zdt = plainDate.toZonedDateTime({
    plainTime: Temporal.PlainTime.from("00:00"),
    timeZone: getTimeZoneId(),
  });

  return zdt.toLocaleString(undefined, options);
}

/**
 * Returns the current day as an ISO string.
 *
 * @returns string in "YYYY-MM-DD" format representing today.
 */
export function todayIso(): string {
  return getToday().toString();
}

/**
 * Checks if the given ISO date string represents today.
 *
 * @param isoDate ISO date string (YYYY-MM-DD)
 * @returns true if the date matches today, false otherwise
 */
export function isSameDayIso(isoDate: string): boolean {
  return toPlainDate(isoDate).equals(getToday());
}

/**
 * Converts a string or `Temporal.PlainDate` to a `Temporal.PlainDate`.
 *
 * @param value Date string (ISO) or `Temporal.PlainDate`
 * @returns `Temporal.PlainDate` representation of the value
 */
export function toPlainDate(
  value: string | Temporal.PlainDate,
): Temporal.PlainDate {
  if (value instanceof Temporal.PlainDate) {
    return value;
  }

  return Temporal.PlainDate.from(value);
}

/**
 * Compares two plain dates (string or Temporal.PlainDate).
 *
 * @returns -1 if a < b, 0 if equal, 1 if a > b
 */
export function comparePlainDate(
  a: string | Temporal.PlainDate,
  b: string | Temporal.PlainDate,
): number {
  return Temporal.PlainDate.compare(toPlainDate(a), toPlainDate(b));
}

/**
 * Converts a string or `Temporal.Instant` to a `Temporal.Instant`.
 *
 * @param value Instant string (ISO) or `Temporal.Instant`
 * @returns `Temporal.Instant` representation of the value
 */
export function toInstant(value: string | Temporal.Instant): Temporal.Instant {
  if (value instanceof Temporal.Instant) {
    return value;
  }

  return Temporal.Instant.from(value);
}

/**
 * Compares two instants (string or Temporal.Instant).
 *
 * @returns -1 if a < b, 0 if equal, 1 if a > b
 */
export function compareInstants(
  a: string | Temporal.Instant,
  b: string | Temporal.Instant,
): number {
  return Temporal.Instant.compare(toInstant(a), toInstant(b));
}

/**
 * Returns true if `a` is after `b`.
 */
export function isAfter(
  a: string | Temporal.Instant,
  b: string | Temporal.Instant,
): boolean {
  return compareInstants(a, b) > 0;
}

/**
 * Returns true if `a` is before `b`.
 */
export function isBefore(
  a: string | Temporal.Instant,
  b: string | Temporal.Instant,
): boolean {
  return compareInstants(a, b) < 0;
}

/**
 * Returns true if `a` is equal to `b`.
 */
export function isEqual(
  a: string | Temporal.Instant,
  b: string | Temporal.Instant,
): boolean {
  return compareInstants(a, b) === 0;
}

/**
 * Returns the latest instant from a list of strings or Temporal.Instant objects.
 *
 * @param instants Array of timestamps (string ISO or Temporal.Instant)
 * @returns The Temporal.Instant that is the latest, or null if array is empty
 */
export function maxInstant(
  instants: (string | Temporal.Instant)[],
): Temporal.Instant | null {
  if (instants.length === 0) return null;
  return instants
    .map(toInstant)
    .reduce((max, curr) => (isAfter(curr, max) ? curr : max));
}

/**
 * Returns the earliest instant from a list of strings or Temporal.Instant objects.
 *
 * @param instants Array of timestamps (string ISO or Temporal.Instant)
 * @returns The Temporal.Instant that is the earliest, or null if array is empty
 */
export function minInstant(
  instants: (string | Temporal.Instant)[],
): Temporal.Instant | null {
  if (instants.length === 0) return null;
  return instants
    .map(toInstant)
    .reduce((min, curr) => (isBefore(curr, min) ? curr : min));
}

/**
 * Converts a string or `Temporal.Instant` to a `Temporal.PlainDate` in the
 * active local time zone.
 *
 * @param value Instant string (ISO) or `Temporal.Instant`
 * @returns `Temporal.PlainDate` representing the calendar date in local time
 * @example
 * instantToPlainDate("2026-04-07T14:23:00Z"); // Temporal.PlainDate "2026-04-07"
 */
export function instantToPlainDate(
  value: string | Temporal.Instant,
): Temporal.PlainDate {
  return toInstant(value).toZonedDateTimeISO(getTimeZoneId()).toPlainDate();
}

/**
 * Derives a grouping key from a timestamp for a given period unit.
 * Used to bucket timestamps into day, week, or month groups for charting.
 *
 * - `"day"` — returns the ISO date string (`"2026-04-07"`)
 * - `"week"` — returns the ISO date of the Monday of that week (`"2026-04-06"`)
 * - `"month"` — returns the year and zero-padded month (`"2026-04"`)
 *
 * @param timestamp Instant string (ISO) or `Temporal.Instant`
 * @param unit The period unit to group by
 * @returns A sortable string key representing the period
 * @example
 * toPeriodKey("2026-04-07T14:23:00Z", "day");   // "2026-04-07"
 * toPeriodKey("2026-04-07T14:23:00Z", "week");  // "2026-04-06"
 * toPeriodKey("2026-04-07T14:23:00Z", "month"); // "2026-04"
 */
export function toPeriodKey(
  timestamp: string | Temporal.Instant,
  unit: PeriodUnit,
): string {
  const date = instantToPlainDate(timestamp);

  switch (unit) {
    case "day":
      return date.toString();
    case "month":
      return `${date.year}-${String(date.month).padStart(2, "0")}`;
    case "week": {
      const monday = date.subtract({ days: date.dayOfWeek - 1 });
      return monday.toString();
    }
  }
}
