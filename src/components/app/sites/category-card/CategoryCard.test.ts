// /src/components/app/sites/category-card/CategoryCard.test.ts

import { screen } from "@testing-library/vue";
import { describe, expect, it, vi } from "vitest";

import { TooltipProvider } from "@/components/ui/tooltip";
import { mockCategory, mockSites } from "@/test-utils/mocks";
import { renderBaseWithProviders } from "@/test-utils/render-base";

import { CategoryCard, type CategoryCardProps } from ".";

const isSiteVisited = (_url: string) => false;

const DEFAULT_PROPS: CategoryCardProps = {
  category: mockCategory,
  sites: [mockSites.greenhouse, mockSites.workday],
  visitedCount: 0,
  progress: 0,
  maxHeight: 6,
  isSiteVisited,
  onVisit: vi.fn(),
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

    expect(screen.getByText(mockSites.greenhouse.name)).toBeInTheDocument();
    expect(screen.getByText(mockSites.workday.name)).toBeInTheDocument();
  });

  it("calls onVisit when a JobSiteCard is clicked", async () => {
    const clickSpy = vi.fn();

    renderCategoryCard({ onVisit: clickSpy });

    // Click the button for a specific known site
    const button = screen.getByRole("button", { name: /greenhouse company/i });
    button.click();

    expect(clickSpy).toHaveBeenCalledWith(mockSites.greenhouse.url);
  });
});
