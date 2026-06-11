// /src/services/supabase/auth.ts

import { useAppMode } from "@/composables/ui/use-app-mode";

import { supabase } from "./client";

export async function getCurrentUserId(): Promise<string> {
  if (!supabase) throw new Error("Supabase not configured");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return user.id;
}

export async function getSession() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<{ error: string | null }> {
  if (!supabase) return { error: "Supabase not configured" };
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error: error?.message ?? null };
}

export async function signUpWithEmail(
  email: string,
  password: string,
): Promise<{ error: string | null }> {
  if (!supabase) return { error: "Supabase not configured" };
  const { error } = await supabase.auth.signUp({ email, password });
  return { error: error?.message ?? null };
}

export async function signOut(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export function isSupabaseMode(): boolean {
  const { mode } = useAppMode();
  if (mode.value === "supabase") return true;
  if (mode.value === "local") return false;
  // No preference set — fall back to env var
  return import.meta.env.VITE_USE_SUPABASE === "true";
}
