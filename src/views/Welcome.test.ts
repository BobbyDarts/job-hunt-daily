// /src/views/Welcome.test.ts

import { screen } from "@testing-library/vue";
import { describe, it, expect, vi } from "vitest";

import { renderBaseWithProviders } from "@/test-utils/render-base";

import Welcome from "./Welcome.vue";

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

describe("Welcome", () => {
  it("renders without crashing", async () => {
    renderBaseWithProviders(Welcome, {}, {});
    expect(screen.getByText("Job Hunt Daily")).toBeDefined();
  });

  it("shows local and supabase options", async () => {
    renderBaseWithProviders(Welcome, {}, {});
    expect(screen.getByText("Local only")).toBeDefined();
    expect(screen.getByText("Supabase sync")).toBeDefined();
  });
});
