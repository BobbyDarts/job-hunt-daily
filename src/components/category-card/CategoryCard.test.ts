// /src/components/category-card/CategoryCard.test.ts

import { screen } from "@testing-library/vue";
import { describe, expect, it, vi } from "vitest";

import { CategoryCard } from "@/components/category-card";
import type { Props as CategoryCardProps } from "@/components/category-card";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useCategoryProgress } from "@/composables/use-category-progress";
import { mockCategory } from "@/test-utils/mocks";
import { renderBaseWithProviders } from "@/test-utils/render-base";

const isSiteVisited = (_url: string) => false;

// Real composable to provide splitCategorySites and getCategoryProgress
const { splitCategorySites, getCategoryProgress } = useCategoryProgress(
  { categories: [mockCategory] },
  isSiteVisited,
);

const DEFAULT_PROPS: CategoryCardProps = {
  category: mockCategory,
  splitSites: splitCategorySites(mockCategory),
  progress: 0,
  maxHeight: 6,
  isSiteVisited,
  onVisit: vi.fn(),
  getCategoryProgress,
};

function renderCategoryCard(
  overrides: Partial<CategoryCardProps> = {},
  options: { slots?: Record<string, unknown> } = {},
) {
  return renderBaseWithProviders(CategoryCard, DEFAULT_PROPS, overrides, {
    providers: [TooltipProvider],
    ...options,
  });
}

describe("CategoryCard", () => {
  it("renders category name", () => {
    renderCategoryCard();
    expect(screen.getByText("Test Category")).toBeInTheDocument();
  });

  it("renders all JobSiteCard components", () => {
    renderCategoryCard();

    expect(screen.getAllByRole("button")).toHaveLength(
      mockCategory.sites.length,
    );
  });

  it("calls onVisit when a JobSiteCard is clicked", async () => {
    const clickSpy = vi.fn();

    renderCategoryCard({ onVisit: clickSpy });

    const buttons = screen.getAllByRole("button");

    buttons[0].click();

    expect(clickSpy).toHaveBeenCalledWith(mockCategory.sites[0].url);
  });
});
