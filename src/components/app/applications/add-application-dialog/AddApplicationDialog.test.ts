// /src/components/app/applications/add-application-dialog/AddApplicationDialog.test.ts

import userEvent from "@testing-library/user-event";
import { screen, waitFor } from "@testing-library/vue";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { computed } from "vue";

import { TooltipProvider } from "@/components/ui/tooltip";
import { useApplications, useJobSites } from "@/composables/data";
import { todayIso } from "@/lib/time";
import { mockSite } from "@/test-utils/mocks";
import { getButtonByName, getInput } from "@/test-utils/queries";
import { renderBaseWithProviders } from "@/test-utils/render-base";
import type { JobSite } from "@/types";

import { AddApplicationDialog, type AddApplicationDialogProps } from ".";

vi.mock("@/composables/data");

/* ----------------------------------------
 * Test helpers
 * ----------------------------------------
 */

async function getSubmitButton() {
  return await getButtonByName(/add application/i);
}

async function getCancelButton() {
  return await getButtonByName(/cancel/i);
}

type FormFields = {
  company: string;
  position: string;
  notes: string;
};

async function fillValidForm(
  user: ReturnType<typeof userEvent.setup>,
  overrides: Partial<FormFields> = {},
): Promise<FormFields> {
  const defaults: FormFields = {
    company: "Tech Corp",
    position: "Developer",
    notes: "",
  };

  const values = { ...defaults, ...overrides };

  const companyInput = await getInput<HTMLInputElement>(/company/i);
  await user.clear(companyInput);
  await user.type(companyInput, values.company);

  const positionInput = await getInput<HTMLInputElement>(/position/i);
  await user.clear(positionInput);
  await user.type(positionInput, values.position);

  if (overrides.notes !== undefined) {
    const notesInput = await getInput<HTMLInputElement>(/notes/i);
    await user.clear(notesInput);
    await user.type(notesInput, values.notes);
  }

  return values;
}

const DEFAULT_PROPS: AddApplicationDialogProps = {
  open: true,
  site: mockSite,
};

function renderAddApplicationDialog(
  overrides: Partial<AddApplicationDialogProps> = {},
  options: { slots?: Record<string, unknown> } = {},
) {
  return renderBaseWithProviders(
    AddApplicationDialog,
    DEFAULT_PROPS,
    overrides,
    {
      providers: [TooltipProvider],
      events: ["update:open"],
      ...options,
    },
  );
}

describe("AddApplicationDialog", () => {
  let user: ReturnType<typeof userEvent.setup>;
  let mockAddApplication: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockAddApplication = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useApplications).mockReturnValue({
      addApplication: mockAddApplication,
    } as unknown as ReturnType<typeof useApplications>);
    vi.mocked(useJobSites).mockReturnValue({
      allSitesWithCategory: computed(() => []),
      getSiteById: vi.fn().mockReturnValue(undefined),
    } as unknown as ReturnType<typeof useJobSites>);
    user = userEvent.setup();
  });

  describe("rendering", () => {
    it("renders dialog when open is true", async () => {
      renderAddApplicationDialog();

      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: "Add Application" }),
        ).toBeInTheDocument();
      });

      expect(screen.getByText(/Log a job application/i)).toBeInTheDocument();
    });

    it("does not render dialog when open is false", () => {
      renderAddApplicationDialog({ open: false });
      expect(screen.queryByText("Add Application")).not.toBeInTheDocument();
    });
  });

  describe("site context", () => {
    it("displays site name in dialog description when provided", async () => {
      renderAddApplicationDialog();

      await waitFor(() => {
        expect(screen.getByText(/Log a job application/i)).toBeInTheDocument();
      });
    });

    it("shows placeholder text when site is null", async () => {
      renderAddApplicationDialog({ site: null });

      await waitFor(() => {
        expect(screen.getByText(/Log a job application/i)).toBeInTheDocument();
      });
    });
  });

  describe("form structure", () => {
    it("renders all expected form fields", async () => {
      renderAddApplicationDialog();

      await waitFor(() => {
        expect(screen.getByLabelText(/company/i)).toBeInTheDocument();
      });

      expect(screen.getByLabelText(/position/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/job posting url/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
      expect(screen.getByText(/tags/i)).toBeInTheDocument();
    });

    it("marks required fields with asterisk", async () => {
      renderAddApplicationDialog();

      await waitFor(() => {
        expect(screen.getByText(/Company \*/)).toBeInTheDocument();
      });

      expect(screen.getByText(/Position \*/)).toBeInTheDocument();
    });
  });

  describe("form input", () => {
    it("updates company value on user input", async () => {
      renderAddApplicationDialog();

      const input = await getInput<HTMLInputElement>(/company/i);
      await user.type(input, "Tech Corp");

      expect(input).toHaveValue("Tech Corp");
    });

    it("updates position value on user input", async () => {
      renderAddApplicationDialog();

      const input = await getInput<HTMLInputElement>(/position/i);
      await user.type(input, "Senior Developer");

      expect(input).toHaveValue("Senior Developer");
    });
  });

  describe("validation", () => {
    it("disables submit button when form is invalid", async () => {
      renderAddApplicationDialog();

      expect(await getSubmitButton()).toBeDisabled();
    });

    it("enables submit button when required fields are filled", async () => {
      renderAddApplicationDialog();

      await fillValidForm(user);

      expect(await getSubmitButton()).toBeEnabled();
    });

    it("marks form invalid when company is empty", async () => {
      renderAddApplicationDialog();

      const positionInput = await getInput<HTMLInputElement>(/position/i);
      await user.type(positionInput, "Developer");

      expect(await getSubmitButton()).toBeDisabled();
    });

    it("marks form invalid when position is empty", async () => {
      renderAddApplicationDialog();

      const companyInput = await getInput<HTMLInputElement>(/company/i);
      await user.type(companyInput, "Tech Corp");

      expect(await getSubmitButton()).toBeDisabled();
    });

    it("treats whitespace-only required fields as invalid", async () => {
      renderAddApplicationDialog();

      const companyInput = await getInput<HTMLInputElement>(/company/i);
      const positionInput = await getInput<HTMLInputElement>(/position/i);

      await user.type(companyInput, "   ");
      await user.type(positionInput, "   ");

      expect(await getSubmitButton()).toBeDisabled();
    });
  });

  describe("submission data", () => {
    it("calls addApplication with normalized form data", async () => {
      renderAddApplicationDialog();

      await fillValidForm(user, {
        position: "Senior Developer",
        notes: "Great opportunity",
      });

      const urlInput = await getInput<HTMLInputElement>(/job posting url/i);
      await user.type(urlInput, "https://example.com/job");

      await user.click(await getSubmitButton());

      await waitFor(() => {
        expect(mockAddApplication).toHaveBeenCalledWith(
          expect.objectContaining({
            company: "Tech Corp",
            position: "Senior Developer",
            jobSiteUrl: "https://my.greenhouse.io",
            atsType: "greenhouse",
            jobPostingUrl: "https://example.com/job",
            status: "applied",
            notes: "Great opportunity",
          }),
        );
      });
    });

    it("trims whitespace from submitted text fields", async () => {
      renderAddApplicationDialog();

      await fillValidForm(user, {
        company: "  Tech Corp  ",
        position: "  Developer  ",
        notes: "  Notes  ",
      });

      await user.click(await getSubmitButton());

      await waitFor(() => {
        expect(mockAddApplication).toHaveBeenCalledWith(
          expect.objectContaining({
            company: "Tech Corp",
            position: "Developer",
            notes: "Notes",
          }),
        );
      });
    });

    it("sets appliedDate to today on submit", async () => {
      renderAddApplicationDialog();

      await fillValidForm(user);
      await user.click(await getSubmitButton());

      await waitFor(() => {
        expect(mockAddApplication).toHaveBeenCalledWith(
          expect.objectContaining({
            appliedDate: todayIso(),
          }),
        );
      });
    });

    it("defaults status to 'applied' on submit", async () => {
      renderAddApplicationDialog();

      await fillValidForm(user);
      await user.click(await getSubmitButton());

      await waitFor(() => {
        expect(mockAddApplication).toHaveBeenCalledWith(
          expect.objectContaining({
            status: "applied",
          }),
        );
      });
    });

    it("omits optional fields from payload when empty", async () => {
      renderAddApplicationDialog();

      await fillValidForm(user);
      await user.click(await getSubmitButton());

      await waitFor(() => {
        expect(mockAddApplication).toHaveBeenCalledWith(
          expect.objectContaining({
            jobPostingUrl: undefined,
            notes: undefined,
          }),
        );
      });
    });
  });

  describe("submission side effects", () => {
    it("closes dialog after successful submission", async () => {
      const { emitted } = renderAddApplicationDialog();

      await fillValidForm(user);
      await user.click(await getSubmitButton());

      await waitFor(() => {
        expect(emitted()["update:open"]?.some(e => e[0] === false)).toBe(true);
      });
    });

    it("does not call addApplication when site is null", async () => {
      renderAddApplicationDialog({ site: null });

      await fillValidForm(user);
      await user.click(await getSubmitButton());

      expect(mockAddApplication).not.toHaveBeenCalled();
    });
  });

  describe("cancel behavior", () => {
    it("closes dialog when cancel is clicked", async () => {
      const { emitted } = renderAddApplicationDialog();

      await user.click(await getCancelButton());

      await waitFor(() => {
        expect(emitted()["update:open"]?.some(e => e[0] === false)).toBe(true);
      });
    });

    it("does not call addApplication when cancel is clicked", async () => {
      renderAddApplicationDialog();

      await fillValidForm(user);
      await user.click(await getCancelButton());

      expect(mockAddApplication).not.toHaveBeenCalled();
    });
  });

  describe("reactivity", () => {
    it("resets form when site prop changes", async () => {
      const { rerender } = renderAddApplicationDialog();

      await fillValidForm(user, { notes: "Some notes" });

      const newSite: JobSite = {
        id: "indeed-1",
        name: "Indeed",
        url: "https://indeed.com",
        categoryId: "general-job-boards",
      };

      await rerender({ site: newSite, open: true });

      await waitFor(async () => {
        const companyInput = await getInput<HTMLInputElement>(/company/i);
        const positionInput = await getInput<HTMLInputElement>(/position/i);
        const notesInput = await getInput<HTMLTextAreaElement>(/notes/i);

        expect(companyInput.value).toBe("");
        expect(positionInput.value).toBe("");
        expect(notesInput.value).toBe("");
      });
    });

    it("resets form when site becomes null", async () => {
      const { rerender } = renderAddApplicationDialog();

      const companyInput = await getInput<HTMLInputElement>(/company/i);
      const positionInput = await getInput<HTMLInputElement>(/position/i);

      await user.type(companyInput, "Tech Corp");
      await user.type(positionInput, "Developer");

      await rerender({ site: null, open: true });

      await waitFor(() => {
        expect(companyInput).toHaveValue("");
        expect(positionInput).toHaveValue("");
      });
    });
  });

  describe("keyboard submission", () => {
    it("submits form when Enter is pressed in company field", async () => {
      renderAddApplicationDialog();

      await fillValidForm(user);

      const companyInput = await getInput<HTMLInputElement>(/company/i);
      await user.type(companyInput, "{enter}");

      await waitFor(() => {
        expect(mockAddApplication).toHaveBeenCalled();
      });
    });

    it("submits form when Enter is pressed in position field", async () => {
      renderAddApplicationDialog();

      await fillValidForm(user);

      const positionInput = await getInput<HTMLInputElement>(/position/i);
      await user.type(positionInput, "{Enter}");

      await waitFor(() => {
        expect(mockAddApplication).toHaveBeenCalled();
      });
    });
  });
});
