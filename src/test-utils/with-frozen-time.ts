// /src/test-utils/with-frozen-time.ts

import type { Temporal } from "@js-temporal/polyfill";

import { setNow, resetTimeSource, toInstant } from "@/lib/time";

/**
 * Parameters for `withFrozenTime`.
 */
export type WithFrozenTimeParams<T = void> = {
  /** Freeze time at this instant. Also sets today to the date of this instant in the current timezone. */
  now: string | Temporal.Instant;
  /** Callback to execute while time is frozen */
  fn: () => T;
};

/**
 * Temporarily overrides the current time source for the duration of a callback.
 * Useful for testing code that depends on `getNow()` or `getToday()`.
 *
 * ⚠️ **Note:** This uses `Temporal` exclusively instead of `Date` or `vi.setSystemTime`.
 * This ensures consistency with our Temporal-based time system and avoids
 * side effects on the global JS clock.
 *
 * Automatically resets the time source after the callback executes.
 *
 * @param params Object containing the instant to freeze at and callback
 * @returns The value returned by the callback.
 *
 * @example
 * await withFrozenTime({
 *   now: "2026-02-19T15:00:00Z",
 *   fn: async () => {
 *     console.log(getNow().toString()); // "2026-02-19T15:00:00Z"
 *     console.log(getToday().toString()); // "2026-02-19" (derived from instant)
 *   }
 * });
 */
export async function withFrozenTime<T>({
  now,
  fn,
}: WithFrozenTimeParams<T>): Promise<T> {
  setNow(toInstant(now));

  try {
    return await fn();
  } finally {
    resetTimeSource();
  }
}
