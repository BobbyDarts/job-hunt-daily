// /src/lib/generate-site-id.test.ts

import { describe, it, expect } from "vitest";

import { generateSiteId, ensureUniqueSiteIds } from "./generate-site-id";

describe("generateSiteId", () => {
  it("generates ID from ATS type and company name", () => {
    expect(generateSiteId("Acme Corp", "https://acme.com", "workday")).toBe(
      "workday-acme-corp",
    );
  });

  it("handles company names with special characters", () => {
    expect(generateSiteId("S&P Global", "https://sp.com", "greenhouse")).toBe(
      "greenhouse-s-p-global",
    );
    expect(generateSiteId("AT&T", "https://att.com", "workday")).toBe(
      "workday-at-t",
    );
  });

  it("handles company names with multiple words", () => {
    expect(
      generateSiteId("Blue Cross Blue Shield", "https://bcbs.com", "workday"),
    ).toBe("workday-blue-cross-blue-shield");
  });

  it("handles company names with apostrophes", () => {
    expect(generateSiteId("McDonald's", "https://mcdonalds.com", "lever")).toBe(
      "lever-mcdonald-s",
    );
  });

  it("converts to lowercase", () => {
    expect(generateSiteId("ACME CORP", "https://acme.com", "workday")).toBe(
      "workday-acme-corp",
    );
  });

  it("removes extra whitespace", () => {
    expect(
      generateSiteId("  Acme   Corp  ", "https://acme.com", "greenhouse"),
    ).toBe("greenhouse-acme-corp");
  });

  it("removes leading and trailing hyphens", () => {
    expect(generateSiteId("---Acme---", "https://acme.com", "workday")).toBe(
      "workday-acme",
    );
  });

  it("works without ATS type using domain", () => {
    expect(
      generateSiteId("Acme Corp", "https://acme.wd5.myworkdayjobs.com"),
    ).toBe("acme-acme-corp");
  });

  it("handles sites with no ATS and uses domain", () => {
    expect(
      generateSiteId("Custom Site", "https://customsite.com/careers"),
    ).toBe("customsite-custom-site");
  });

  it("falls back to name slug for invalid URLs", () => {
    expect(generateSiteId("Acme Corp", "not-a-url")).toBe("acme-corp");
  });

  it("handles empty company name", () => {
    expect(generateSiteId("", "https://test.com", "workday")).toBe("workday");
  });

  it("handles URLs with subdomains", () => {
    expect(
      generateSiteId("Acme", "https://careers.acme.com/jobs", "greenhouse"),
    ).toBe("greenhouse-acme");
  });

  it("extracts first subdomain as domain", () => {
    expect(generateSiteId("Test", "https://sub.domain.example.com")).toBe(
      "sub-test",
    );
  });

  it("handles URLs without protocol", () => {
    // Should fail to parse and fall back to name only
    expect(generateSiteId("Acme", "acme.com")).toBe("acme");
  });

  it("removes consecutive hyphens", () => {
    expect(generateSiteId("Acme & Co.", "https://acme.com", "workday")).toBe(
      "workday-acme-co",
    );
  });

  it("handles numeric characters in name", () => {
    expect(generateSiteId("3M Company", "https://3m.com", "workday")).toBe(
      "workday-3m-company",
    );
  });
});

describe("ensureUniqueSiteIds", () => {
  it("generates unique IDs for multiple sites", () => {
    const sites = [
      { name: "Acme Corp", url: "https://acme.com", atsType: "workday" },
      { name: "Beta Inc", url: "https://beta.com", atsType: "greenhouse" },
    ];

    const idMap = ensureUniqueSiteIds(sites);

    expect(idMap.size).toBe(2);
    expect(idMap.get("https://acme.com")).toBe("workday-acme-corp");
    expect(idMap.get("https://beta.com")).toBe("greenhouse-beta-inc");
  });

  it("handles duplicate IDs by appending numbers", () => {
    const sites = [
      { name: "Acme Corp", url: "https://acme1.com", atsType: "workday" },
      { name: "Acme Corp", url: "https://acme2.com", atsType: "workday" },
      { name: "Acme Corp", url: "https://acme3.com", atsType: "workday" },
    ];

    const idMap = ensureUniqueSiteIds(sites);

    expect(idMap.size).toBe(3);
    expect(idMap.get("https://acme1.com")).toBe("workday-acme-corp");
    expect(idMap.get("https://acme2.com")).toBe("workday-acme-corp-1");
    expect(idMap.get("https://acme3.com")).toBe("workday-acme-corp-2");
  });

  it("handles empty array", () => {
    const idMap = ensureUniqueSiteIds([]);
    expect(idMap.size).toBe(0);
  });

  it("handles sites with and without ATS types", () => {
    const sites = [
      { name: "Workday Site", url: "https://wd.com", atsType: "workday" },
      { name: "Custom Site", url: "https://custom.com/careers" },
    ];

    const idMap = ensureUniqueSiteIds(sites);

    expect(idMap.get("https://wd.com")).toBe("workday-workday-site");
    expect(idMap.get("https://custom.com/careers")).toBe("custom-custom-site");
  });

  it("maintains uniqueness across different ATS types", () => {
    const sites = [
      { name: "Same Company", url: "https://url1.com", atsType: "workday" },
      { name: "Same Company", url: "https://url2.com", atsType: "greenhouse" },
    ];

    const idMap = ensureUniqueSiteIds(sites);

    expect(idMap.get("https://url1.com")).toBe("workday-same-company");
    expect(idMap.get("https://url2.com")).toBe("greenhouse-same-company");
  });

  it("handles collision between ATS and non-ATS sites", () => {
    const sites = [
      { name: "Acme", url: "https://acme.wd5.myworkdayjobs.com" }, // will be "acme-acme"
      { name: "Acme", url: "https://careers.acme.com", atsType: "acme" }, // will be "acme-acme"
    ];

    const idMap = ensureUniqueSiteIds(sites);

    expect(idMap.size).toBe(2);
    // One should get base ID, other should get -1 suffix
    const ids = Array.from(idMap.values());
    expect(ids).toContain("acme-acme");
    expect(ids).toContain("acme-acme-1");
  });

  it("preserves URL to ID mapping", () => {
    const sites = [
      { name: "Test", url: "https://test1.com", atsType: "workday" },
      { name: "Test", url: "https://test2.com", atsType: "workday" },
    ];

    const idMap = ensureUniqueSiteIds(sites);

    // Each URL should map to exactly one ID
    expect(idMap.get("https://test1.com")).toBeDefined();
    expect(idMap.get("https://test2.com")).toBeDefined();
    expect(idMap.get("https://test1.com")).not.toBe(
      idMap.get("https://test2.com"),
    );
  });

  it("handles many duplicates", () => {
    const sites = Array.from({ length: 10 }, (_, i) => ({
      name: "Duplicate",
      url: `https://site${i}.com`,
      atsType: "workday",
    }));

    const idMap = ensureUniqueSiteIds(sites);

    expect(idMap.size).toBe(10);
    const ids = Array.from(idMap.values());

    // Should have base ID and numbered variants
    expect(ids).toContain("workday-duplicate");
    expect(ids).toContain("workday-duplicate-1");
    expect(ids).toContain("workday-duplicate-2");
    expect(ids).toContain("workday-duplicate-9");
  });

  it("returns map with URL as key", () => {
    const sites = [
      { name: "Test", url: "https://test.com", atsType: "workday" },
    ];
    const idMap = ensureUniqueSiteIds(sites);

    expect(idMap.has("https://test.com")).toBe(true);
  });

  it("generates deterministic IDs", () => {
    const sites = [
      { name: "Acme", url: "https://acme.com", atsType: "workday" },
      { name: "Beta", url: "https://beta.com", atsType: "greenhouse" },
    ];

    const idMap1 = ensureUniqueSiteIds(sites);
    const idMap2 = ensureUniqueSiteIds(sites);

    expect(idMap1.get("https://acme.com")).toBe(idMap2.get("https://acme.com"));
    expect(idMap1.get("https://beta.com")).toBe(idMap2.get("https://beta.com"));
  });
});
