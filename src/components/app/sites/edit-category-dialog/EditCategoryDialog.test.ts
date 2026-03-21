// /src/components/app/sites/edit-category-dialog/EditCategoryDialog.test.ts

import userEvent from "@testing-library/user-event";
import { screen, waitFor } from "@testing-library/vue";
import { describe, it, expect, beforeEach, vi } from "vitest";

import { TooltipProvider } from "@/components/ui/tooltip";
import { renderBaseWithProviders } from "@/test-utils/render-base";
import type { JobCategory } from "@/types";

import { EditCategoryDialog, type EditCategoryDialogProps } from ".";

const mockUpdateCategory = vi.fn().mockResolvedValue(undefined);

vi.mock("@/composables/data", () => ({
  useJobSites: () => ({
    updateCategory: mockUpdateCategory,
  }),
}));

const mockCategory: JobCategory = {
  id: "general-job-boards",
  name: "General Job Boards",
  description: "Common job boards",
};

const DEFAULT_PROPS: EditCategoryDialogProps = {
  open: true,
  category: mockCategory,
};

function renderEditCategoryDialog(
  overrides: Partial<EditCategoryDialogProps> = {},
) {
  return renderBaseWithProviders(EditCategoryDialog, DEFAULT_PROPS, overrides, {
    providers: [TooltipProvider],
    events: ["update:open"],
  });
}

describe("EditCategoryDialog", () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    vi.clearAllMocks();
    user = userEvent.setup();
  });

  it("renders when open is true", async () => {
    renderEditCategoryDialog();
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /edit category/i }),
      ).toBeInTheDocument();
    });
  });

  it("does not render when open is false", () => {
    renderEditCategoryDialog({ open: false });
    expect(screen.queryByText("Edit Category")).not.toBeInTheDocument();
  });

  it("populates name field with category name", async () => {
    renderEditCategoryDialog();
    await waitFor(() => {
      expect(screen.getByLabelText(/name \*/i)).toHaveValue(
        "General Job Boards",
      );
    });
  });

  it("populates description field with category description", async () => {
    renderEditCategoryDialog();
    await waitFor(() => {
      expect(screen.getByLabelText(/description/i)).toHaveValue(
        "Common job boards",
      );
    });
  });

  it("disables save button when name is empty", async () => {
    renderEditCategoryDialog();
    const nameInput = await screen.findByLabelText(/name \*/i);
    await user.clear(nameInput);
    expect(
      screen.getByRole("button", { name: /save changes/i }),
    ).toBeDisabled();
  });

  it("calls updateCategory on submit", async () => {
    renderEditCategoryDialog();
    const nameInput = await screen.findByLabelText(/name \*/i);
    await user.clear(nameInput);
    await user.type(nameInput, "Updated Name");
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(mockUpdateCategory).toHaveBeenCalledWith("general-job-boards", {
        name: "Updated Name",
        description: "Common job boards",
      });
    });
  });

  it("emits update:open false after submit", async () => {
    const { emitted } = renderEditCategoryDialog();
    const nameInput = await screen.findByLabelText(/name \*/i);
    await user.clear(nameInput);
    await user.type(nameInput, "Updated Name");
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(
        emitted()["update:open"]?.some(e => (e as unknown[])[0] === false),
      ).toBe(true);
    });
  });

  it("emits update:open false when cancel is clicked", async () => {
    const { emitted } = renderEditCategoryDialog();
    await user.click(await screen.findByRole("button", { name: /cancel/i }));

    await waitFor(() => {
      expect(
        emitted()["update:open"]?.some(e => (e as unknown[])[0] === false),
      ).toBe(true);
    });
  });

  it("does not call updateCategory when category is null", async () => {
    renderEditCategoryDialog({ category: null });
    expect(mockUpdateCategory).not.toHaveBeenCalled();
  });
});
