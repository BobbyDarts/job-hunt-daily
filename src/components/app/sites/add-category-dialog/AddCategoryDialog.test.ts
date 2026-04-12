// /src/components/app/sites/add-category-dialog/AddCategoryDialog.test.ts

import userEvent from "@testing-library/user-event";
import { screen, waitFor } from "@testing-library/vue";
import { describe, it, expect, beforeEach, vi } from "vitest";

import { useJobSites } from "@/composables/data";
import { getButtonByName, getInput } from "@/test-utils/queries";
import { renderBaseWithProviders } from "@/test-utils/render-base";

import { AddCategoryDialog, type AddCategoryDialogProps } from ".";

vi.mock("@/composables/data");

const DEFAULT_PROPS: AddCategoryDialogProps = {
  open: true,
};

function renderAddCategoryDialog(
  overrides: Partial<AddCategoryDialogProps> = {},
) {
  return renderBaseWithProviders(AddCategoryDialog, DEFAULT_PROPS, overrides, {
    events: ["update:open"],
  });
}

describe("AddCategoryDialog", () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useJobSites).mockReturnValue({
      addCategory: vi.fn().mockResolvedValue({ id: "new-cat", name: "Test" }),
      getCategoryBySlug: vi.fn().mockReturnValue(undefined),
    } as unknown as ReturnType<typeof useJobSites>);
    user = userEvent.setup();
  });

  describe("rendering", () => {
    it("renders dialog when open is true", async () => {
      renderAddCategoryDialog();

      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: "Add Category" }),
        ).toBeInTheDocument();
      });

      expect(
        screen.getByText("Add a new category to organize your job sites"),
      ).toBeInTheDocument();
    });

    it("does not render dialog when open is false", () => {
      renderAddCategoryDialog({ open: false });
      expect(screen.queryByText("Add Category")).not.toBeInTheDocument();
    });

    it("renders name and description fields", async () => {
      renderAddCategoryDialog();

      await waitFor(() => {
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      });

      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    });

    it("marks name as required", async () => {
      renderAddCategoryDialog();

      await waitFor(() => {
        expect(screen.getByText(/Name \*/)).toBeInTheDocument();
      });
    });
  });

  describe("validation", () => {
    it("disables submit button when name is empty", async () => {
      renderAddCategoryDialog();

      await waitFor(async () => {
        expect(await getButtonByName(/add category/i)).toBeDisabled();
      });
    });

    it("enables submit button when name is filled", async () => {
      renderAddCategoryDialog();

      const nameInput = await getInput<HTMLInputElement>(/name/i);
      await user.type(nameInput, "Remote Jobs");

      expect(await getButtonByName(/add category/i)).toBeEnabled();
    });

    it("treats whitespace-only name as invalid", async () => {
      renderAddCategoryDialog();

      const nameInput = await getInput<HTMLInputElement>(/name/i);
      await user.type(nameInput, "   ");

      expect(await getButtonByName(/add category/i)).toBeDisabled();
    });
  });

  describe("cancel behavior", () => {
    it("closes dialog when cancel is clicked", async () => {
      const { emitted } = renderAddCategoryDialog();

      await user.click(await getButtonByName(/cancel/i));

      await waitFor(() => {
        expect(
          emitted()["update:open"]?.some(
            (e: unknown) => (e as unknown[])[0] === false,
          ),
        ).toBe(true);
      });
    });

    it("resets form when cancel is clicked", async () => {
      renderAddCategoryDialog();

      const nameInput = await getInput<HTMLInputElement>(/name/i);
      await user.type(nameInput, "Remote Jobs");

      await user.click(await getButtonByName(/cancel/i));

      await waitFor(() => {
        expect(nameInput).toHaveValue("");
      });
    });
  });

  describe("reactivity", () => {
    it("resets form when dialog reopens", async () => {
      const { rerender } = renderAddCategoryDialog();

      const nameInput = await getInput<HTMLInputElement>(/name/i);
      await user.type(nameInput, "Remote Jobs");

      await rerender({ open: false });
      await rerender({ open: true });

      await waitFor(() => {
        expect(nameInput).toHaveValue("");
      });
    });
  });

  describe("duplicate name warning", () => {
    it("shows warning when a category with a similar slug exists", async () => {
      vi.mocked(useJobSites).mockReturnValue({
        addCategory: vi.fn().mockResolvedValue({ id: "new-cat", name: "Test" }),
        getCategoryBySlug: vi
          .fn()
          .mockReturnValue({ id: "test-xx", name: "test xx" }),
      } as unknown as ReturnType<typeof useJobSites>);

      renderAddCategoryDialog();

      const nameInput = await getInput<HTMLInputElement>(/name/i);
      await user.type(nameInput, "test-xx");

      await waitFor(() => {
        expect(
          screen.getByText(/"test xx" already exists with a similar name/i),
        ).toBeInTheDocument();
      });
    });

    it("does not disable submit button when warning is shown", async () => {
      vi.mocked(useJobSites).mockReturnValue({
        addCategory: vi.fn().mockResolvedValue({ id: "new-cat", name: "Test" }),
        getCategoryBySlug: vi
          .fn()
          .mockReturnValue({ id: "test-xx", name: "test xx" }),
      } as unknown as ReturnType<typeof useJobSites>);

      renderAddCategoryDialog();

      const nameInput = await getInput<HTMLInputElement>(/name/i);
      await user.type(nameInput, "test-xx");

      expect(await getButtonByName(/add category/i)).toBeEnabled();
    });

    it("clears warning when name no longer collides", async () => {
      const mockGetCategoryBySlug = vi.fn((slug: string) => {
        return slug === "test-xx"
          ? { id: "test-xx", name: "test xx" }
          : undefined;
      });

      vi.mocked(useJobSites).mockReturnValue({
        addCategory: vi.fn().mockResolvedValue({ id: "new-cat", name: "Test" }),
        getCategoryBySlug: mockGetCategoryBySlug,
      } as unknown as ReturnType<typeof useJobSites>);

      renderAddCategoryDialog();

      const nameInput = await getInput<HTMLInputElement>(/name/i);
      await user.type(nameInput, "test-xx");

      await waitFor(() => {
        expect(
          screen.getByText(/"test xx" already exists with a similar name/i),
        ).toBeInTheDocument();
      });

      await user.clear(nameInput);
      await user.type(nameInput, "something-else");

      await waitFor(() => {
        expect(
          screen.queryByText(/"test xx" already exists with a similar name/i),
        ).not.toBeInTheDocument();
      });
    });
  });
});
