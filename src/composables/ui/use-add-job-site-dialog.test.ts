// /src/composables/ui/use-add-job-site-dialog.test.ts

import { beforeEach, describe, expect, it } from "vitest";

import { useAddJobSiteDialog } from ".";

describe("useAddJobSiteDialog", () => {
  beforeEach(() => {
    const { closeDialog } = useAddJobSiteDialog();
    closeDialog();
  });

  describe("initial state", () => {
    it("starts closed", () => {
      const { open } = useAddJobSiteDialog();
      expect(open.value).toBe(false);
    });

    it("starts with no category", () => {
      const { category } = useAddJobSiteDialog();
      expect(category.value).toBeNull();
    });
  });

  describe("openDialog", () => {
    it("opens the dialog", () => {
      const { open, openDialog } = useAddJobSiteDialog();
      openDialog();
      expect(open.value).toBe(true);
    });

    it("opens with a categoryId", () => {
      const { open, category, openDialog } = useAddJobSiteDialog();
      openDialog("general-job-boards");
      expect(open.value).toBe(true);
      expect(category.value).toBe("general-job-boards");
    });

    it("opens with null category by default", () => {
      const { category, openDialog } = useAddJobSiteDialog();
      openDialog();
      expect(category.value).toBeNull();
    });
  });

  describe("closeDialog", () => {
    it("closes the dialog", () => {
      const { open, openDialog, closeDialog } = useAddJobSiteDialog();
      openDialog();
      closeDialog();
      expect(open.value).toBe(false);
    });

    it("clears the category on close", () => {
      const { category, openDialog, closeDialog } = useAddJobSiteDialog();
      openDialog("general-job-boards");
      closeDialog();
      expect(category.value).toBeNull();
    });
  });

  describe("singleton behavior", () => {
    it("shares state across multiple calls", () => {
      const instance1 = useAddJobSiteDialog();
      const instance2 = useAddJobSiteDialog();

      instance1.openDialog("tech-startup-boards");

      expect(instance2.open.value).toBe(true);
      expect(instance2.category.value).toBe("tech-startup-boards");
    });
  });
});
