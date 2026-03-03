// /src/views/Home.test.ts

import { screen, render } from "@testing-library/vue";
import { describe, it, expect, vi } from "vitest";
import { computed, ref, defineComponent, h } from "vue";
import { createRouter, createMemoryHistory } from "vue-router";

import { TooltipProvider } from "@/components/ui/tooltip";
import { mockJobHuntData } from "@/test-utils/mocks";

import Home from "./Home.vue";

// Mock the composables
vi.mock("@/composables/use-applications", () => ({
  useApplications: () => ({
    applications: ref([]),
    addApplication: vi.fn(),
  }),
}));

vi.mock("@/composables/use-visited-sites", () => ({
  useVisitedSites: () => ({
    markVisited: vi.fn(),
    isSiteVisited: vi.fn(() => false),
  }),
}));

vi.mock("@/composables/use-ats-detection", () => ({
  useATSDetection: () => ({
    getATS: vi.fn(),
  }),
}));

vi.mock("@/composables/use-category-progress", () => ({
  useCategoryProgress: () => ({
    sortedCategories: computed(() => mockJobHuntData.categories),
    splitCategorySites: vi.fn(category => ({
      unvisited: category.sites,
      visited: [],
    })),
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
    // mockJobHuntData has "Tech Companies", "Healthcare", "Finance" categories
    expect(screen.getByText("Tech Companies")).toBeInTheDocument();
  });

  it("renders job site cards", () => {
    renderHome();

    // Should render site names from the first category
    expect(screen.getByText("Workday Company")).toBeInTheDocument();
  });
});
