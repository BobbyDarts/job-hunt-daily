// /src/views/Login.test.ts

import { screen } from "@testing-library/vue";
import { describe, it, expect, vi } from "vitest";

import { renderBaseWithProviders } from "@/test-utils/render-base";

import Login from "./Login.vue";

vi.mock("vue-router", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/composables/ui/use-app-mode", () => ({
  useAppMode: () => ({
    setMode: vi.fn(),
    clearMode: vi.fn(),
    mode: { value: null },
    isSet: { value: false },
    isLocal: { value: false },
    isSupabase: { value: false },
  }),
}));

vi.mock("@/composables/data", () => ({
  useJobSites: () => ({ init: vi.fn().mockResolvedValue(undefined) }),
  useVisitedSites: () => ({ init: vi.fn().mockResolvedValue(undefined) }),
  useApplications: () => ({ init: vi.fn().mockResolvedValue(undefined) }),
}));

vi.mock("@/services/repositories/applications", () => ({
  initApplicationsRepository: vi.fn(),
}));

vi.mock("@/services/repositories/job-sites", () => ({
  initJobSitesRepository: vi.fn(),
}));

vi.mock("@/services/repositories/visited-sites", () => ({
  initVisitedSitesRepository: vi.fn(),
}));

vi.mock("@/services/supabase/auth", () => ({
  signInWithEmail: vi.fn(),
  signUpWithEmail: vi.fn(),
}));

describe("Login", () => {
  it("renders without crashing", async () => {
    renderBaseWithProviders(Login, {}, {});
    expect(screen.getByText("Job Hunt Daily")).toBeDefined();
  });

  it("shows email and password fields", async () => {
    renderBaseWithProviders(Login, {}, {});
    expect(screen.getByLabelText("Email")).toBeDefined();
    expect(screen.getByLabelText("Password")).toBeDefined();
  });

  it("shows sign in by default", async () => {
    renderBaseWithProviders(Login, {}, {});
    expect(screen.getByText("Sign in to your account")).toBeDefined();
  });

  it("shows use local mode button", async () => {
    renderBaseWithProviders(Login, {}, {});
    expect(screen.getByText("Use local mode instead")).toBeDefined();
  });
});
