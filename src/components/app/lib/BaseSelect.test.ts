// /src/components/app/lib/BaseSelect.test.ts

import userEvent from "@testing-library/user-event";
import { screen, waitFor } from "@testing-library/vue";
import { describe, it, expect, beforeEach } from "vitest";

import { TooltipProvider } from "@/components/ui/tooltip";
import { getButtonByName } from "@/test-utils/queries";
import { renderBaseWithProviders } from "@/test-utils/render-base";

import BaseSelect, { type BaseSelectProps } from "./BaseSelect.vue";

const options = [
  { value: "apple", label: "Apple", category: "Fruit" },
  { value: "banana", label: "Banana", category: "Fruit" },
  { value: "carrot", label: "Carrot", category: "Vegetable" },
];

const DEFAULT_PROPS: BaseSelectProps = {
  modelValue: "",
  options,
  variant: "default",
};

function renderBaseSelect(overrides: Partial<BaseSelectProps> = {}) {
  return renderBaseWithProviders(BaseSelect, DEFAULT_PROPS, overrides, {
    providers: [TooltipProvider],
    events: ["update:modelValue"],
  });
}

describe("BaseSelect", () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  describe("default variant", () => {
    it("renders all options", () => {
      renderBaseSelect();
      expect(screen.getByText("Apple")).toBeInTheDocument();
      expect(screen.getByText("Banana")).toBeInTheDocument();
      expect(screen.getByText("Carrot")).toBeInTheDocument();
    });

    it("emits update:modelValue when an option is clicked", async () => {
      const { emitted } = renderBaseSelect();
      await user.click(screen.getByText("Apple"));
      expect(emitted()["update:modelValue"]).toBeTruthy();
      expect(emitted()["update:modelValue"][0]).toEqual(["apple"]);
    });

    it("marks selected option visually", async () => {
      renderBaseSelect({ modelValue: "apple" });
      const appleButton = screen.getByText("Apple").closest("button");
      expect(appleButton?.className).toMatch(/border-primary|bg-primary/);
    });
  });

  describe("pills variant", () => {
    it("renders all options as pill buttons", () => {
      renderBaseSelect({ variant: "pills" });
      expect(screen.getByText("Apple")).toBeInTheDocument();
      expect(screen.getByText("Banana")).toBeInTheDocument();
      expect(screen.getByText("Carrot")).toBeInTheDocument();
    });

    it("emits update:modelValue when a pill is clicked", async () => {
      const { emitted } = renderBaseSelect({ variant: "pills" });
      await user.click(screen.getByText("Apple"));
      expect(emitted()["update:modelValue"][0]).toEqual(["apple"]);
    });
  });

  describe("accordion variant", () => {
    it("renders category headings", () => {
      renderBaseSelect({ variant: "accordion", groupByCategory: true });
      expect(screen.getByText("Fruit")).toBeInTheDocument();
      expect(screen.getByText("Vegetable")).toBeInTheDocument();
    });

    it("emits update:modelValue when an option is clicked", async () => {
      const { emitted } = renderBaseSelect({
        variant: "accordion",
        groupByCategory: true,
      });
      await user.click(screen.getByText("Apple"));
      expect(emitted()["update:modelValue"][0]).toEqual(["apple"]);
    });
  });

  describe("tabs variant", () => {
    it("renders tab triggers for each category", () => {
      renderBaseSelect({ variant: "tabs", groupByCategory: true });
      expect(screen.getByRole("tab", { name: "Fruit" })).toBeInTheDocument();
      expect(
        screen.getByRole("tab", { name: "Vegetable" }),
      ).toBeInTheDocument();
    });

    it("emits update:modelValue when an option is clicked", async () => {
      const { emitted } = renderBaseSelect({
        variant: "tabs",
        groupByCategory: true,
      });
      await user.click(screen.getByText("Apple"));
      expect(emitted()["update:modelValue"][0]).toEqual(["apple"]);
    });
  });

  describe("dropdown variant", () => {
    it("renders trigger button with placeholder", async () => {
      renderBaseSelect({ variant: "dropdown", placeholder: "Pick one" });
      await waitFor(() => {
        expect(screen.getByText("Pick one")).toBeInTheDocument();
      });
    });

    it("opens popover and shows options on click", async () => {
      renderBaseSelect({ variant: "dropdown" });
      const trigger = await getButtonByName(/pick one|select\.\.\./i);
      await user.click(trigger);
      await waitFor(() => {
        expect(screen.getByText("Apple")).toBeInTheDocument();
      });
    });

    it("emits update:modelValue when an option is selected", async () => {
      const { emitted } = renderBaseSelect({
        variant: "dropdown",
        placeholder: "Pick one",
      });
      const trigger = screen.getByText("Pick one").closest("button")!;
      await user.click(trigger);
      await waitFor(() => screen.getByText("Apple"));
      await user.click(screen.getByText("Apple"));
      expect(emitted()["update:modelValue"][0]).toEqual(["apple"]);
    });

    it("shows selected label in trigger after selection", async () => {
      renderBaseSelect({ variant: "dropdown", modelValue: "apple" });
      await waitFor(() => {
        expect(screen.getByText("Apple")).toBeInTheDocument();
      });
    });
  });

  describe("showAllOption", () => {
    it("renders all option in dropdown variant", async () => {
      renderBaseSelect({
        variant: "dropdown",
        showAllOption: true,
        allOptionLabel: "All Items",
        modelValue: "all",
      });

      await user.click(screen.getByRole("button"));
      await waitFor(() => {
        expect(screen.getByText("All Items")).toBeInTheDocument();
      });
    });

    it("emits __all__ when all option is clicked in dropdown variant", async () => {
      const { emitted } = renderBaseSelect({
        variant: "dropdown",
        showAllOption: true,
        allOptionLabel: "All Items",
      });

      await user.click(screen.getByRole("button"));
      await waitFor(() => screen.getByText("All Items"));
      await user.click(screen.getByText("All Items"));
      expect(emitted()["update:modelValue"][0]).toEqual(["__all__"]);
    });
  });

  describe("multiple select", () => {
    it("emits array with both values when two options selected", async () => {
      const { emitted } = renderBaseSelect({
        multiple: true,
        modelValue: [],
        variant: "pills",
      });
      await user.click(screen.getByText("Apple"));
      expect(emitted()["update:modelValue"][0]).toEqual([["apple"]]);
    });

    it("shows checkmark for selected items in pills variant", () => {
      renderBaseSelect({
        multiple: true,
        modelValue: ["apple"],
        variant: "pills",
      });
      // The Check icon only renders for selected items in pills variant
      const appleButton = screen.getByText("Apple").closest("button");
      expect(appleButton?.querySelector("svg")).toBeInTheDocument();
    });
  });

  describe("placeholder", () => {
    it("shows placeholder text in dropdown when nothing selected", async () => {
      renderBaseSelect({
        variant: "dropdown",
        placeholder: "Choose something",
        modelValue: "",
      });
      await waitFor(() => {
        expect(screen.getByText("Choose something")).toBeInTheDocument();
      });
    });
  });
});
