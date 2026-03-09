// /src/components/app/shell/header/Header.test.ts

import { screen } from "@testing-library/vue";
import { describe, expect, it } from "vitest";
import { h } from "vue";
import { createMemoryHistory, createRouter } from "vue-router";

import type { HeaderProps } from "@/components/app/shell/header";
import { Header } from "@/components/app/shell/header";
import { TooltipProvider } from "@/components/ui/tooltip";
import { renderBaseWithProviders } from "@/test-utils/render-base";

const DEFAULT_PROPS: HeaderProps = {
  title: "Job Hunt Daily",
  visitedCount: 3,
  totalSites: 5,
  progress: 60,
  isComplete: false,
};

function renderHeader(
  overrides: Partial<HeaderProps> = {},
  options: { slots?: Record<string, unknown> } = {},
) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: "/", name: "Home", component: { template: "<div />" } }],
  });

  return renderBaseWithProviders(Header, DEFAULT_PROPS, overrides, {
    providers: [TooltipProvider],
    plugins: [router],
    ...options,
  });
}

describe("Header", () => {
  it("renders the logo", () => {
    renderHeader();
    const logo = screen.getByAltText("Job Hunt Daily");
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("src", "/src/assets/logo.svg");
  });

  it("renders actions slot if provided", () => {
    renderHeader(
      {},
      {
        slots: {
          actions: () => h("button", {}, "Settings"),
        },
      },
    );
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("renders correctly without actions slot", () => {
    renderHeader();

    expect(screen.queryByRole("button", { name: "Settings" })).toBeNull();
  });
});
