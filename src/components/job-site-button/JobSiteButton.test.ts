// /src/components/job-site-button/JobSiteButton.test.ts

import { screen } from "@testing-library/vue";
import { describe, expect, it, vi } from "vitest";

import { JobSiteButton } from "@/components/job-site-button";
import type { Props as JobSiteButtonProps } from "@/components/job-site-button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { mockATSInfo, mockSite } from "@/test-utils/mocks";
import { getButtonByName } from "@/test-utils/queries";
import { renderBaseWithProviders } from "@/test-utils/render-base";

const DEFAULT_PROPS: JobSiteButtonProps = {
  site: mockSite,
  variant: "default",
  layout: "standalone",
  atsInfo: undefined,
  onClick: vi.fn(),
};

function renderJobSiteButton(
  overrides: Partial<JobSiteButtonProps> = {},
  options: { slots?: Record<string, unknown> } = {},
) {
  return renderBaseWithProviders(JobSiteButton, DEFAULT_PROPS, overrides, {
    providers: [TooltipProvider],
    ...options,
  });
}

describe("JobSiteButton", () => {
  it("renders site name", () => {
    renderJobSiteButton();
    expect(screen.getByText("Greenhouse Company")).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const onClick = vi.fn();

    renderJobSiteButton({ onClick });

    const button = getButtonByName("Greenhouse Company");

    (await button).click(); // fire the click

    expect(onClick).toHaveBeenCalledWith(mockSite.url);
  });

  it("renders ATSAvatar when atsInfo is provided", () => {
    renderJobSiteButton({ atsInfo: mockATSInfo });
    expect(screen.getByTestId("ats-badge")).toBeInTheDocument();
  });

  it("does not render ATSAvatar when atsInfo is not provided", () => {
    renderJobSiteButton();

    expect(screen.queryByTestId("ats-badge")).toBeNull();
  });

  it('applies visited variant styles when variant="visited"', () => {
    renderJobSiteButton({ variant: "visited" });

    expect(screen.getByRole("button")).toHaveClass("opacity-75");
  });

  it('shows checkmark when variant="visited"', () => {
    renderJobSiteButton({ variant: "visited" });

    expect(screen.getByRole("button")).toHaveTextContent("✓");
  });
});
