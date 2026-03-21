// /src/components/app/applications/tags-multi-select/TagsMultiSelect.test.ts

import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/vue";
import { describe, it, expect } from "vitest";

import { TooltipProvider } from "@/components/ui/tooltip";
import { renderBaseWithProviders } from "@/test-utils/render-base";
import type { ApplicationTag } from "@/types";
import { getTags } from "@/types";

import { TagsMultiSelect, type TagsMultiSelectProps } from ".";

const DEFAULT_PROPS: TagsMultiSelectProps = {
  modelValue: [] as ApplicationTag[],
};

function renderTagsMultiSelect(
  overrides: Partial<TagsMultiSelectProps> = {},
  options: { slots?: Record<string, unknown> } = {},
) {
  return renderBaseWithProviders(TagsMultiSelect, DEFAULT_PROPS, overrides, {
    providers: [TooltipProvider],
    events: ["update:modelValue"],
    ...options,
  });
}

describe("TagsMultiSelect", () => {
  it("renders tags grouped by category", () => {
    renderTagsMultiSelect();

    expect(screen.getByText("INTERVIEW")).toBeInTheDocument();
    expect(screen.getByText("ACTION")).toBeInTheDocument();
  });

  it("renders all tag labels from getTags()", () => {
    renderTagsMultiSelect();

    getTags().forEach(tag => {
      expect(screen.getByText(tag.label)).toBeInTheDocument();
    });
  });

  describe("selection behavior", () => {
    it("emits update:modelValue when a tag is selected", async () => {
      const user = userEvent.setup();
      const { emitted } = renderTagsMultiSelect();

      const firstTag = getTags()[0];

      await user.click(screen.getByText(firstTag.label));

      expect(emitted()["update:modelValue"]).toBeTruthy();
      const emitArgs = emitted()["update:modelValue"][0] as unknown[];
      expect(emitArgs[0] as ApplicationTag[]).toContain(firstTag.tag);
    });

    it("removes tag from modelValue when clicked again", async () => {
      const user = userEvent.setup();

      const firstTag = getTags()[0];
      const { emitted } = renderTagsMultiSelect({ modelValue: [firstTag.tag] });

      await user.click(screen.getByText(firstTag.label));

      const emitArgs = emitted()["update:modelValue"][0] as unknown[];
      expect(emitArgs[0] as ApplicationTag[]).not.toContain(firstTag.tag);
    });

    it("applies selected styles when tag is in modelValue", () => {
      const { tag, label, color } = getTags()[0];

      renderTagsMultiSelect({ modelValue: [tag] });

      const button = screen.getByText(label);
      expect(button.className).toContain(color);
    });
  });
});
