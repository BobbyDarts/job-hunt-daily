// /src/composables/ui/use-site-focus.test.ts

import { beforeEach, describe, expect, it, vi } from "vitest";

import { useSiteFocus } from "@/composables/ui";
import { mockSites } from "@/test-utils/mocks";

function makeFocusableEl(): HTMLElement {
  const el = document.createElement("div");
  el.tabIndex = 0;
  el.focus = vi.fn();
  document.body.appendChild(el);
  return el;
}

describe("useSiteFocus", () => {
  beforeEach(() => {
    const { clear } = useSiteFocus();
    clear();
  });

  describe("register / unregister", () => {
    it("registers an element", () => {
      const { register, focusNext } = useSiteFocus();
      const el = makeFocusableEl();
      register(el, mockSites.greenhouse);
      focusNext();
      expect(el.focus).toHaveBeenCalled();
    });

    it("unregisters an element", () => {
      const { register, unregister, focusNext } = useSiteFocus();
      const el = makeFocusableEl();
      register(el, mockSites.greenhouse);
      unregister(el);
      focusNext();
      expect(el.focus).not.toHaveBeenCalled();
    });

    it("unregistering unknown element does nothing", () => {
      const { unregister } = useSiteFocus();
      const el = makeFocusableEl();
      expect(() => unregister(el)).not.toThrow();
    });
  });

  describe("focusNext", () => {
    it("does nothing when no elements registered", () => {
      const { focusNext } = useSiteFocus();
      expect(() => focusNext()).not.toThrow();
    });

    it("focuses first element on first call", () => {
      const { register, focusNext } = useSiteFocus();
      const el1 = makeFocusableEl();
      const el2 = makeFocusableEl();
      register(el1, mockSites.greenhouse);
      register(el2, mockSites.workday);
      focusNext();
      expect(el1.focus).toHaveBeenCalled();
      expect(el2.focus).not.toHaveBeenCalled();
    });

    it("advances focus on successive calls", () => {
      const { register, focusNext } = useSiteFocus();
      const el1 = makeFocusableEl();
      const el2 = makeFocusableEl();
      register(el1, mockSites.greenhouse);
      register(el2, mockSites.workday);
      focusNext();
      focusNext();
      expect(el2.focus).toHaveBeenCalled();
    });

    it("wraps around to first element", () => {
      const { register, focusNext } = useSiteFocus();
      const el1 = makeFocusableEl();
      const el2 = makeFocusableEl();
      register(el1, mockSites.greenhouse);
      register(el2, mockSites.workday);
      focusNext();
      focusNext();
      focusNext();
      expect(el1.focus).toHaveBeenCalledTimes(2);
    });

    it("sets focusedSite", () => {
      const { register, focusNext, focusedSite } = useSiteFocus();
      const el = makeFocusableEl();
      register(el, mockSites.greenhouse);
      focusNext();
      expect(focusedSite.value).toStrictEqual(mockSites.greenhouse);
    });
  });

  describe("focusPrev", () => {
    it("does nothing when no elements registered", () => {
      const { focusPrev } = useSiteFocus();
      expect(() => focusPrev()).not.toThrow();
    });

    it("wraps around to last element from start", () => {
      const { register, focusPrev } = useSiteFocus();
      const el1 = makeFocusableEl();
      const el2 = makeFocusableEl();
      register(el1, mockSites.greenhouse);
      register(el2, mockSites.workday);
      focusPrev();
      expect(el2.focus).toHaveBeenCalled();
    });

    it("moves focus backward", () => {
      const { register, focusNext, focusPrev } = useSiteFocus();
      const el1 = makeFocusableEl();
      const el2 = makeFocusableEl();
      register(el1, mockSites.greenhouse);
      register(el2, mockSites.workday);
      focusNext();
      focusNext();
      focusPrev();
      expect(el1.focus).toHaveBeenCalledTimes(2);
    });

    it("sets focusedSite", () => {
      const { register, focusNext, focusPrev, focusedSite } = useSiteFocus();
      const el1 = makeFocusableEl();
      const el2 = makeFocusableEl();
      register(el1, mockSites.greenhouse);
      register(el2, mockSites.workday);
      focusNext();
      focusNext();
      focusPrev();
      expect(focusedSite.value).toStrictEqual(mockSites.greenhouse);
    });
  });

  describe("clear", () => {
    it("resets focusedSite", () => {
      const { register, focusNext, focusedSite, clear } = useSiteFocus();
      const el = makeFocusableEl();
      register(el, mockSites.greenhouse);
      focusNext();
      clear();
      expect(focusedSite.value).toBeNull();
    });

    it("prevents further focus after clear", () => {
      const { register, focusNext, clear } = useSiteFocus();
      const el = makeFocusableEl();
      register(el, mockSites.greenhouse);
      focusNext();
      clear();
      focusNext();
      expect(el.focus).toHaveBeenCalledTimes(1);
    });
  });

  describe("unregister index management", () => {
    it("adjusts focusedIndex when element before focused is removed", () => {
      const { register, unregister, focusNext, focusedSite } = useSiteFocus();
      const el1 = makeFocusableEl();
      const el2 = makeFocusableEl();
      const el3 = makeFocusableEl();
      register(el1, mockSites.greenhouse);
      register(el2, mockSites.workday);
      register(el3, mockSites.lever);
      focusNext();
      focusNext();
      // focused on el2 (index 1)
      unregister(el1); // remove element before focused
      focusNext(); // should move to el3
      expect(el3.focus).toHaveBeenCalled();
      expect(focusedSite.value).toStrictEqual(mockSites.lever);
    });

    it("handles removal of focused element", () => {
      const { register, unregister, focusNext, focusedSite } = useSiteFocus();
      const el1 = makeFocusableEl();
      const el2 = makeFocusableEl();
      register(el1, mockSites.greenhouse);
      register(el2, mockSites.workday);
      focusNext(); // focus el1
      unregister(el1); // remove focused element
      expect(focusedSite.value).toStrictEqual(mockSites.workday); // clamps to el2
    });
  });
});
