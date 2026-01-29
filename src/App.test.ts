import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { mountWithProviders } from "@/test-utils/mount-with-providers";

import App from "./App.vue";
import jobData from "./data/job-hunt-daily.json";

// Use raw data for test setup
const data = jobData;

describe("App.vue", () => {
  let openSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
  });

  afterEach(() => {
    openSpy.mockRestore();
  });

  describe("Rendering", () => {
    it("renders the main heading", () => {
      const wrapper = mountWithProviders(App);
      expect(wrapper.find("h1").text()).toBe("Job Hunt Daily");
    });

    it("displays progress indicator with count and percentage", () => {
      const wrapper = mountWithProviders(App);

      // Check for "X / Y" format
      expect(wrapper.text()).toMatch(/\d+ \/ \d+/);

      // Check for percentage
      expect(wrapper.text()).toMatch(/\d+%/);
    });

    it("renders all category headings from JSON data", () => {
      const wrapper = mountWithProviders(App);
      const categories = [
        "General Job Boards",
        "Tech & Startup Boards",
        "Remote-Focused Boards",
        "Company Career Pages",
        "Staffing & Recruiting Firms",
      ];

      categories.forEach(cat => {
        expect(wrapper.text()).toContain(cat);
      });
    });

    it("renders job site buttons", () => {
      const wrapper = mountWithProviders(App);
      const buttons = wrapper.findAll('[data-testid="job-site"]');

      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe("User Interactions", () => {
    it("opens job site in new tab when clicked", async () => {
      const wrapper = mountWithProviders(App);

      const button = wrapper.find('[data-testid="job-site"]');
      await button.trigger("click");

      expect(openSpy).toHaveBeenCalledTimes(1);
      expect(openSpy.mock.calls[0][1]).toBe("_blank");
      expect(openSpy.mock.calls[0][2]).toBe("noopener,noreferrer");
    });

    it("updates progress when site is clicked", async () => {
      const wrapper = mountWithProviders(App);

      // Get initial progress
      const initialText = wrapper.text();
      const initialMatch = initialText.match(/(\d+) \/ (\d+)/);
      expect(initialMatch).toBeTruthy();
      const initialVisited = parseInt(initialMatch![1]);

      // Click a site
      const button = wrapper.find('[data-testid="job-site"]');
      await button.trigger("click");
      await wrapper.vm.$nextTick();

      // Check progress updated
      const updatedText = wrapper.text();
      const updatedMatch = updatedText.match(/(\d+) \/ (\d+)/);
      const updatedVisited = parseInt(updatedMatch![1]);

      expect(updatedVisited).toBe(initialVisited + 1);
    });

    it("shows completion message when all sites are visited", async () => {
      const wrapper = mountWithProviders(App);
      await wrapper.vm.$nextTick();

      // Get all job site buttons
      const buttons = wrapper.findAll('[data-testid="job-site"]');
      expect(buttons.length).toBeGreaterThan(0);

      // Click all buttons to mark all sites as visited
      for (const button of buttons) {
        await button.trigger("click");
      }

      await wrapper.vm.$nextTick();

      // Should show checkmark when complete
      expect(wrapper.text()).toContain("✅");
    });
  });

  describe("Integration with localStorage", () => {
    it("persists visited sites to localStorage", async () => {
      const wrapper = mountWithProviders(App);

      const button = wrapper.find('[data-testid="job-site"]');
      await button.trigger("click");
      await wrapper.vm.$nextTick();

      const stored = localStorage.getItem("job-hunt-visited");
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      expect(parsed.visited).toHaveLength(1);
      expect(parsed.date).toBeTruthy();
    });

    it("loads and resets progress for a new day", () => {
      // Set up yesterday's data
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      localStorage.setItem(
        "job-hunt-visited",
        JSON.stringify({
          date: yesterdayStr,
          visited: ["https://example.com/jobs"],
        }),
      );

      const wrapper = mountWithProviders(App);

      // Should show 0 visited (reset for new day)
      expect(wrapper.text()).toMatch(/0 \/ \d+/);
    });

    it("loads existing progress for today", async () => {
      // Use raw data to get first site URL
      const firstSiteUrl = data.categories[0].sites[0].url;

      // Set up today's data with the real URL
      const today = new Date().toISOString().split("T")[0];
      localStorage.setItem(
        "job-hunt-visited",
        JSON.stringify({
          date: today,
          visited: [firstSiteUrl],
        }),
      );

      // Mount with the localStorage data
      const wrapper = mountWithProviders(App);
      await wrapper.vm.$nextTick();

      const text = wrapper.text();
      const match = text.match(/(\d+) \/ (\d+)/);
      expect(match).toBeTruthy();

      const visitedCount = parseInt(match![1]);
      expect(visitedCount).toBe(1);
    });
  });

  describe("ATS Integration", () => {
    it("displays ATS badges for sites with ATS", () => {
      const wrapper = mountWithProviders(App);

      const atsBadges = wrapper.findAll('[data-testid="ats-badge"]');

      // Should have at least some ATS badges
      expect(atsBadges.length).toBeGreaterThan(0);
    });
  });
});
