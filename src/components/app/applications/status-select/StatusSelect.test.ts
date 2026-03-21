// /src/components/app/applications/status-select/StatusSelect.test.ts

import userEvent from "@testing-library/user-event";
import { screen, waitFor, within } from "@testing-library/vue";
import { describe, it, expect, beforeEach, vi } from "vitest";

import { TooltipProvider } from "@/components/ui/tooltip";
import { renderBaseWithProviders } from "@/test-utils/render-base";
import { getStatuses } from "@/types";

import { StatusSelect, type StatusSelectProps } from ".";

const statuses = getStatuses();

const DEFAULT_PROPS: StatusSelectProps = {
  modelValue: "all",
  placeholder: "Select status",
  showAllOption: false,
};

function renderStatusSelect(overrides: Partial<StatusSelectProps> = {}) {
  return renderBaseWithProviders(StatusSelect, DEFAULT_PROPS, overrides, {
    providers: [TooltipProvider],
    events: ["update:modelValue"],
  });
}

function getDropdownTrigger(name?: string) {
  return name
    ? screen.getByRole("button", { name: new RegExp(name, "i") })
    : screen.getByRole("button", { name: /./s });
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
    describe("Dropdown interaction", () => {
      it("opens dropdown and shows all statuses", async () => {
        renderStatusSelect();

        await user.click(getDropdownTrigger());

        await waitFor(() => {
          statuses.forEach(({ label }) => {
            expect(screen.getAllByText(label).length).toBeGreaterThanOrEqual(1);
          });
        });
      });

      it("shows descriptions for all statuses in the dropdown", async () => {
        renderStatusSelect();

        await user.click(getDropdownTrigger());

        await waitFor(() => {
          statuses.forEach(({ description }) => {
            if (description) {
              expect(
                screen.getAllByText(description).length,
              ).toBeGreaterThanOrEqual(1);
            }
          });
        });
      });

      it("shows all-option when showAllOption is true", async () => {
        renderStatusSelect({
          placeholder: "All Statuses",
          showAllOption: true,
        });

        await user.click(getDropdownTrigger());

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

        await user.click(getDropdownTrigger());

        await waitFor(() => {
          expect(
            screen.queryAllByRole("option", { name: "All Statuses" }),
          ).toHaveLength(0);
        });
      });
    });
  });

  describe("Selection", () => {
    it("emits correct value for each selectable status", async () => {
      for (const { status, label } of statuses) {
        const { emitted, unmount } = renderStatusSelect({ modelValue: "all" });

        await user.click(getDropdownTrigger());

        const listbox = await screen.findByRole("listbox");

        await user.click(
          within(listbox).getByRole("option", { name: new RegExp(label, "i") }),
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

      await user.click(getDropdownTrigger());

      await waitFor(() => {
        statuses.forEach(({ label }) => {
          expect(screen.getAllByText(label).length).toBeGreaterThanOrEqual(1);
        });
      });

      const listbox = screen.getByRole("listbox");
      await user.click(
        within(listbox).getByRole("option", { name: "All Statuses" }),
      );

      expect(emitted()["update:modelValue"][0]).toEqual(["all"]);
    });
  });
});
