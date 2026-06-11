// /src/composables/ui/use-app-mode.test.ts

import { describe, it, expect, beforeEach } from "vitest";

import { useAppMode } from "./use-app-mode";

describe("useAppMode", () => {
  beforeEach(() => {
    const { clearMode } = useAppMode();
    clearMode();
  });

  it("mode is null when no preference is stored", () => {
    const { mode, isSet, isLocal, isSupabase } = useAppMode();
    expect(mode.value).toBeNull();
    expect(isSet.value).toBe(false);
    expect(isLocal.value).toBe(false);
    expect(isSupabase.value).toBe(false);
  });

  it("setMode sets local", () => {
    const { setMode, mode, isLocal, isSupabase, isSet } = useAppMode();
    setMode("local");
    expect(mode.value).toBe("local");
    expect(isLocal.value).toBe(true);
    expect(isSupabase.value).toBe(false);
    expect(isSet.value).toBe(true);
  });

  it("setMode sets supabase", () => {
    const { setMode, mode, isLocal, isSupabase, isSet } = useAppMode();
    setMode("supabase");
    expect(mode.value).toBe("supabase");
    expect(isSupabase.value).toBe(true);
    expect(isLocal.value).toBe(false);
    expect(isSet.value).toBe(true);
  });

  it("clearMode resets to null", () => {
    const { setMode, clearMode, mode, isSet } = useAppMode();
    setMode("local");
    clearMode();
    expect(mode.value).toBeNull();
    expect(isSet.value).toBe(false);
  });
});
