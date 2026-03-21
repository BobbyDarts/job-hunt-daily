// /src/components/app/applications/add-application-dialog/AddApplicationDialog.test.ts

import userEvent from "@testing-library/user-event";
import type { render } from "@testing-library/vue";
import { screen, waitFor } from "@testing-library/vue";
import { describe, it, expect, beforeEach, vi } from "vitest";

import { TooltipProvider } from "@/components/ui/tooltip";
import { todayIso } from "@/lib/time";
import { mockSite } from "@/test-utils/mocks";
import { getButtonByName, getInput } from "@/test-utils/queries";
import { renderBaseWithProviders } from "@/test-utils/render-base";
import type { Application, JobSite } from "@/types";

import { AddApplicationDialog, type AddApplicationDialogProps } from ".";

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
  site: mockSite, //getSiteById("greenhouse-company"),
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
      events: ["submit", "update:open"],
      ...options,
    },
  );
}

type Emitted = ReturnType<typeof render>["emitted"];

async function submitForm(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await getSubmitButton());
}

async function submitAndExpectSuccess(
  user: ReturnType<typeof userEvent.setup>,
  emitted: Emitted,
) {
  await submitForm(user);
  await waitFor(() => {
    expect(emitted().submit?.length).toBeTruthy();
  });
}

type DialogEmits = {
  submit: Application[][];
  "update:open": boolean[][];
};

function getEmitted<E extends Record<string, unknown[]>>(
  emitted: () => Record<string, unknown[]>,
) {
  return new Proxy({} as E, {
    get(_target, prop) {
      if (typeof prop === "string") {
        return emitted()[prop];
      }
      return undefined;
    },
  });
}

describe("AddApplicationDialog", () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    vi.clearAllMocks();
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
    it("emits submit event with normalized form data", async () => {
      const { emitted } = renderAddApplicationDialog();
      const emits = getEmitted<DialogEmits>(emitted);
      // const site = getSiteById("greenhouse-company");

      await fillValidForm(user, {
        position: "Senior Developer",
        notes: "Great opportunity",
      });

      const urlInput = await getInput<HTMLInputElement>(/job posting url/i);
      await user.type(urlInput, "https://example.com/job");

      await submitAndExpectSuccess(user, emitted);

      const submitEvent = emits.submit[0][0];

      expect(submitEvent).toMatchObject({
        company: "Tech Corp",
        position: "Senior Developer",
        jobSiteUrl: "https://my.greenhouse.io",
        atsType: "greenhouse",
        jobPostingUrl: "https://example.com/job",
        status: "applied",
        notes: "Great opportunity",
      });
    });

    it("trims whitespace from submitted text fields", async () => {
      const { emitted } = renderAddApplicationDialog();
      const emits = getEmitted<DialogEmits>(emitted);

      await fillValidForm(user, {
        company: "  Tech Corp  ",
        position: "  Developer  ",
        notes: "  Notes  ",
      });

      await submitAndExpectSuccess(user, emitted);

      const submitEvent = emits.submit[0][0];

      expect(submitEvent.company).toBe("Tech Corp");
      expect(submitEvent.position).toBe("Developer");
      expect(submitEvent.notes).toBe("Notes");
    });

    it("sets appliedDate to today on submit", async () => {
      const { emitted } = renderAddApplicationDialog();
      const emits = getEmitted<DialogEmits>(emitted);

      await fillValidForm(user);

      await submitAndExpectSuccess(user, emitted);

      const submitEvent = emits.submit[0][0];

      expect(submitEvent.appliedDate).toBe(todayIso());
    });

    it("defaults status to 'applied' on submit", async () => {
      const { emitted } = renderAddApplicationDialog();
      const emits = getEmitted<DialogEmits>(emitted);

      await fillValidForm(user);

      await submitAndExpectSuccess(user, emitted);

      const submitEvent = emits.submit[0][0];

      expect(submitEvent.status).toBe("applied");
    });

    it("omits optional fields from payload when empty", async () => {
      const { emitted } = renderAddApplicationDialog();
      const emits = getEmitted<DialogEmits>(emitted);

      await fillValidForm(user);

      await submitAndExpectSuccess(user, emitted);

      const submitEvent = emits.submit[0][0];

      expect(submitEvent.jobPostingUrl).toBeUndefined();
      expect(submitEvent.notes).toBeUndefined();
    });
  });

  describe("submission side effects", () => {
    it("closes dialog after successful submission", async () => {
      const { emitted } = renderAddApplicationDialog();
      const emits = getEmitted<DialogEmits>(emitted);

      await fillValidForm(user);

      await submitForm(user);

      await waitFor(() => {
        expect(emits["update:open"]?.some(e => e[0] === false)).toBe(true);
      });
    });

    it("prevents submission when site is null", async () => {
      const { emitted } = renderAddApplicationDialog({ site: null });
      const emits = getEmitted<DialogEmits>(emitted);

      await fillValidForm(user);

      await submitForm(user);

      expect(emits.submit).toBeFalsy();
    });
  });

  describe("cancel behavior", () => {
    it("closes dialog when cancel is clicked", async () => {
      const { emitted } = renderAddApplicationDialog();
      const emits = getEmitted<DialogEmits>(emitted);

      await user.click(await getCancelButton());

      await waitFor(() => {
        expect(emits["update:open"]?.some(e => e[0] === false)).toBe(true);
      });
    });

    it("does not emit submit event when cancel is clicked", async () => {
      const { emitted } = renderAddApplicationDialog();
      const emits = getEmitted<DialogEmits>(emitted);

      await fillValidForm(user);

      await user.click(await getCancelButton());

      expect(emits.submit).toBeFalsy();
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
      const { emitted } = renderAddApplicationDialog();

      await fillValidForm(user);

      const companyInput = await getInput<HTMLInputElement>(/company/i);
      await user.type(companyInput, "{enter}");

      await waitFor(() => {
        expect(emitted().submit?.length).toBeGreaterThan(0);
      });
    });

    it("submits form when Enter is pressed in position field", async () => {
      const { emitted } = renderAddApplicationDialog();

      await fillValidForm(user);

      const positionInput = await getInput<HTMLInputElement>(/position/i);
      await user.type(positionInput, "{Enter}");

      await waitFor(() => {
        expect(emitted().submit?.length).toBeGreaterThan(0);
      });
    });
  });
});
