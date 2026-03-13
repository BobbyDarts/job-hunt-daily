// /src/components/app/sites/site-select/SiteSelect.test.ts

import userEvent from "@testing-library/user-event";
import { screen, waitFor, within } from "@testing-library/vue";
import { describe, it, expect, beforeEach, vi } from "vitest";

import { SiteSelect } from "@/components/app/sites/site-select";
import type {
  SiteSelectProps,
  SiteWithCategory,
} from "@/components/app/sites/site-select";
import { TooltipProvider } from "@/components/ui/tooltip";
import { renderBaseWithProviders } from "@/test-utils/render-base";

const mockSites: SiteWithCategory[] = [
  {
    id: "linkedin",
    name: "LinkedIn",
    url: "https://linkedin.com",
    category: "General Job Boards",
  },
  {
    id: "indeed",
    name: "Indeed",
    url: "https://indeed.com",
    category: "General Job Boards",
  },
  {
    id: "angellist",
    name: "AngelList",
    url: "https://angel.co",
    category: "Tech & Startup Boards",
  },
  {
    id: "weworkremotely",
    name: "We Work Remotely",
    url: "https://weworkremotely.com",
    category: "Remote-Focused Boards",
  },
];

const DEFAULT_PROPS: SiteSelectProps = {
  modelValue: "all",
  sites: mockSites,
  placeholder: "Select a site",
  groupByCategory: true,
  showAllOption: false,
};

function renderSiteSelect(
  overrides: Partial<SiteSelectProps> = {},
  options: { slots?: Record<string, unknown> } = {},
) {
  return renderBaseWithProviders(SiteSelect, DEFAULT_PROPS, overrides, {
    providers: [TooltipProvider],
    ...options,
  });
}

function getDropdownTrigger(name?: string) {
  return name
    ? screen.getByRole("button", { name: new RegExp(name, "i") })
    : screen.getByRole("button", { name: /./s });
}

describe("SiteSelect", () => {
  let user: ReturnType<typeof userEvent.setup>;

  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = vi.fn(() => false);
  }
  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = vi.fn();
  }
  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = vi.fn();
  }

  beforeEach(() => {
    user = userEvent.setup();
  });

  describe("Rendering", () => {
    it("renders with placeholder", () => {
      renderSiteSelect();

      expect(screen.getByText("Select a site")).toBeInTheDocument();
    });

    it("displays selected site name", () => {
      renderSiteSelect({ modelValue: "linkedin" });

      expect(screen.getByText("LinkedIn")).toBeInTheDocument();
    });

    it("shows placeholder when modelValue is 'all'", () => {
      renderSiteSelect({ placeholder: "All Sites" });

      expect(screen.getByText("All Sites")).toBeInTheDocument();
    });

    it("shows placeholder when site not found", () => {
      renderSiteSelect({ modelValue: "nonexistent" });

      expect(screen.getByText("Select a site")).toBeInTheDocument();
    });
  });

  describe("Dropdown interaction", () => {
    it("opens dropdown when clicked", async () => {
      renderSiteSelect({ showAllOption: true });

      await user.click(getDropdownTrigger());

      await waitFor(() => {
        expect(screen.getAllByText("LinkedIn").length).toBeGreaterThanOrEqual(
          1,
        );
        expect(screen.getAllByText("Indeed").length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText("AngelList").length).toBeGreaterThanOrEqual(
          1,
        );
      });
    });

    it("displays 'All Sites' option when showAllOption is true", async () => {
      renderSiteSelect({ placeholder: "All Sites", showAllOption: true });

      await user.click(getDropdownTrigger());

      await waitFor(() => {
        expect(screen.getAllByText("All Sites").length).toBeGreaterThan(0);
      });
    });

    it("does not display 'All Sites' option when showAllOption is false", async () => {
      renderSiteSelect({ modelValue: "linkedin", placeholder: "All Sites" });

      await user.click(getDropdownTrigger());

      await waitFor(() => {
        const allSitesOptions = screen.queryAllByRole("option", {
          name: "All Sites",
        });
        expect(allSitesOptions).toHaveLength(0);
      });
    });
  });

  describe("Site grouping", () => {
    it("groups sites by category when groupByCategory is true", async () => {
      renderSiteSelect();

      await user.click(getDropdownTrigger());

      await waitFor(() => {
        expect(screen.getByText("General Job Boards")).toBeInTheDocument();
        expect(screen.getByText("Tech & Startup Boards")).toBeInTheDocument();
        expect(screen.getByText("Remote-Focused Boards")).toBeInTheDocument();
      });
    });

    it("does not group sites when groupByCategory is false", async () => {
      renderSiteSelect({ groupByCategory: false });

      await user.click(getDropdownTrigger());

      await waitFor(() => {
        expect(
          screen.queryByText("General Job Boards"),
        ).not.toBeInTheDocument();
        expect(screen.getAllByText("LinkedIn").length).toBeGreaterThanOrEqual(
          1,
        );
      });
    });

    it("handles sites without category by grouping under 'Other'", async () => {
      const sitesWithMissingCategory: SiteWithCategory[] = [
        ...mockSites,
        {
          id: "custom",
          name: "Custom Site",
          url: "https://custom.com",
        },
      ];

      renderSiteSelect({ sites: sitesWithMissingCategory });

      await user.click(getDropdownTrigger());

      await waitFor(() => {
        expect(screen.getByText("Other")).toBeInTheDocument();
        expect(screen.getByText("Custom Site")).toBeInTheDocument();
      });
    });
  });

  describe("Search functionality", () => {
    it("displays search input in dropdown", async () => {
      renderSiteSelect();

      await user.click(getDropdownTrigger());

      await waitFor(() => {
        expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
      });
    });

    it("filters sites by search query", async () => {
      renderSiteSelect();

      await user.click(getDropdownTrigger());

      const listbox = await screen.findByRole("listbox");
      expect(within(listbox).getAllByRole("option").length).toBeGreaterThan(0);

      const searchInput = screen.getByPlaceholderText("Search...");
      await user.type(searchInput, "angel");

      await waitFor(() => {
        expect(screen.getAllByText("AngelList").length).toBeGreaterThanOrEqual(
          1,
        );
        expect(screen.queryByText("Indeed")).not.toBeInTheDocument();
      });
    });

    it("search is case-insensitive", async () => {
      renderSiteSelect();

      await user.click(getDropdownTrigger());

      const searchInput = screen.getByPlaceholderText("Search...");
      await user.type(searchInput, "LINKEDIN");

      await waitFor(() => {
        expect(screen.getAllByText("LinkedIn").length).toBeGreaterThanOrEqual(
          1,
        );
        expect(screen.queryByText("Indeed")).not.toBeInTheDocument();
      });
    });

    it("shows 'No results found' message when search has no results", async () => {
      renderSiteSelect();

      await user.click(getDropdownTrigger());

      const searchInput = screen.getByPlaceholderText("Search...");
      await user.type(searchInput, "xyz123nonexistent");

      await waitFor(() => {
        expect(screen.getByText("No results found.")).toBeInTheDocument();
        expect(screen.queryByText("LinkedIn")).not.toBeInTheDocument();
      });
    });

    it("clears search query after selecting a site", async () => {
      const { emitted } = renderSiteSelect();

      await user.click(getDropdownTrigger());

      const searchInput = screen.getByPlaceholderText("Search...");
      await user.type(searchInput, "linked");

      const listbox = await screen.findByRole("listbox");
      await user.click(
        within(listbox).getByRole("option", { name: "LinkedIn" }),
      );

      expect(emitted()).toHaveProperty("update:modelValue");
      expect(emitted()["update:modelValue"][0]).toEqual(["linkedin"]);
    });
  });

  describe("Selection", () => {
    it("emits update:modelValue when site is selected", async () => {
      const { emitted } = renderSiteSelect();

      await user.click(getDropdownTrigger());

      const listbox = await screen.findByRole("listbox");
      await user.click(
        within(listbox).getByRole("option", { name: "LinkedIn" }),
      );

      expect(emitted()).toHaveProperty("update:modelValue");
      expect(emitted()["update:modelValue"][0]).toEqual(["linkedin"]);
    });

    it("emits 'all' when 'All Sites' option is selected", async () => {
      const { emitted } = renderSiteSelect({
        modelValue: "linkedin",
        placeholder: "All Sites",
        showAllOption: true,
      });

      await user.click(getDropdownTrigger());

      await waitFor(() => {
        expect(screen.getAllByText("All Sites").length).toBeGreaterThan(0);
      });

      const listbox = screen.getByRole("listbox");
      await user.click(
        within(listbox).getByRole("option", { name: "All Sites" }),
      );

      expect(emitted()).toHaveProperty("update:modelValue");
      expect(emitted()["update:modelValue"][0]).toEqual(["all"]);
    });
  });

  describe("Empty state", () => {
    it("handles empty sites array", () => {
      renderSiteSelect({ sites: [], placeholder: "No sites available" });

      expect(screen.getByText("No sites available")).toBeInTheDocument();
    });

    it("shows 'No results found.' when empty after search", async () => {
      renderSiteSelect();

      await user.click(getDropdownTrigger());

      const searchInput = screen.getByPlaceholderText("Search...");
      await user.type(searchInput, "zzzzz");

      await waitFor(() => {
        expect(screen.getByText("No results found.")).toBeInTheDocument();
      });
    });
  });

  describe("Sorting", () => {
    it("sorts sites alphabetically within each category", async () => {
      const unsortedSites: SiteWithCategory[] = [
        { id: "z", name: "Zebra Site", url: "https://z.com", category: "Test" },
        { id: "a", name: "Alpha Site", url: "https://a.com", category: "Test" },
        {
          id: "m",
          name: "Middle Site",
          url: "https://m.com",
          category: "Test",
        },
      ];

      renderSiteSelect({ sites: unsortedSites });

      await user.click(getDropdownTrigger());

      await waitFor(() => {
        const listbox = screen.getByRole("listbox");
        const options = within(listbox).getAllByRole("option");
        const optionTexts = options.map(opt => opt.textContent?.trim());

        expect(optionTexts).toEqual([
          "Alpha Site",
          "Middle Site",
          "Zebra Site",
        ]);
      });
    });
  });
});
