// /src/views/Applications.test.ts

import { screen, render } from "@testing-library/vue";
import { describe, it, expect, vi } from "vitest";
import { computed, defineComponent, h, ref } from "vue";
import { createRouter, createMemoryHistory } from "vue-router";

import { TooltipProvider } from "@/components/ui/tooltip";
import { mockApplications } from "@/test-utils/mocks";
import { Applications } from "@/views";

// Mock the composable
vi.mock("@/composables/data/use-applications", () => ({
  useApplications: () => ({
    applications: ref(mockApplications),
    addApplication: vi.fn(),
    updateApplication: vi.fn(() => true),
    deleteApplication: vi.fn(() => true),
    totalCount: computed(() => mockApplications.length),
    countByStatus: computed(() => ({
      applied: 1,
    })),
    search: vi.fn((_query: string) => []),
  }),
}));

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: "/", name: "Home", component: { template: "<div>Home</div>" } },
    {
      path: "/applications",
      name: "Applications",
      component: Applications,
    },
  ],
});

async function renderApplications() {
  await router.push("/applications");
  await router.isReady();

  // Wrapper component that provides TooltipProvider
  const Wrapper = defineComponent({
    name: "TestWrapper",
    setup() {
      return () => h(TooltipProvider, {}, { default: () => h(Applications) });
    },
  });

  return render(Wrapper, {
    global: {
      plugins: [router],
    },
  });
}

describe("Applications View", () => {
  it("renders the page title", async () => {
    await renderApplications();
    expect(screen.getByText("Applications")).toBeInTheDocument();
  });

  it("displays application count", async () => {
    await renderApplications();

    expect(
      screen.getByText(
        `${mockApplications.length} / ${mockApplications.length}`,
      ),
    ).toBeInTheDocument();
  });
  it("shows search input", async () => {
    await renderApplications();
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it("displays add application button", async () => {
    await renderApplications();
    expect(screen.getByRole("button", { name: /add/i })).toBeInTheDocument();
  });

  it("shows back button", async () => {
    await renderApplications();
    expect(
      screen.getByRole("button", { name: /back to home/i }),
    ).toBeInTheDocument();
  });

  it("displays grouped applications by company", async () => {
    await renderApplications();
    expect(screen.getByText(mockApplications[0].company)).toBeInTheDocument();
    expect(screen.getByText(mockApplications[0].position)).toBeInTheDocument();
  });

  it("shows filter dropdowns", async () => {
    await renderApplications();
    const dropdowns = screen.getAllByRole("button", {
      name: /all statuses|all sites/i,
    });
    expect(dropdowns.length).toBeGreaterThanOrEqual(2);
  });
});
