// /src/composables/data/use-ats-detection.test.ts

import { describe, expect, it } from "vitest";

import { mockJobHuntData } from "@/test-utils/mocks";
import type { JobHuntData, JobSite } from "@/types";

import { useATSDetection } from "./use-ats-detection";

describe("useATSDetection", () => {
  describe("getATS", () => {
    it("returns ATSInfo for a Workday site", () => {
      const { getATS } = useATSDetection();
      const workdaySite = mockJobHuntData.categories[0].sites[0];

      const atsInfo = getATS(workdaySite);
      expect(atsInfo).toBeDefined();
      expect(atsInfo?.type).toBe("workday");
      expect(atsInfo?.initials).toBe("WD");
      expect(atsInfo?.classes).toContain("blue");
    });

    it("returns ATSInfo for a Greenhouse site", () => {
      const { getATS } = useATSDetection();
      const greenhouseSite = mockJobHuntData.categories[0].sites[1];

      const atsInfo = getATS(greenhouseSite);
      expect(atsInfo).toBeDefined();
      expect(atsInfo?.type).toBe("greenhouse");
      expect(atsInfo?.initials).toBe("GH");
      expect(atsInfo?.classes).toContain("green");
    });

    it("returns ATSInfo for a Lever site", () => {
      const { getATS } = useATSDetection();
      const leverSite = mockJobHuntData.categories[1].sites[0];

      const atsInfo = getATS(leverSite);
      expect(atsInfo).toBeDefined();
      expect(atsInfo?.type).toBe("lever");
      expect(atsInfo?.initials).toBe("LV");
      expect(atsInfo?.classes).toContain("purple");
    });

    it("returns ATSInfo for a BambooHR site", () => {
      const { getATS } = useATSDetection();
      const bambooSite = mockJobHuntData.categories[1].sites[1];

      const atsInfo = getATS(bambooSite);
      expect(atsInfo).toBeDefined();
      expect(atsInfo?.type).toBe("bamboohr");
      expect(atsInfo?.initials).toBe("BH");
      expect(atsInfo?.classes).toContain("orange");
    });

    it("returns undefined for non-ATS sites", () => {
      const { getATS } = useATSDetection();
      const regularSite = mockJobHuntData.categories[0].sites[2];

      const atsInfo = getATS(regularSite);
      expect(atsInfo).toBeUndefined();
    });

    it("returns undefined for sites without atsType or matching URL pattern", () => {
      const { getATS } = useATSDetection();
      const unknownSite: JobSite = {
        id: "unknown",
        name: "Unknown",
        url: "https://unknown.com/jobs",
      };

      const atsInfo = getATS(unknownSite);
      expect(atsInfo).toBeUndefined();
    });

    it("prioritizes explicit atsType over URL detection", () => {
      const siteWithExplicitType: JobSite = {
        id: "test-site",
        name: "Test Site",
        url: "https://example.com/careers", // No ATS pattern in URL
        atsType: "greenhouse", // But explicit type set
      };

      const { getATS } = useATSDetection();
      const atsInfo = getATS(siteWithExplicitType);

      expect(atsInfo).toBeDefined();
      expect(atsInfo?.type).toBe("greenhouse");
    });

    it("detects ATS from URL pattern when atsType not specified", () => {
      const siteWithWorkdayUrl: JobSite = {
        id: "test-workday",
        name: "Test Company",
        url: "https://test.wd5.myworkdayjobs.com/Careers",
        // No atsType specified
      };

      const { getATS } = useATSDetection();
      const atsInfo = getATS(siteWithWorkdayUrl);

      expect(atsInfo).toBeDefined();
      expect(atsInfo?.type).toBe("workday");
    });
  });

  describe("isATS", () => {
    it("returns true for Workday sites", () => {
      const { isATS } = useATSDetection();
      const workdaySite = mockJobHuntData.categories[0].sites[0];

      expect(isATS(workdaySite)).toBe(true);
    });

    it("returns true for Greenhouse sites", () => {
      const { isATS } = useATSDetection();
      const greenhouseSite = mockJobHuntData.categories[0].sites[1];

      expect(isATS(greenhouseSite)).toBe(true);
    });

    it("returns true for Lever sites", () => {
      const { isATS } = useATSDetection();
      const leverSite = mockJobHuntData.categories[1].sites[0];

      expect(isATS(leverSite)).toBe(true);
    });

    it("returns true for BambooHR sites", () => {
      const { isATS } = useATSDetection();
      const bambooSite = mockJobHuntData.categories[1].sites[1];

      expect(isATS(bambooSite)).toBe(true);
    });

    it("returns false for non-ATS sites", () => {
      const { isATS } = useATSDetection();
      const regularSite = mockJobHuntData.categories[0].sites[2];

      expect(isATS(regularSite)).toBe(false);
    });

    it("returns false for sites without ATS", () => {
      const { isATS } = useATSDetection();
      const unknownSite: JobSite = {
        id: "unknown",
        name: "Unknown",
        url: "https://unknown.com/jobs",
      };

      expect(isATS(unknownSite)).toBe(false);
    });

    it("returns true when explicit atsType is set", () => {
      const siteWithType: JobSite = {
        id: "test",
        name: "Test",
        url: "https://example.com",
        atsType: "greenhouse",
      };

      const { isATS } = useATSDetection();
      expect(isATS(siteWithType)).toBe(true);
    });

    it("returns true when URL pattern matches ATS", () => {
      const siteWithPattern: JobSite = {
        id: "test",
        name: "Test",
        url: "https://jobs.lever.co/company",
      };

      const { isATS } = useATSDetection();
      expect(isATS(siteWithPattern)).toBe(true);
    });
  });

  describe("manual atsType override", () => {
    it("respects manual atsType in job site data", () => {
      const dataWithOverride: JobHuntData = {
        categories: [
          {
            name: "Test",
            description: "Test category",
            sites: [
              {
                id: "override-test",
                name: "Override Test",
                url: "https://example.com/careers",
                atsType: "greenhouse", // Manual override
              },
            ],
          },
        ],
      };

      const { getATS, isATS } = useATSDetection();
      const site = dataWithOverride.categories[0].sites[0];

      expect(isATS(site)).toBe(true);
      expect(getATS(site)?.type).toBe("greenhouse");
    });

    it("uses atsType even if URL would suggest different ATS", () => {
      const siteWithOverride: JobSite = {
        id: "override",
        name: "Override",
        url: "https://company.wd5.myworkdayjobs.com/jobs", // Workday URL
        atsType: "greenhouse", // But marked as Greenhouse
      };

      const { getATS } = useATSDetection();
      const atsInfo = getATS(siteWithOverride);

      expect(atsInfo?.type).toBe("greenhouse"); // Should use explicit type
    });
  });

  describe("edge cases", () => {
    it("handles empty categories array", () => {
      const { getATS, isATS } = useATSDetection();

      const testSite: JobSite = {
        id: "test",
        name: "Test",
        url: "https://test.com",
      };
      expect(getATS(testSite)).toBeUndefined();
      expect(isATS(testSite)).toBe(false);
    });

    it("handles categories with no sites", () => {
      const { getATS, isATS } = useATSDetection();

      const testSite: JobSite = {
        id: "test",
        name: "Test",
        url: "https://test.com",
      };
      expect(getATS(testSite)).toBeUndefined();
      expect(isATS(testSite)).toBe(false);
    });

    it("works consistently for same site called multiple times", () => {
      const { getATS } = useATSDetection();
      const site = mockJobHuntData.categories[0].sites[0];

      const result1 = getATS(site);
      const result2 = getATS(site);

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
      expect(result1?.type).toBe(result2?.type);
    });
  });

  describe("ATSInfo structure", () => {
    it("returns complete ATSInfo with all required fields", () => {
      const { getATS } = useATSDetection();
      const workdaySite = mockJobHuntData.categories[0].sites[0];

      const atsInfo = getATS(workdaySite);
      expect(atsInfo).toHaveProperty("type");
      expect(atsInfo).toHaveProperty("patterns");
      expect(atsInfo).toHaveProperty("initials");
      expect(atsInfo).toHaveProperty("classes");
    });

    it("has correct color classes for each ATS type", () => {
      const { getATS } = useATSDetection();

      const workdayInfo = getATS(mockJobHuntData.categories[0].sites[0]);
      expect(workdayInfo?.classes).toContain("blue");

      const greenhouseInfo = getATS(mockJobHuntData.categories[0].sites[1]);
      expect(greenhouseInfo?.classes).toContain("green");

      const leverInfo = getATS(mockJobHuntData.categories[1].sites[0]);
      expect(leverInfo?.classes).toContain("purple");

      const bambooInfo = getATS(mockJobHuntData.categories[1].sites[1]);
      expect(bambooInfo?.classes).toContain("orange");
    });

    it("has correct initials for each ATS type", () => {
      const { getATS } = useATSDetection();

      expect(getATS(mockJobHuntData.categories[0].sites[0])?.initials).toBe(
        "WD",
      );
      expect(getATS(mockJobHuntData.categories[0].sites[1])?.initials).toBe(
        "GH",
      );
      expect(getATS(mockJobHuntData.categories[1].sites[0])?.initials).toBe(
        "LV",
      );
      expect(getATS(mockJobHuntData.categories[1].sites[1])?.initials).toBe(
        "BH",
      );
    });

    it("includes URL patterns in ATSInfo", () => {
      const { getATS } = useATSDetection();
      const workdaySite = mockJobHuntData.categories[0].sites[0];

      const atsInfo = getATS(workdaySite);
      expect(atsInfo?.patterns).toBeDefined();
      expect(Array.isArray(atsInfo?.patterns)).toBe(true);
      expect(atsInfo?.patterns.length).toBeGreaterThan(0);
    });
  });

  describe("URL pattern detection", () => {
    it("detects Workday from various URL formats", () => {
      const { getATS } = useATSDetection();

      const workdayUrls = [
        "https://company.wd1.myworkdayjobs.com/Careers",
        "https://company.wd5.myworkdayjobs.com/en-US/Jobs",
        "https://company.wd10.myworkdayjobs.com/External",
      ];

      workdayUrls.forEach(url => {
        const site: JobSite = { id: "test", name: "Test", url };
        const atsInfo = getATS(site);
        expect(atsInfo?.type).toBe("workday");
      });
    });

    it("detects Greenhouse from URL", () => {
      const { getATS } = useATSDetection();
      const site: JobSite = {
        id: "test",
        name: "Test",
        url: "https://boards.greenhouse.io/company",
      };

      expect(getATS(site)?.type).toBe("greenhouse");
    });

    it("detects Lever from URL", () => {
      const { getATS } = useATSDetection();
      const site: JobSite = {
        id: "test",
        name: "Test",
        url: "https://jobs.lever.co/company",
      };

      expect(getATS(site)?.type).toBe("lever");
    });

    it("detects BambooHR from URL", () => {
      const { getATS } = useATSDetection();
      const site: JobSite = {
        id: "test",
        name: "Test",
        url: "https://company.bamboohr.com/jobs",
      };

      expect(getATS(site)?.type).toBe("bamboohr");
    });
  });
});
