// /src/components/menu-toggle/MenuToggle.test.ts

import { describe, it, expect } from "vitest";

import type { Props as MenuToggleProps } from "@/components/menu-toggle";
import { MenuToggle } from "@/components/menu-toggle";
import { getIconButton } from "@/test-utils/queries";
import { renderBaseWithProviders } from "@/test-utils/render-base";

import { TooltipProvider } from "../ui/tooltip";

const DEFAULT_PROPS: MenuToggleProps = {
  open: true,
  ariaLabel: "Toggle menu",
};

function renderMenuToggle(
  overrides: Partial<MenuToggleProps> = {},
  options: { slots?: Record<string, unknown> } = {},
) {
  return renderBaseWithProviders(MenuToggle, DEFAULT_PROPS, overrides, {
    providers: [TooltipProvider],
    ...options,
  });
}

describe("MenuToggle", () => {
  it("renders an icon button with default aria-label", async () => {
    renderMenuToggle();

    expect(await getIconButton(/toggle menu/i)).toBeInTheDocument();
  });

  it("uses a custom aria-label when provided", async () => {
    renderMenuToggle({ ariaLabel: "Open navigation" });

    expect(await getIconButton(/open navigation/i)).toBeInTheDocument();
  });

  describe("icon state", () => {
    it("shows Menu icon and hides X icon when open is false", () => {
      const { container } = renderMenuToggle({ open: false });

      const menuIcon = container.querySelector("svg.lucide-menu");
      const closeIcon = container.querySelector("svg.lucide-x");

      expect(menuIcon).toHaveClass("opacity-100");
      expect(menuIcon).toHaveClass("rotate-0");

      expect(closeIcon).toHaveClass("opacity-0");
      expect(closeIcon).toHaveClass("-rotate-90");
    });

    it("shows X icon and hides Menu icon when open is true", () => {
      const { container } = renderMenuToggle();

      const menuIcon = container.querySelector("svg.lucide-menu");
      const closeIcon = container.querySelector("svg.lucide-x");

      expect(menuIcon).toHaveClass("opacity-0");
      expect(menuIcon).toHaveClass("rotate-90");

      expect(closeIcon).toHaveClass("opacity-100");
      expect(closeIcon).toHaveClass("rotate-0");
    });
  });
});
