// /src/components/edit-application-dialog/EditApplicationDialog.test.ts

import userEvent from "@testing-library/user-event";
import { screen, waitFor } from "@testing-library/vue";
import { describe, it, expect, beforeEach, vi } from "vitest";

import { EditApplicationDialog } from "@/components/edit-application-dialog";
import type { Props as EditApplicationDialogProps } from "@/components/edit-application-dialog";
import { TooltipProvider } from "@/components/ui/tooltip";
import { mockApplications } from "@/test-utils/mocks";
import { getButtonByName, getInput } from "@/test-utils/queries";
import { renderBaseWithProviders } from "@/test-utils/render-base";
import type { Application } from "@/types";

const DEFAULT_PROPS: EditApplicationDialogProps = {
  open: true,
  application: mockApplications[0],
};

function renderEditApplicationDialog(
  overrides: Partial<EditApplicationDialogProps> = {},
  options: { slots?: Record<string, unknown> } = {},
) {
  return renderBaseWithProviders(
    EditApplicationDialog,
    DEFAULT_PROPS,
    overrides,
    {
      providers: [TooltipProvider],
      ...options,
    },
  );
}

describe("EditApplicationDialog", () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    vi.clearAllMocks();
    user = userEvent.setup();
  });

  describe("rendering", () => {
    it("renders dialog when open is true", async () => {
      renderEditApplicationDialog();

      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: "Edit Application" }),
        ).toBeInTheDocument();
      });

      expect(
        screen.getByText("Update the details of your job application"),
      ).toBeInTheDocument();
    });

    it("does not render dialog when open is false", () => {
      renderEditApplicationDialog({ open: false });
      expect(screen.queryByText("Edit Application")).not.toBeInTheDocument();
    });
  });

  describe("form population", () => {
    it("populates form with application data", async () => {
      renderEditApplicationDialog();

      await waitFor(async () => {
        const companyInput = await getInput<HTMLInputElement>(/company/i);
        expect(companyInput).toHaveValue("Acme Corp");
      });

      const positionInput = await getInput<HTMLInputElement>(/position/i);
      expect(positionInput).toHaveValue("Senior Developer");

      const notesInput = await getInput<HTMLTextAreaElement>(/notes/i);
      expect(notesInput).toHaveValue("Applied through John's referral");
    });

    it("updates form when application prop changes", async () => {
      const { rerender } = renderEditApplicationDialog();

      const newApplication: Application = {
        ...mockApplications[0],
        id: "2",
        company: "New Company",
        position: "New Position",
      };

      await rerender({ application: newApplication, open: true });

      await waitFor(async () => {
        const companyInput = await getInput<HTMLInputElement>(/company/i);
        expect(companyInput).toHaveValue("New Company");
      });

      const positionInput = await getInput<HTMLInputElement>(/position/i);
      expect(positionInput).toHaveValue("New Position");
    });
  });

  describe("form editing", () => {
    it("allows editing company name", async () => {
      renderEditApplicationDialog();

      const companyInput = await getInput<HTMLInputElement>(/company/i);
      await user.clear(companyInput);
      await user.type(companyInput, "Updated Company");

      expect(companyInput).toHaveValue("Updated Company");
    });

    it("allows editing position", async () => {
      renderEditApplicationDialog();

      const positionInput = await getInput<HTMLInputElement>(/position/i);
      await user.clear(positionInput);
      await user.type(positionInput, "Updated Position");

      expect(positionInput).toHaveValue("Updated Position");
    });

    it("allows editing notes", async () => {
      renderEditApplicationDialog();

      const notesInput = await getInput<HTMLTextAreaElement>(/notes/i);
      await user.clear(notesInput);
      await user.type(notesInput, "Updated notes");

      expect(notesInput).toHaveValue("Updated notes");
    });
  });

  describe("form submission", () => {
    it("emits submit event with updated data", async () => {
      const { emitted } = renderEditApplicationDialog();

      const companyInput = await getInput<HTMLInputElement>(/company/i);
      await user.clear(companyInput);
      await user.type(companyInput, "Updated Company");

      const saveButton = await getButtonByName(/save changes/i);
      await user.click(saveButton);

      await waitFor(() => {
        expect(emitted().submit).toBeTruthy();
        expect(emitted().submit?.[0]?.[0]).toMatchObject({
          company: "Updated Company",
        });
      });
    });

    it("closes dialog after submission", async () => {
      const { emitted } = renderEditApplicationDialog();

      const saveButton = await getButtonByName(/save changes/i);
      await user.click(saveButton);

      await waitFor(() => {
        expect(emitted()["update:open"]?.some(e => e[0] === false)).toBe(true);
      });
    });
  });

  describe("cancel behavior", () => {
    it("closes dialog when cancel is clicked", async () => {
      const { emitted } = renderEditApplicationDialog();

      const cancelButton = await getButtonByName(/cancel/i);
      await user.click(cancelButton);

      await waitFor(() => {
        expect(emitted()["update:open"]?.some(e => e[0] === false)).toBe(true);
      });
    });

    it("does not emit submit event when cancel is clicked", async () => {
      const { emitted } = renderEditApplicationDialog();

      const cancelButton = await getButtonByName(/cancel/i);
      await user.click(cancelButton);

      expect(emitted().submit).toBeFalsy();
    });
  });

  describe("application prop handling", () => {
    it("does not render when application is null", () => {
      renderEditApplicationDialog({ application: null });

      // Dialog should not render without an application to edit
      expect(
        screen.queryByRole("heading", { name: "Edit Application" }),
      ).not.toBeInTheDocument();
    });
  });
});
