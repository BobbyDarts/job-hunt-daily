import { describe, expect, it } from "vitest";
import { h } from "vue";

import { mountWithProviders } from "@/test-utils/mount-with-providers";

import { Header } from ".";

const defaultProps = {
  props: {
    title: "Job Hunt Daily",
    visitedCount: 3,
    totalSites: 5,
    progress: 60,
    isComplete: false,
  },
  providers: [], // no providers needed right now, but consistent pattern
};

describe("Header", () => {
  it("renders the title", () => {
    const wrapper = mountWithProviders(Header, defaultProps);
    expect(wrapper.text()).toContain("Job Hunt Daily");
  });

  it("renders numeric progress when not complete", () => {
    const wrapper = mountWithProviders(Header, defaultProps);
    expect(wrapper.text()).toContain("3 / 5");
    expect(wrapper.text()).toContain("60%");
  });

  it("renders checkmark when complete", () => {
    const wrapper = mountWithProviders(Header, {
      ...defaultProps,
      props: { ...defaultProps.props, isComplete: true },
    });
    expect(wrapper.text()).toContain("✅");
    expect(wrapper.text()).not.toContain("3 / 5");
    expect(wrapper.text()).not.toContain("60%");
  });

  it("hides numeric progress when complete", () => {
    const wrapper = mountWithProviders(Header, {
      ...defaultProps,
      props: { ...defaultProps.props, isComplete: true },
    });
    const numericProgress = wrapper.find("span.min-w-12");
    expect(numericProgress.exists()).toBe(false);
  });

  it("renders actions slot if provided", () => {
    const actionsContent = () => h("button", {}, "Settings");
    const wrapper = mountWithProviders(Header, {
      ...defaultProps,
      slots: { actions: actionsContent },
    });

    const actionButton = wrapper.find("button");
    expect(actionButton.exists()).toBe(true);
    expect(actionButton.text()).toBe("Settings");
  });

  it("renders correctly without actions slot", () => {
    const wrapper = mountWithProviders(Header, defaultProps);
    const actionButton = wrapper.find("button");
    expect(actionButton.exists()).toBe(false);
  });
});
