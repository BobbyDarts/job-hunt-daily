// /src/views/Home.test.ts

import { screen, render } from "@testing-library/vue";
import { describe, it, expect, vi } from "vitest";
import { computed, ref, defineComponent, h } from "vue";
import { createRouter, createMemoryHistory } from "vue-router";

import { TooltipProvider } from "@/components/ui/tooltip";
import { mockCategories, mockSites } from "@/test-utils/mocks";
import { Home } from "@/views";

// Mock the composables
vi.mock("@/composables/data/use-applications", () => ({
  useApplications: () => ({
    applications: ref([]),
    addApplication: vi.fn(),
  }),
}));

vi.mock("@/composables/data/use-visited-sites", () => ({
  useVisitedSites: () => ({
    markVisited: vi.fn(),
    isSiteVisited: vi.fn(() => false),
  }),
}));

vi.mock("@/composables/data/use-ats-detection", () => ({
  useATSDetection: () => ({
    getATS: vi.fn(),
  }),
}));

vi.mock("@/composables/dashboard/use-category-progress", () => ({
  useCategoryProgress: () => ({
    categoryStats: computed(() => [
      {
        category: mockCategories.techCompanies,
        sites: [
          mockSites.workday,
          mockSites.greenhouse,
          mockSites.regular,
          mockSites.zebra,
          mockSites.alpha,
        ],
        visitedCount: 0,
        progress: 0,
      },
      {
        category: mockCategories.startups,
        sites: [mockSites.lever, mockSites.bamboohr],
        visitedCount: 0,
        progress: 0,
      },
      {
        category: mockCategories.smallCategory,
        sites: [mockSites.delta],
        visitedCount: 0,
        progress: 0,
      },
    ]),
    getCategoryProgress: vi.fn(() => 0),
    getCategoryVisitedCount: vi.fn(() => 0),
    maxCategoryHeight: computed(() => 6),
  }),
}));

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: "/", name: "Home", component: Home },
    {
      path: "/applications",
      name: "Applications",
      component: { template: "<div>Applications</div>" },
    },
  ],
});

function renderHome() {
  // Wrapper component that provides TooltipProvider
  const Wrapper = defineComponent({
    name: "TestWrapper",
    setup() {
      return () => h(TooltipProvider, {}, { default: () => h(Home) });
    },
  });

  return render(Wrapper, {
    global: {
      plugins: [router],
    },
  });
}

describe("Home View", () => {
  it("renders without crashing", () => {
    const { container } = renderHome();
    expect(container).toBeInTheDocument();
  });

  it("renders CategoryCard components", () => {
    renderHome();

    // Should render category names from mock data
    expect(screen.getByText("Tech Companies")).toBeInTheDocument();
  });

  it("renders job site cards", () => {
    renderHome();

    // Should render site names from the first category
    expect(screen.getByText("Workday Company")).toBeInTheDocument();
  });
});
