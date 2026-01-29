import { describe, expect, it, vi } from "vitest";

import { ATSAvatar } from "@/components/ats-avatar";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { ATSInfo } from "@/lib/ats-detection";
import { mountWithProviders } from "@/test-utils/mount-with-providers";

import { JobSiteButton } from ".";

const mockSite = { name: "Test Site", url: "https://test.com" };
const mockATSInfo: ATSInfo = {
  type: "greenhouse", // must match ATSType
  initials: "GH",
  classes: "bg-green-500 text-white",
  patterns: ["greenhouse.com"],
};

// Default props to keep tests DRY
const defaultProps = {
  props: {
    site: mockSite,
    onClick: () => {},
  },
  providers: [TooltipProvider],
};

describe("JobSiteButton", () => {
  it("renders site name", () => {
    const wrapper = mountWithProviders(JobSiteButton, defaultProps);
    expect(wrapper.text()).toContain("Test Site");
  });

  it("calls onClick when clicked", async () => {
    const clickSpy = vi.fn();
    const wrapper = mountWithProviders(JobSiteButton, {
      ...defaultProps,
      props: { ...defaultProps.props, onClick: clickSpy },
    });

    await wrapper.find("button").trigger("click");
    expect(clickSpy).toHaveBeenCalledWith(mockSite.url);
  });

  it("renders ATSAvatar when atsInfo is provided", () => {
    const wrapper = mountWithProviders(JobSiteButton, {
      ...defaultProps,
      props: { ...defaultProps.props, atsInfo: mockATSInfo },
    });

    const avatar = wrapper.findComponent(ATSAvatar);
    expect(avatar.exists()).toBe(true);
    expect(avatar.props("atsInfo")).toEqual(mockATSInfo);
  });

  it("does not render ATSAvatar when atsInfo is not provided", () => {
    const wrapper = mountWithProviders(JobSiteButton, defaultProps);

    const avatar = wrapper.findComponent(ATSAvatar);
    expect(avatar.exists()).toBe(false);
  });

  it('applies visited variant styles when variant="visited"', () => {
    const wrapper = mountWithProviders(JobSiteButton, {
      ...defaultProps,
      props: { ...defaultProps.props, variant: "visited" },
    });

    const button = wrapper.find("button");
    expect(button.classes()).toContain("opacity-75");
  });

  it('shows checkmark when variant="visited"', () => {
    const wrapper = mountWithProviders(JobSiteButton, {
      ...defaultProps,
      props: { ...defaultProps.props, variant: "visited" },
    });

    const button = wrapper.find("button");
    expect(button.text()).toContain("✓");
  });
});
