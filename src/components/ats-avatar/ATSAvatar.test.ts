// /src/components/ats-avatar/ATSAvatar.test.ts

import { screen } from "@testing-library/vue";
import { describe, expect, it } from "vitest";

import type { Props as ATSAvatarProps } from "@/components/ats-avatar";
import { ATSAvatar } from "@/components/ats-avatar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { mockATSInfo, mockSite } from "@/test-utils/mocks";
import { renderBaseWithProviders } from "@/test-utils/render-base";

const DEFAULT_PROPS: ATSAvatarProps = {
  site: mockSite,
  atsInfo: undefined,
  variant: "default",
};

function renderATSAvatar(
  overrides: Partial<ATSAvatarProps> = {},
  options: { slots?: Record<string, unknown> } = {},
) {
  return renderBaseWithProviders(ATSAvatar, DEFAULT_PROPS, overrides, {
    providers: [TooltipProvider],
    ...options,
  });
}

describe("ATSAvatar", () => {
  it("does not render when atsInfo is not provided", () => {
    renderATSAvatar();

    expect(screen.queryByTestId("ats-badge")).toBeNull();
  });

  it("renders ATS badge when atsInfo is provided", () => {
    renderATSAvatar({ atsInfo: mockATSInfo });

    expect(screen.getByTestId("ats-badge")).toBeInTheDocument();
  });

  it("displays the correct ATS initials", () => {
    renderATSAvatar({ atsInfo: mockATSInfo });

    expect(screen.getByTestId("ats-badge")).toHaveTextContent("GH");
  });

  it("applies visited variant styling", () => {
    renderATSAvatar({ atsInfo: mockATSInfo, variant: "visited" });

    const avatar = screen.getByTestId("ats-badge");
    expect(avatar).toHaveClass("opacity-70");
  });
});
