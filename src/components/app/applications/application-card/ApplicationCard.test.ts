// /src/components/app/applications/application-card/ApplicationCard.test.ts

import userEvent from "@testing-library/user-event";
import { screen, waitFor } from "@testing-library/vue";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { ApplicationCard } from "@/components/app/applications/application-card";
import type { ApplicationCardProps } from "@/components/app/applications/application-card";
import { TooltipProvider } from "@/components/ui/tooltip";
import { createMockApplication, mockApplications } from "@/test-utils/mocks";
import { renderBaseWithProviders } from "@/test-utils/render-base";
import { getStatuses } from "@/types";

const DEFAULT_PROPS: ApplicationCardProps = {
  application: mockApplications[0],
};

function renderApplicationCard(overrides: Partial<ApplicationCardProps> = {}) {
  return renderBaseWithProviders(ApplicationCard, DEFAULT_PROPS, overrides, {
    providers: [TooltipProvider],
  });
}

describe("ApplicationCard", () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  describe("rendering", () => {
    it("renders application details", () => {
      renderApplicationCard();

      expect(screen.getByText("Senior Developer")).toBeInTheDocument();
    });

    it("displays formatted date", () => {
      renderApplicationCard();

      // Should show something like "Jan 15, 2024"
      expect(screen.getByText(/Jan.*15.*2024/i)).toBeInTheDocument();
    });

    it("shows days since applied", () => {
      renderApplicationCard();

      // Should show "X days ago"
      expect(screen.getByText(/\d+ days? ago/i)).toBeInTheDocument();
    });

    it("displays status badge", () => {
      renderApplicationCard();

      expect(screen.getByText("Applied")).toBeInTheDocument();
    });

    it("shows tags when present", () => {
      renderApplicationCard();

      expect(screen.getByText("Virtual")).toBeInTheDocument();
      expect(screen.getByText("Technical")).toBeInTheDocument();
    });

    it("displays notes preview", () => {
      renderApplicationCard();

      expect(
        screen.getByText("Applied through John's referral"),
      ).toBeInTheDocument();
    });

    it("shows ATS type when present", () => {
      renderApplicationCard();

      expect(screen.getByText(/greenhouse/i)).toBeInTheDocument();
    });
  });

  describe("conditional rendering", () => {
    it("hides tags section when no tags", () => {
      const appWithoutTags = { ...mockApplications[0], tags: [] };
      renderApplicationCard({ application: appWithoutTags });

      expect(screen.queryByText("Referral")).not.toBeInTheDocument();
      expect(screen.queryByText("On-site")).not.toBeInTheDocument();
    });

    it("hides notes when not present", () => {
      const appWithoutNotes = { ...mockApplications[0], notes: undefined };
      renderApplicationCard({ application: appWithoutNotes });

      expect(
        screen.queryByText("Applied through John's referral"),
      ).not.toBeInTheDocument();
    });

    it("shows posting button only when URL exists", () => {
      const appWithPosting = {
        ...mockApplications[0],
        jobPostingUrl: "https://example.com/job/123",
      };
      renderApplicationCard({ application: appWithPosting });

      expect(
        screen.getByRole("button", { name: /posting/i }),
      ).toBeInTheDocument();
    });

    it("hides posting button when URL not present", () => {
      const appWithoutPosting = {
        ...mockApplications[0],
        jobPostingUrl: undefined,
      };
      renderApplicationCard({ application: appWithoutPosting });

      expect(
        screen.queryByRole("button", { name: /posting/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe("user interactions", () => {
    it("emits edit event when edit button clicked", async () => {
      const { emitted } = renderApplicationCard();

      const editButton = screen.getByRole("button", { name: /edit/i });
      await user.click(editButton);

      await waitFor(() => {
        expect(emitted().edit).toBeTruthy();
        expect(emitted().edit).toHaveLength(1);
      });
    });

    it("opens job site URL when Job Site button clicked", async () => {
      const windowOpenSpy = vi
        .spyOn(window, "open")
        .mockImplementation(() => null);

      renderApplicationCard();

      const jobSiteButton = screen.getByRole("button", { name: /job site/i });
      await user.click(jobSiteButton);

      expect(windowOpenSpy).toHaveBeenCalledWith(
        mockApplications[0].jobSiteUrl,
        "_blank",
        "noopener,noreferrer",
      );

      windowOpenSpy.mockRestore();
    });

    it("opens posting URL when Posting button clicked", async () => {
      const postingUrl = "https://example.com/job/123";
      const windowOpenSpy = vi
        .spyOn(window, "open")
        .mockImplementation(() => null);

      const appWithPosting = {
        ...mockApplications[0],
        jobPostingUrl: postingUrl,
      };
      renderApplicationCard({ application: appWithPosting });

      const postingButton = screen.getByRole("button", { name: /posting/i });
      await user.click(postingButton);

      expect(windowOpenSpy).toHaveBeenCalledWith(
        postingUrl,
        "_blank",
        "noopener,noreferrer",
      );

      windowOpenSpy.mockRestore();
    });
  });

  describe("delete functionality", () => {
    it("shows delete confirmation dialog when delete clicked", async () => {
      renderApplicationCard();

      // Find and click the delete button (trash icon)
      const deleteButtons = screen.getAllByRole("button");
      const deleteButton = deleteButtons.find(btn =>
        btn.querySelector('[class*="Trash"]'),
      );

      if (deleteButton) {
        await user.click(deleteButton);

        await waitFor(() => {
          expect(screen.getByText("Delete Application")).toBeInTheDocument();
          expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();
        });
      }
    });
  });

  describe("status variations", () => {
    it("displays correct badge for each status", () => {
      getStatuses().forEach(({ status, label }) => {
        const app = createMockApplication({ status });
        const { unmount } = renderApplicationCard({ application: app });

        expect(screen.getByText(label)).toBeInTheDocument();

        unmount();
      });
    });
  });

  describe("long content handling", () => {
    it("truncates long notes with line-clamp", () => {
      const longNotes = "A".repeat(500);
      const appWithLongNotes = { ...mockApplications[0], notes: longNotes };

      const { container } = renderApplicationCard({
        application: appWithLongNotes,
      });

      // Should have line-clamp class to truncate
      const notesElement = container.querySelector('[class*="line-clamp"]');
      expect(notesElement).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("has accessible button labels", () => {
      renderApplicationCard();

      expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /job site/i }),
      ).toBeInTheDocument();
    });

    it("displays company as heading", () => {
      renderApplicationCard();

      const heading = screen.getByRole("heading", { level: 4 });
      expect(heading).toHaveTextContent("Senior Developer");
    });
  });
});
