// /src/components/app/sites/add-category-inline/AddCategoryInline.test.ts

import userEvent from "@testing-library/user-event";
import { screen, waitFor } from "@testing-library/vue";
import { describe, it, expect, beforeEach, vi } from "vitest";

import { TooltipProvider } from "@/components/ui/tooltip";
import { renderBaseWithProviders } from "@/test-utils/render-base";

import { AddCategoryInline } from ".";

vi.mock("@/composables/data", () => ({
  useJobSites: () => ({
    addCategory: vi
      .fn()
      .mockResolvedValue({ id: "new-category", name: "New Category" }),
  }),
}));

function renderAddCategoryInline() {
  return renderBaseWithProviders(
    AddCategoryInline,
    {},
    {},
    {
      providers: [TooltipProvider],
      events: ["added"],
    },
  );
}

describe("AddCategoryInline", () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  it("renders the + button", () => {
    renderAddCategoryInline();
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("does not show inline form initially", () => {
    renderAddCategoryInline();
    expect(screen.queryByLabelText(/name/i)).not.toBeInTheDocument();
  });

  it("shows inline form when + button is clicked", async () => {
    renderAddCategoryInline();
    await user.click(screen.getByRole("button"));
    expect(screen.getByLabelText(/name \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });

  it("hides inline form when + button is clicked again", async () => {
    renderAddCategoryInline();
    const button = screen.getByRole("button");
    await user.click(button);
    await user.click(button);
    expect(screen.queryByLabelText(/name \*/i)).not.toBeInTheDocument();
  });

  it("hides inline form when cancel is clicked", async () => {
    renderAddCategoryInline();
    await user.click(screen.getByRole("button"));
    await user.click(screen.getByRole("button", { name: /cancel/i }));
    expect(screen.queryByLabelText(/name \*/i)).not.toBeInTheDocument();
  });

  it("disables Add Category button when name is empty", async () => {
    renderAddCategoryInline();
    await user.click(screen.getByRole("button"));
    expect(
      screen.getByRole("button", { name: /add category/i }),
    ).toBeDisabled();
  });

  it("enables Add Category button when name is filled", async () => {
    renderAddCategoryInline();
    await user.click(screen.getByRole("button"));
    await user.type(screen.getByLabelText(/name \*/i), "My Category");
    expect(screen.getByRole("button", { name: /add category/i })).toBeEnabled();
  });

  it("emits added event with new category id on submit", async () => {
    const { emitted } = renderAddCategoryInline();
    await user.click(screen.getByRole("button"));
    await user.type(screen.getByLabelText(/name \*/i), "My Category");
    await user.click(screen.getByRole("button", { name: /add category/i }));

    await waitFor(() => {
      expect(emitted().added).toBeTruthy();
      expect(emitted().added[0]).toEqual(["new-category"]);
    });
  });

  it("resets and hides form after successful submission", async () => {
    renderAddCategoryInline();
    await user.click(screen.getByRole("button"));
    await user.type(screen.getByLabelText(/name \*/i), "My Category");
    await user.click(screen.getByRole("button", { name: /add category/i }));

    await waitFor(() => {
      expect(screen.queryByLabelText(/name \*/i)).not.toBeInTheDocument();
    });
  });

  it("submits on Enter key in name field", async () => {
    const { emitted } = renderAddCategoryInline();
    await user.click(screen.getByRole("button"));
    await user.type(screen.getByLabelText(/name \*/i), "My Category{Enter}");

    await waitFor(() => {
      expect(emitted().added).toBeTruthy();
    });
  });

  it("cancels on Escape key", async () => {
    renderAddCategoryInline();
    await user.click(screen.getByRole("button"));
    await user.type(screen.getByLabelText(/name \*/i), "My Category");
    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(screen.queryByLabelText(/name \*/i)).not.toBeInTheDocument();
    });
  });
});
