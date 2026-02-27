// /src/components/status-select/StatusSelect.test.ts

import userEvent from "@testing-library/user-event";
import { screen, waitFor } from "@testing-library/vue";
import { describe, it, expect, beforeEach } from "vitest";

import { StatusSelect } from "@/components/status-select";
import type { Props as StatusSelectProps } from "@/components/status-select";
import { TooltipProvider } from "@/components/ui/tooltip";
import { renderBaseWithProviders } from "@/test-utils/render-base";
import { getStatuses } from "@/types";

const statuses = getStatuses();

const DEFAULT_PROPS: StatusSelectProps = {
  modelValue: "all",
  placeholder: "Select status",
  showAllOption: false,
};

function renderStatusSelect(overrides: Partial<StatusSelectProps> = {}) {
  return renderBaseWithProviders(StatusSelect, DEFAULT_PROPS, overrides, {
    providers: [TooltipProvider],
  });
}

describe("StatusSelect", () => {
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
    it("renders with placeholder when modelValue is 'all'", () => {
      renderStatusSelect({ placeholder: "All Statuses" });

      expect(screen.getByText("All Statuses")).toBeInTheDocument();
    });

    it("displays correct label for each status", () => {
      statuses.forEach(({ status, label }) => {
        const { unmount } = renderStatusSelect({ modelValue: status });
        expect(screen.getByText(label)).toBeInTheDocument();
        unmount();
      });
    });

    it("falls back to placeholder when modelValue is 'all'", () => {
      renderStatusSelect({ placeholder: "Select status" });

      expect(screen.getByText("Select status")).toBeInTheDocument();
    });
  });

  describe("Dropdown interaction", () => {
    it("opens dropdown and shows all statuses", async () => {
      renderStatusSelect();

      await user.click(screen.getByRole("combobox"));

      await waitFor(() => {
        statuses.forEach(({ label }) => {
          expect(screen.getByText(label)).toBeInTheDocument();
        });
      });
    });

    it("shows descriptions for all statuses in the dropdown", async () => {
      renderStatusSelect();

      await user.click(screen.getByRole("combobox"));

      await waitFor(() => {
        statuses.forEach(({ description }) => {
          if (description) {
            expect(screen.getByText(description)).toBeInTheDocument();
          }
        });
      });
    });

    it("shows all-option when showAllOption is true", async () => {
      renderStatusSelect({ placeholder: "All Statuses", showAllOption: true });

      await user.click(screen.getByRole("combobox"));

      await waitFor(() => {
        expect(screen.getAllByText("All Statuses").length).toBeGreaterThan(0);
      });
    });

    it("does not show all-option when showAllOption is false", async () => {
      renderStatusSelect({
        modelValue: "applied",
        placeholder: "All Statuses",
        showAllOption: false,
      });

      await user.click(screen.getByRole("combobox"));

      await waitFor(() => {
        expect(
          screen.queryAllByRole("option", { name: "All Statuses" }),
        ).toHaveLength(0);
      });
    });
  });

  describe("Selection", () => {
    it("emits correct value for each selectable status", async () => {
      for (const { status, label } of statuses) {
        const { emitted, unmount } = renderStatusSelect({ modelValue: "all" });

        await user.click(screen.getByRole("combobox"));

        await waitFor(() => {
          expect(
            screen.getByRole("option", { name: new RegExp(label, "i") }),
          ).toBeInTheDocument();
        });

        await user.click(
          screen.getByRole("option", { name: new RegExp(label, "i") }),
        );

        expect(emitted()["update:modelValue"][0]).toEqual([status]);
        unmount();
      }
    });

    it("emits 'all' when the all-option is selected", async () => {
      const { emitted } = renderStatusSelect({
        modelValue: "applied",
        placeholder: "All Statuses",
        showAllOption: true,
      });

      await user.click(screen.getByRole("combobox"));

      await waitFor(() => {
        expect(
          screen.getByRole("option", { name: "All Statuses" }),
        ).toBeInTheDocument();
      });

      await user.click(screen.getByRole("option", { name: "All Statuses" }));

      expect(emitted()["update:modelValue"][0]).toEqual(["all"]);
    });
  });
});
