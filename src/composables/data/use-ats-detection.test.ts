// /src/composables/data/use-ats-detection.test.ts

import { describe, expect, it } from "vitest";

import { mockSites } from "@/test-utils/mocks";
import type { JobSite } from "@/types";

import { useATSDetection } from "./use-ats-detection";

describe("useATSDetection", () => {
  describe("getATS", () => {
    it("returns ATSInfo for a Workday site", () => {
      const { getATS } = useATSDetection();
      const atsInfo = getATS(mockSites.workday);
      expect(atsInfo).toBeDefined();
      expect(atsInfo?.type).toBe("workday");
      expect(atsInfo?.initials).toBe("WD");
      expect(atsInfo?.classes).toContain("blue");
    });

    it("returns ATSInfo for a Greenhouse site", () => {
      const { getATS } = useATSDetection();
      const atsInfo = getATS(mockSites.greenhouse);
      expect(atsInfo).toBeDefined();
      expect(atsInfo?.type).toBe("greenhouse");
      expect(atsInfo?.initials).toBe("GH");
      expect(atsInfo?.classes).toContain("green");
    });

    it("returns ATSInfo for a Lever site", () => {
      const { getATS } = useATSDetection();
      const atsInfo = getATS(mockSites.lever);
      expect(atsInfo).toBeDefined();
      expect(atsInfo?.type).toBe("lever");
      expect(atsInfo?.initials).toBe("LV");
      expect(atsInfo?.classes).toContain("purple");
    });

    it("returns ATSInfo for a BambooHR site", () => {
      const { getATS } = useATSDetection();
      const atsInfo = getATS(mockSites.bamboohr);
      expect(atsInfo).toBeDefined();
      expect(atsInfo?.type).toBe("bamboohr");
      expect(atsInfo?.initials).toBe("BH");
      expect(atsInfo?.classes).toContain("orange");
    });

    it("returns undefined for non-ATS sites", () => {
      const { getATS } = useATSDetection();
      expect(getATS(mockSites.regular)).toBeUndefined();
    });

    it("returns undefined for sites without atsType or matching URL pattern", () => {
      const { getATS } = useATSDetection();
      const unknownSite: JobSite = {
        id: "unknown",
        name: "Unknown",
        url: "https://unknown.com/jobs",
        categoryId: "test",
      };
      expect(getATS(unknownSite)).toBeUndefined();
    });

    it("prioritizes explicit atsType over URL detection", () => {
      const { getATS } = useATSDetection();
      const site: JobSite = {
        id: "test-site",
        name: "Test Site",
        url: "https://example.com/careers",
        categoryId: "test",
        atsType: "greenhouse",
      };
      expect(getATS(site)?.type).toBe("greenhouse");
    });

    it("detects ATS from URL pattern when atsType not specified", () => {
      const { getATS } = useATSDetection();
      const site: JobSite = {
        id: "test-workday",
        name: "Test Company",
        url: "https://test.wd5.myworkdayjobs.com/Careers",
        categoryId: "test",
      };
      expect(getATS(site)?.type).toBe("workday");
    });
  });

  describe("isATS", () => {
    it("returns true for Workday sites", () => {
      const { isATS } = useATSDetection();
      expect(isATS(mockSites.workday)).toBe(true);
    });

    it("returns true for Greenhouse sites", () => {
      const { isATS } = useATSDetection();
      expect(isATS(mockSites.greenhouse)).toBe(true);
    });

    it("returns true for Lever sites", () => {
      const { isATS } = useATSDetection();
      expect(isATS(mockSites.lever)).toBe(true);
    });

    it("returns true for BambooHR sites", () => {
      const { isATS } = useATSDetection();
      expect(isATS(mockSites.bamboohr)).toBe(true);
    });

    it("returns false for non-ATS sites", () => {
      const { isATS } = useATSDetection();
      expect(isATS(mockSites.regular)).toBe(false);
    });

    it("returns false for sites without ATS", () => {
      const { isATS } = useATSDetection();
      const unknownSite: JobSite = {
        id: "unknown",
        name: "Unknown",
        url: "https://unknown.com/jobs",
        categoryId: "test",
      };
      expect(isATS(unknownSite)).toBe(false);
    });

    it("returns true when explicit atsType is set", () => {
      const { isATS } = useATSDetection();
      const site: JobSite = {
        id: "test",
        name: "Test",
        url: "https://example.com",
        categoryId: "test",
        atsType: "greenhouse",
      };
      expect(isATS(site)).toBe(true);
    });

    it("returns true when URL pattern matches ATS", () => {
      const { isATS } = useATSDetection();
      const site: JobSite = {
        id: "test",
        name: "Test",
        url: "https://jobs.lever.co/company",
        categoryId: "test",
      };
      expect(isATS(site)).toBe(true);
    });
  });

  describe("manual atsType override", () => {
    it("respects manual atsType on a site", () => {
      const { getATS, isATS } = useATSDetection();
      const site: JobSite = {
        id: "override-test",
        name: "Override Test",
        url: "https://example.com/careers",
        categoryId: "test",
        atsType: "greenhouse",
      };
      expect(isATS(site)).toBe(true);
      expect(getATS(site)?.type).toBe("greenhouse");
    });

    it("uses atsType even if URL would suggest different ATS", () => {
      const { getATS } = useATSDetection();
      const site: JobSite = {
        id: "override",
        name: "Override",
        url: "https://company.wd5.myworkdayjobs.com/jobs",
        categoryId: "test",
        atsType: "greenhouse",
      };
      expect(getATS(site)?.type).toBe("greenhouse");
    });
  });

  describe("edge cases", () => {
    it("returns undefined for a plain site with no ATS signals", () => {
      const { getATS, isATS } = useATSDetection();
      const site: JobSite = {
        id: "test",
        name: "Test",
        url: "https://test.com",
        categoryId: "test",
      };
      expect(getATS(site)).toBeUndefined();
      expect(isATS(site)).toBe(false);
    });

    it("works consistently for same site called multiple times", () => {
      const { getATS } = useATSDetection();
      const result1 = getATS(mockSites.workday);
      const result2 = getATS(mockSites.workday);
      expect(result1?.type).toBe(result2?.type);
    });
  });

  describe("ATSInfo structure", () => {
    it("returns complete ATSInfo with all required fields", () => {
      const { getATS } = useATSDetection();
      const atsInfo = getATS(mockSites.workday);
      expect(atsInfo).toHaveProperty("type");
      expect(atsInfo).toHaveProperty("patterns");
      expect(atsInfo).toHaveProperty("initials");
      expect(atsInfo).toHaveProperty("classes");
    });

    it("has correct color classes for each ATS type", () => {
      const { getATS } = useATSDetection();
      expect(getATS(mockSites.workday)?.classes).toContain("blue");
      expect(getATS(mockSites.greenhouse)?.classes).toContain("green");
      expect(getATS(mockSites.lever)?.classes).toContain("purple");
      expect(getATS(mockSites.bamboohr)?.classes).toContain("orange");
    });

    it("has correct initials for each ATS type", () => {
      const { getATS } = useATSDetection();
      expect(getATS(mockSites.workday)?.initials).toBe("WD");
      expect(getATS(mockSites.greenhouse)?.initials).toBe("GH");
      expect(getATS(mockSites.lever)?.initials).toBe("LV");
      expect(getATS(mockSites.bamboohr)?.initials).toBe("BH");
    });

    it("includes URL patterns in ATSInfo", () => {
      const { getATS } = useATSDetection();
      const atsInfo = getATS(mockSites.workday);
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
        const site: JobSite = {
          id: "test",
          name: "Test",
          url,
          categoryId: "test",
        };
        expect(getATS(site)?.type).toBe("workday");
      });
    });

    it("detects Greenhouse from URL", () => {
      const { getATS } = useATSDetection();
      const site: JobSite = {
        id: "test",
        name: "Test",
        url: "https://boards.greenhouse.io/company",
        categoryId: "test",
      };
      expect(getATS(site)?.type).toBe("greenhouse");
    });

    it("detects Lever from URL", () => {
      const { getATS } = useATSDetection();
      const site: JobSite = {
        id: "test",
        name: "Test",
        url: "https://jobs.lever.co/company",
        categoryId: "test",
      };
      expect(getATS(site)?.type).toBe("lever");
    });

    it("detects BambooHR from URL", () => {
      const { getATS } = useATSDetection();
      const site: JobSite = {
        id: "test",
        name: "Test",
        url: "https://company.bamboohr.com/jobs",
        categoryId: "test",
      };
      expect(getATS(site)?.type).toBe("bamboohr");
    });
  });
});
