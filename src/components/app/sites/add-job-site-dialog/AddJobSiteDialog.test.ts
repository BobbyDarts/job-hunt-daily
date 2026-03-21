// /src/components/app/sites/add-job-site-dialog/AddJobSiteDialog.test.ts

import userEvent from "@testing-library/user-event";
import { fireEvent, screen, waitFor } from "@testing-library/vue";
import { describe, it, expect, beforeEach, vi } from "vitest";

import { TooltipProvider } from "@/components/ui/tooltip";
import { resetMocks, resolved, returned } from "@/test-utils/mocks";
import { renderBaseWithProviders } from "@/test-utils/render-base";

import { AddJobSiteDialog, type AddJobSiteDialogProps } from ".";

const mockAddSite = vi.fn().mockResolvedValue(undefined);
const mockGetSiteByUrl = vi.fn().mockReturnValue(undefined);

vi.mock("@/composables/data", () => ({
  useJobSites: () => ({
    addSite: mockAddSite,
    getSiteByUrl: mockGetSiteByUrl,
    categories: { value: [] },
  }),
}));

// 👇 Stub complex child components
vi.mock("@/components/app/lib", async () => {
  const actual = await vi.importActual<object>("@/components/app/lib");

  return {
    ...actual,
    CategorySelect: {
      template: `
    <select
      data-testid="category-select"
      :value="modelValue"
      @change="onChange"
    >
      <option value="">Select</option>
      <option value="general-job-boards">General</option>
    </select>
  `,
      props: ["modelValue"],
      emits: ["update:modelValue"],
      methods: {
        onChange(e) {
          this.$emit("update:modelValue", e.target.value);
        },
      },
    },
    ATSSelect: {
      template: `
        <select
          data-testid="ats-type-select"
          :value="modelValue"
          @change="$emit('update:modelValue', $event.target.value)"
        >
          <option value="">Select</option>
          <option value="example-ats">Example ATS</option>
          <option value="workday">Workday</option>
        </select>
      `,
      props: ["modelValue"],
      emits: ["update:modelValue"],
    },
  };
});

vi.mock("@/components/app/sites", async () => {
  const actual = await vi.importActual<object>("@/components/app/sites");

  return {
    ...actual,
    AddCategoryInline: {
      template: `<div><slot /></div>`,
    },
  };
});

// -------------------------
// Test setup
// -------------------------

const DEFAULT_PROPS: AddJobSiteDialogProps = {
  open: true,
  categoryId: null,
};

function renderAddJobSiteDialog(
  overrides: Partial<AddJobSiteDialogProps> = {},
) {
  return renderBaseWithProviders(AddJobSiteDialog, DEFAULT_PROPS, overrides, {
    providers: [TooltipProvider],
    events: ["update:open"],
  });
}

describe("AddJobSiteDialog", () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    resetMocks([resolved(mockAddSite), returned(mockGetSiteByUrl)]);
    user = userEvent.setup();
  });

  it("renders when open is true", async () => {
    renderAddJobSiteDialog();

    expect(
      await screen.findByRole("heading", { name: /add job site/i }),
    ).toBeInTheDocument();
  });

  it("does not render when open is false", () => {
    renderAddJobSiteDialog({ open: false });

    expect(
      screen.queryByRole("heading", { name: /add job site/i }),
    ).not.toBeInTheDocument();
  });

  it("renders all form fields", async () => {
    renderAddJobSiteDialog();

    expect(await screen.findByLabelText(/name \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/url \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
  });

  it("disables submit when required fields are empty", async () => {
    renderAddJobSiteDialog();

    const button = await screen.findByRole("button", {
      name: /add site/i,
    });

    expect(button).toBeDisabled();
  });

  it("shows URL validation error for invalid URL", async () => {
    renderAddJobSiteDialog();

    const urlInput = await screen.findByLabelText(/url \*/i);

    await user.type(urlInput, "not-a-url");
    await user.tab();

    expect(
      await screen.findByText(/please enter a valid url/i),
    ).toBeInTheDocument();
  });

  it("shows duplicate URL error when URL already exists", async () => {
    mockGetSiteByUrl.mockReturnValue({
      id: "existing",
      name: "Existing Site",
    });

    renderAddJobSiteDialog();

    const urlInput = await screen.findByLabelText(/url \*/i);

    await user.type(urlInput, "https://existing.com");
    await user.tab();

    expect(
      await screen.findByText(/url already exists as "existing site"/i),
    ).toBeInTheDocument();
  });

  it("enables submit button when required fields are filled", async () => {
    renderAddJobSiteDialog();

    await screen.findByRole("heading", { name: /add job site/i });

    expect(screen.getByRole("button", { name: /add site/i })).toBeDisabled();

    await user.type(screen.getByLabelText(/name \*/i), "My Site");

    const urlInput = screen.getByLabelText(/url \*/i);
    await user.type(urlInput, "https://example.com");

    await user.selectOptions(
      screen.getByTestId("category-select"),
      "general-job-boards",
    );

    await fireEvent.blur(urlInput);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /add site/i })).toBeEnabled();
    });
  });

  it("prevents submit if required fields are missing", async () => {
    renderAddJobSiteDialog();

    const nameInput = await screen.findByLabelText(/name \*/i);
    const urlInput = screen.getByLabelText(/url \*/i);

    await user.type(nameInput, "My Site");
    await user.type(urlInput, "https://mysite.com");

    await user.click(screen.getByRole("button", { name: /add site/i }));

    await waitFor(() => {
      expect(mockAddSite).not.toHaveBeenCalled();
    });
  });

  it("emits update:open false when cancel is clicked", async () => {
    const { emitted } = renderAddJobSiteDialog();

    await user.click(await screen.findByRole("button", { name: /cancel/i }));

    expect(emitted()["update:open"]?.some(e => e[0] === false)).toBe(true);
  });
});
