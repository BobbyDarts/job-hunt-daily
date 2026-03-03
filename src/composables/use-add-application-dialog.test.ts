// /src/composables/use-add-application-dialog.test.ts

import { beforeEach, describe, expect, it } from "vitest";

import { useAddApplicationDialog } from "@/composables/use-add-application-dialog";
import { mockSites } from "@/test-utils/mocks";

describe("useAddApplicationDialog", () => {
  beforeEach(() => {
    const { closeDialog } = useAddApplicationDialog();
    closeDialog();
  });

  describe("initial state", () => {
    it("starts closed", () => {
      const { open } = useAddApplicationDialog();
      expect(open.value).toBe(false);
    });

    it("starts with no site", () => {
      const { site } = useAddApplicationDialog();
      expect(site.value).toBeNull();
    });
  });

  describe("openDialog", () => {
    it("opens the dialog", () => {
      const { open, openDialog } = useAddApplicationDialog();
      openDialog();
      expect(open.value).toBe(true);
    });

    it("opens with a site", () => {
      const { open, site, openDialog } = useAddApplicationDialog();
      openDialog(mockSites.greenhouse);
      expect(open.value).toBe(true);
      expect(site.value).toStrictEqual(mockSites.greenhouse);
    });

    it("opens with null site by default", () => {
      const { site, openDialog } = useAddApplicationDialog();
      openDialog();
      expect(site.value).toBeNull();
    });
  });

  describe("closeDialog", () => {
    it("closes the dialog", () => {
      const { open, openDialog, closeDialog } = useAddApplicationDialog();
      openDialog();
      closeDialog();
      expect(open.value).toBe(false);
    });

    it("clears the site on close", () => {
      const { site, openDialog, closeDialog } = useAddApplicationDialog();
      openDialog(mockSites.greenhouse);
      closeDialog();
      expect(site.value).toBeNull();
    });
  });

  describe("singleton behavior", () => {
    it("shares state across multiple calls", () => {
      const instance1 = useAddApplicationDialog();
      const instance2 = useAddApplicationDialog();

      instance1.openDialog(mockSites.workday);

      expect(instance2.open.value).toBe(true);
      expect(instance2.site.value).toStrictEqual(mockSites.workday);
    });
  });
});
