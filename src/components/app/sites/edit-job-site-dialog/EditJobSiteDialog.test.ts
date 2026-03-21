// /src/components/app/sites/edit-job-site-dialog/EditJobSiteDialog.test.ts

import userEvent from "@testing-library/user-event";
import { screen, waitFor } from "@testing-library/vue";
import { describe, it, expect, beforeEach, vi } from "vitest";

import { TooltipProvider } from "@/components/ui/tooltip";
import { mockSites } from "@/test-utils/mocks";
import { renderBaseWithProviders } from "@/test-utils/render-base";

import { EditJobSiteDialog, type EditJobSiteDialogProps } from ".";

const mockUpdateSite = vi.fn().mockResolvedValue(undefined);
const mockGetSiteByUrl = vi.fn().mockReturnValue(undefined);
const mockAddCategory = vi
  .fn()
  .mockResolvedValue({ id: "new-cat", name: "New" });

vi.mock("@/composables/data", () => ({
  useJobSites: () => ({
    updateSite: mockUpdateSite,
    getSiteByUrl: mockGetSiteByUrl,
    addCategory: mockAddCategory,
    categories: { value: [] },
  }),
}));

const DEFAULT_PROPS: EditJobSiteDialogProps = {
  open: true,
  site: mockSites.greenhouse,
};

function renderEditJobSiteDialog(
  overrides: Partial<EditJobSiteDialogProps> = {},
) {
  return renderBaseWithProviders(EditJobSiteDialog, DEFAULT_PROPS, overrides, {
    providers: [TooltipProvider],
    events: ["update:open"],
  });
}

describe("EditJobSiteDialog", () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    vi.clearAllMocks();
    user = userEvent.setup();
  });

  it("renders when open is true", async () => {
    renderEditJobSiteDialog();
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /edit job site/i }),
      ).toBeInTheDocument();
    });
  });

  it("does not render when open is false", () => {
    renderEditJobSiteDialog({ open: false });
    expect(screen.queryByText("Edit Job Site")).not.toBeInTheDocument();
  });

  it("populates name field with site name", async () => {
    renderEditJobSiteDialog();
    await waitFor(() => {
      expect(screen.getByLabelText(/name \*/i)).toHaveValue(
        mockSites.greenhouse.name,
      );
    });
  });

  it("populates url field with site url", async () => {
    renderEditJobSiteDialog();
    await waitFor(() => {
      expect(screen.getByLabelText(/url \*/i)).toHaveValue(
        mockSites.greenhouse.url,
      );
    });
  });

  it("shows URL validation error for invalid URL", async () => {
    renderEditJobSiteDialog();
    const urlInput = await screen.findByLabelText(/url \*/i);
    await user.clear(urlInput);
    await user.type(urlInput, "not-a-url");
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid url/i)).toBeInTheDocument();
    });
  });

  it("allows same URL as current site without duplicate error", async () => {
    renderEditJobSiteDialog();
    const urlInput = await screen.findByLabelText(/url \*/i);
    await user.clear(urlInput);
    await user.type(urlInput, mockSites.greenhouse.url);
    await user.tab();

    await waitFor(() => {
      expect(screen.queryByText(/url already exists/i)).not.toBeInTheDocument();
    });
  });

  it("shows duplicate URL error for a different existing site", async () => {
    mockGetSiteByUrl.mockReturnValue({ id: "other-site", name: "Other Site" });
    renderEditJobSiteDialog();
    const urlInput = await screen.findByLabelText(/url \*/i);
    await user.clear(urlInput);
    await user.type(urlInput, "https://other.com");
    await user.tab();

    await waitFor(() => {
      expect(
        screen.getByText(/url already exists as "other site"/i),
      ).toBeInTheDocument();
    });
  });

  it("calls updateSite on valid submission", async () => {
    renderEditJobSiteDialog();
    const nameInput = await screen.findByLabelText(/name \*/i);
    await user.clear(nameInput);
    await user.type(nameInput, "Updated Site Name");
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(mockUpdateSite).toHaveBeenCalledWith(
        mockSites.greenhouse.id,
        expect.objectContaining({ name: "Updated Site Name" }),
      );
    });
  });

  it("emits update:open false after submission", async () => {
    const { emitted } = renderEditJobSiteDialog();
    const nameInput = await screen.findByLabelText(/name \*/i);
    await user.clear(nameInput);
    await user.type(nameInput, "Updated Site Name");
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(
        emitted()["update:open"]?.some(e => (e as unknown[])[0] === false),
      ).toBe(true);
    });
  });

  it("emits update:open false when cancel is clicked", async () => {
    const { emitted } = renderEditJobSiteDialog();
    await user.click(await screen.findByRole("button", { name: /cancel/i }));

    await waitFor(() => {
      expect(
        emitted()["update:open"]?.some(e => (e as unknown[])[0] === false),
      ).toBe(true);
    });
  });

  it("does not call updateSite when site is null", async () => {
    renderEditJobSiteDialog({ site: null });
    expect(mockUpdateSite).not.toHaveBeenCalled();
  });
});
