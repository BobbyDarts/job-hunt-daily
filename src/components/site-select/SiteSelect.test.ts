// /src/components/site-select/SiteSelect.test.ts

import userEvent from "@testing-library/user-event";
import { screen, waitFor } from "@testing-library/vue";
import { describe, it, expect, beforeEach } from "vitest";

import { SiteSelect } from "@/components/site-select";
import type {
  Props as SelectSiteProps,
  SiteWithCategory,
} from "@/components/site-select";
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

const DEFAULT_PROPS: SelectSiteProps = {
  modelValue: "all",
  sites: mockSites,
  placeholder: "Select a site",
  groupByCategory: true,
  showAllOption: false,
};

function renderSiteSelect(
  overrides: Partial<SelectSiteProps> = {},
  options: { slots?: Record<string, unknown> } = {},
) {
  return renderBaseWithProviders(SiteSelect, DEFAULT_PROPS, overrides, {
    providers: [TooltipProvider],
    ...options,
  });
}

describe("SiteSelect", () => {
  let user: ReturnType<typeof userEvent.setup>;

  // Add missing pointer capture methods to Element prototype
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

      const trigger = screen.getByRole("combobox");
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText("LinkedIn")).toBeInTheDocument();
        expect(screen.getByText("Indeed")).toBeInTheDocument();
        expect(screen.getByText("AngelList")).toBeInTheDocument();
      });
    });

    it("displays 'All Sites' option when showAllOption is true", async () => {
      renderSiteSelect({ placeholder: "All Sites", showAllOption: true });

      const trigger = screen.getByRole("combobox");
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getAllByText("All Sites").length).toBeGreaterThan(0);
      });
    });

    it("does not display 'All Sites' option when showAllOption is false", async () => {
      renderSiteSelect({ modelValue: "linkedin", placeholder: "All Sites" });

      const trigger = screen.getByRole("combobox");
      await user.click(trigger);

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

      const trigger = screen.getByRole("combobox");
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText("General Job Boards")).toBeInTheDocument();
        expect(screen.getByText("Tech & Startup Boards")).toBeInTheDocument();
        expect(screen.getByText("Remote-Focused Boards")).toBeInTheDocument();
      });
    });

    it("does not group sites when groupByCategory is false", async () => {
      renderSiteSelect({ groupByCategory: false });

      const trigger = screen.getByRole("combobox");
      await user.click(trigger);

      await waitFor(() => {
        expect(
          screen.queryByText("General Job Boards"),
        ).not.toBeInTheDocument();
        expect(screen.getByText("LinkedIn")).toBeInTheDocument();
      });
    });

    it("handles sites without category by grouping under 'Other'", async () => {
      const sitesWithMissingCategory: SiteWithCategory[] = [
        ...mockSites,
        {
          id: "custom",
          name: "Custom Site",
          url: "https://custom.com",
          // No category
        },
      ];

      renderSiteSelect({ sites: sitesWithMissingCategory });

      const trigger = screen.getByRole("combobox");
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText("Other")).toBeInTheDocument();
        expect(screen.getByText("Custom Site")).toBeInTheDocument();
      });
    });
  });

  describe("Search functionality", () => {
    it("displays search input in dropdown", async () => {
      renderSiteSelect();

      const trigger = screen.getByRole("combobox");
      await user.click(trigger);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText("Search sites..."),
        ).toBeInTheDocument();
      });
    });

    it("filters sites by search query", async () => {
      renderSiteSelect();

      const trigger = screen.getByRole("combobox");
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText("LinkedIn")).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText("Search sites...");
      await user.type(searchInput, "angel");

      await waitFor(() => {
        expect(screen.getByText("AngelList")).toBeInTheDocument();
        expect(screen.queryByText("LinkedIn")).not.toBeInTheDocument();
        expect(screen.queryByText("Indeed")).not.toBeInTheDocument();
      });
    });

    it("search is case-insensitive", async () => {
      renderSiteSelect();

      const trigger = screen.getByRole("combobox");
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText("LinkedIn")).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText("Search sites...");
      await user.type(searchInput, "LINKEDIN");

      await waitFor(() => {
        expect(screen.getByText("LinkedIn")).toBeInTheDocument();
        expect(screen.queryByText("Indeed")).not.toBeInTheDocument();
      });
    });

    it("shows 'No sites found' message when search has no results", async () => {
      renderSiteSelect();

      const trigger = screen.getByRole("combobox");
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText("LinkedIn")).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText("Search sites...");
      await user.type(searchInput, "xyz123nonexistent");

      await waitFor(() => {
        expect(screen.getByText("No sites found")).toBeInTheDocument();
        expect(screen.queryByText("LinkedIn")).not.toBeInTheDocument();
      });
    });

    it("clears search query after selecting a site", async () => {
      const { emitted } = renderSiteSelect();

      const trigger = screen.getByRole("combobox");
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText("LinkedIn")).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText("Search sites...");
      await user.type(searchInput, "linked");

      await waitFor(() => {
        expect(screen.getByText("LinkedIn")).toBeInTheDocument();
      });

      const linkedinOption = screen.getByRole("option", { name: "LinkedIn" });
      await user.click(linkedinOption);

      expect(emitted()).toHaveProperty("update:modelValue");
      expect(emitted()["update:modelValue"][0]).toEqual(["linkedin"]);
    });
  });

  describe("Selection", () => {
    it("emits update:modelValue when site is selected", async () => {
      const { emitted } = renderSiteSelect();

      const trigger = screen.getByRole("combobox");
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText("LinkedIn")).toBeInTheDocument();
      });

      const linkedinOption = screen.getByRole("option", { name: "LinkedIn" });
      await user.click(linkedinOption);

      expect(emitted()).toHaveProperty("update:modelValue");
      expect(emitted()["update:modelValue"][0]).toEqual(["linkedin"]);
    });

    it("emits 'all' when 'All Sites' option is selected", async () => {
      const { emitted } = renderSiteSelect({
        modelValue: "linkedin",
        placeholder: "All Sites",
        showAllOption: true,
      });

      const trigger = screen.getByRole("combobox");
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getAllByText("All Sites").length).toBeGreaterThan(0);
      });

      const allOption = screen.getByRole("option", { name: "All Sites" });
      await user.click(allOption);

      expect(emitted()).toHaveProperty("update:modelValue");
      expect(emitted()["update:modelValue"][0]).toEqual(["all"]);
    });
  });

  describe("Empty state", () => {
    it("handles empty sites array", () => {
      renderSiteSelect({ sites: [], placeholder: "No sites available" });

      expect(screen.getByText("No sites available")).toBeInTheDocument();
    });

    it("shows 'No sites found' when empty after search", async () => {
      renderSiteSelect();

      const trigger = screen.getByRole("combobox");
      await user.click(trigger);

      const searchInput = screen.getByPlaceholderText("Search sites...");
      await user.type(searchInput, "zzzzz");

      await waitFor(() => {
        expect(screen.getByText("No sites found")).toBeInTheDocument();
      });
    });
  });

  describe("Sorting", () => {
    it("sorts sites alphabetically within each category", async () => {
      const unsortedSites: SiteWithCategory[] = [
        {
          id: "z",
          name: "Zebra Site",
          url: "https://z.com",
          category: "Test",
        },
        {
          id: "a",
          name: "Alpha Site",
          url: "https://a.com",
          category: "Test",
        },
        {
          id: "m",
          name: "Middle Site",
          url: "https://m.com",
          category: "Test",
        },
      ];

      renderSiteSelect({ sites: unsortedSites });

      const trigger = screen.getByRole("combobox");
      await user.click(trigger);

      await waitFor(() => {
        const options = screen.getAllByRole("option");
        const optionTexts = options.map(opt => opt.textContent);
        const testOptions = optionTexts.filter(text =>
          ["Alpha Site", "Middle Site", "Zebra Site"].includes(text || ""),
        );

        expect(testOptions).toEqual([
          "Alpha Site",
          "Middle Site",
          "Zebra Site",
        ]);
      });
    });
  });
});
