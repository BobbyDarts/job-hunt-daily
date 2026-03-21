// /src/components/app/sites/job-site-card/JobSiteCard.test.ts

import { screen } from "@testing-library/vue";
import { describe, it, expect, vi } from "vitest";

import { TooltipProvider } from "@/components/ui/tooltip";
import { mockApplications, mockSite } from "@/test-utils/mocks";
import { renderBaseWithProviders } from "@/test-utils/render-base";

import { JobSiteCard, type JobSiteCardProps } from ".";

const DEFAULT_PROPS: JobSiteCardProps = {
  site: mockSite,
  atsInfo: undefined,
  variant: "default",
  applications: [],
  onVisit: vi.fn(),
  onAddApplication: vi.fn(),
  onManageApplications: vi.fn(),
};

function renderJobSiteCard(
  overrides: Partial<JobSiteCardProps> = {},
  options: { slots?: Record<string, unknown> } = {},
) {
  return renderBaseWithProviders(JobSiteCard, DEFAULT_PROPS, overrides, {
    providers: [TooltipProvider],
    ...options,
  });
}

describe("JobSiteCard", () => {
  it("renders the job site button content", () => {
    renderJobSiteCard();

    // JobSiteButton renders the site name
    expect(screen.getByText(mockSite.name)).toBeInTheDocument();
  });

  it("calls onVisit with the site url when the card is clicked", async () => {
    const onVisit = vi.fn();

    renderJobSiteCard({ onVisit });

    await screen.getByText(mockSite.name).click();

    expect(onVisit).toHaveBeenCalledWith(mockSite.url);
  });

  it("does not render footer actions by default", () => {
    renderJobSiteCard();

    expect(screen.queryByLabelText("Add application")).not.toBeInTheDocument();

    expect(
      screen.queryByLabelText("Manage applications"),
    ).not.toBeInTheDocument();
  });

  it("shows the add application button when variant is visited", () => {
    renderJobSiteCard({ variant: "visited" });

    expect(screen.getByLabelText("Add application")).toBeInTheDocument();

    expect(
      screen.queryByLabelText("Manage applications"),
    ).not.toBeInTheDocument();
  });

  it("shows the manage applications button when applications exist", () => {
    renderJobSiteCard({
      applications: mockApplications,
    });

    expect(screen.getByLabelText("Manage applications")).toBeInTheDocument();

    expect(screen.queryByLabelText("Add application")).not.toBeInTheDocument();
  });

  it("shows both action buttons when visited and has applications", () => {
    renderJobSiteCard({
      variant: "visited",
      applications: mockApplications,
    });

    expect(screen.getByLabelText("Add application")).toBeInTheDocument();

    expect(screen.getByLabelText("Manage applications")).toBeInTheDocument();
  });

  it("calls onAddApplication with the site when add button is clicked", async () => {
    const onAddApplication = vi.fn();

    renderJobSiteCard({
      variant: "visited",
      onAddApplication,
    });

    await screen.getByLabelText("Add application").click();

    expect(onAddApplication).toHaveBeenCalledWith(mockSite);
  });

  it("calls onManageApplications with the site when manage button is clicked", async () => {
    const onManageApplications = vi.fn();

    renderJobSiteCard({
      applications: mockApplications,
      onManageApplications,
    });

    await screen.getByLabelText("Manage applications").click();

    expect(onManageApplications).toHaveBeenCalledWith(mockSite);
  });

  it("does not trigger onVisit when action buttons are clicked", async () => {
    const onVisit = vi.fn();

    renderJobSiteCard({
      variant: "visited",
      applications: mockApplications,
      onVisit,
    });

    await screen.getByLabelText("Add application").click();
    await screen.getByLabelText("Manage applications").click();

    expect(onVisit).not.toHaveBeenCalled();
  });

  it("applies default hover styles when variant is default", () => {
    const { container } = renderJobSiteCard({ variant: "default" });

    const card = container.querySelector(".hover\\:border-primary\\/30");
    expect(card).toBeTruthy();
  });

  it("applies visited hover styles when variant is visited", () => {
    const { container } = renderJobSiteCard({ variant: "visited" });

    const card = container.querySelector(".hover\\:border-primary\\/20");
    expect(card).toBeTruthy();
  });
});
