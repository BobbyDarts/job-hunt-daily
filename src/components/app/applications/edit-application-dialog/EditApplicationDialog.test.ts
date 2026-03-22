// /src/components/app/applications/edit-application-dialog/EditApplicationDialog.test.ts

import userEvent from "@testing-library/user-event";
import { screen, waitFor } from "@testing-library/vue";
import { describe, it, expect, beforeEach, vi } from "vitest";

import { TooltipProvider } from "@/components/ui/tooltip";
import { useApplications } from "@/composables/data";
import { mockApplications } from "@/test-utils/mocks";
import { getButtonByName, getInput } from "@/test-utils/queries";
import { renderBaseWithProviders } from "@/test-utils/render-base";
import type { Application } from "@/types";

import { EditApplicationDialog, type EditApplicationDialogProps } from ".";

vi.mock("@/composables/data");

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
      events: ["update:open"],
      ...options,
    },
  );
}

describe("EditApplicationDialog", () => {
  let user: ReturnType<typeof userEvent.setup>;
  let mockUpdateApplication: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateApplication = vi.fn().mockResolvedValue(mockApplications[0]);
    vi.mocked(useApplications).mockReturnValue({
      updateApplication: mockUpdateApplication,
    } as unknown as ReturnType<typeof useApplications>);
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
    it("calls updateApplication with updated data", async () => {
      renderEditApplicationDialog();

      const companyInput = await getInput<HTMLInputElement>(/company/i);
      await user.clear(companyInput);
      await user.type(companyInput, "Updated Company");

      await user.click(await getButtonByName(/save changes/i));

      await waitFor(() => {
        expect(mockUpdateApplication).toHaveBeenCalledWith(
          mockApplications[0].id,
          expect.objectContaining({ company: "Updated Company" }),
        );
      });
    });

    it("closes dialog after submission", async () => {
      const { emitted } = renderEditApplicationDialog();

      await user.click(await getButtonByName(/save changes/i));

      await waitFor(() => {
        expect(
          emitted()["update:open"]?.some(e => (e as unknown[])[0] === false),
        ).toBe(true);
      });
    });
  });

  describe("cancel behavior", () => {
    it("closes dialog when cancel is clicked", async () => {
      const { emitted } = renderEditApplicationDialog();

      await user.click(await getButtonByName(/cancel/i));

      await waitFor(() => {
        expect(
          emitted()["update:open"]?.some(e => (e as unknown[])[0] === false),
        ).toBe(true);
      });
    });

    it("does not call updateApplication when cancel is clicked", async () => {
      renderEditApplicationDialog();

      await user.click(await getButtonByName(/cancel/i));

      expect(mockUpdateApplication).not.toHaveBeenCalled();
    });
  });

  describe("application prop handling", () => {
    it("does not render when application is null", () => {
      renderEditApplicationDialog({ application: null });

      expect(
        screen.queryByRole("heading", { name: "Edit Application" }),
      ).not.toBeInTheDocument();
    });
  });
});
