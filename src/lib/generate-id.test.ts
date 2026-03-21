// /src/lib/generate-id.test.ts

import { describe, it, expect } from "vitest";

import {
  generateSiteId,
  generateCategoryId,
  ensureUniqueSiteIds,
} from "./generate-id";

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

  it("uses name slug when name and domain are related", () => {
    // "acme-corp" normalized is "acmecorp", "acme" normalized is "acme"
    // domainNormalized.includes(nameNormalized) is false
    // nameNormalized.includes(domainNormalized) is true → use nameSlug
    expect(generateSiteId("Acme Corp", "https://acme.com")).toBe("acme-corp");
  });

  it("uses name slug when domain contains name", () => {
    // "custom-site" normalized is "customsite", "customsite" normalized is "customsite"
    // nameNormalized.includes(domainNormalized) → true → use nameSlug
    expect(
      generateSiteId("Custom Site", "https://customsite.com/careers"),
    ).toBe("custom-site");
  });

  it("uses domain prefix when name and domain are unrelated", () => {
    // "myworkdayjobs" does not contain "acmecorp" and vice versa
    expect(
      generateSiteId("Acme Corp", "https://acme.wd5.myworkdayjobs.com"),
    ).toBe("myworkdayjobs-acme-corp");
  });

  it("falls back to name slug for invalid URLs", () => {
    expect(generateSiteId("Acme Corp", "not-a-url")).toBe("acme-corp");
  });

  it("handles empty company name", () => {
    expect(generateSiteId("", "https://test.com", "workday")).toBe("workday");
  });

  it("handles URLs with subdomains — uses second-to-last domain segment", () => {
    // "careers.acme.com" → at(-2) = "acme", name "Acme" contains "acme" → "acme"
    expect(
      generateSiteId("Acme", "https://careers.acme.com/jobs", "greenhouse"),
    ).toBe("greenhouse-acme");
  });

  it("extracts second-to-last segment for multi-part domains", () => {
    // "sub.domain.example.com" → at(-2) = "example"
    // "test" does not contain "example" and vice versa → "example-test"
    expect(generateSiteId("Test", "https://sub.domain.example.com")).toBe(
      "example-test",
    );
  });

  it("handles URLs without protocol", () => {
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

  it("uses name slug when domain is substring of name (dataman case)", () => {
    // "dataman" normalized is "dataman", "datamanusa" normalized is "datamanusa"
    // domainNormalized.includes(nameNormalized) → true → use nameSlug
    expect(generateSiteId("Dataman", "https://www.datamanusa.com/jobs")).toBe(
      "dataman",
    );
  });

  it("uses name slug when name and domain match after normalization (robert half case)", () => {
    // "robert-half" normalized is "roberthalf", "roberthalf" normalized is "roberthalf"
    // nameNormalized.includes(domainNormalized) → true → use nameSlug
    expect(
      generateSiteId("Robert Half", "https://www.roberthalf.com/jobs"),
    ).toBe("robert-half");
  });
});

describe("generateCategoryId", () => {
  it("slugifies a simple category name", () => {
    expect(generateCategoryId("General Job Boards")).toBe("general-job-boards");
  });

  it("handles special characters", () => {
    expect(generateCategoryId("Tech & Startup Boards")).toBe(
      "tech-startup-boards",
    );
  });

  it("handles already-lowercase input", () => {
    expect(generateCategoryId("remote-focused boards")).toBe(
      "remote-focused-boards",
    );
  });

  it("strips leading and trailing hyphens", () => {
    expect(generateCategoryId("---Category---")).toBe("category");
  });

  it("returns unknown for empty string", () => {
    expect(generateCategoryId("")).toBe("unknown");
  });

  it("handles nonprofit and mission-driven category", () => {
    expect(generateCategoryId("Nonprofit & Mission-Driven")).toBe(
      "nonprofit-mission-driven",
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
    // "custom-site" normalized matches "custom" → use nameSlug
    expect(idMap.get("https://custom.com/careers")).toBe("custom-site");
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
      { name: "Acme", url: "https://acme.wd5.myworkdayjobs.com" }, // "myworkdayjobs-acme"
      { name: "Acme", url: "https://careers.acme.com" }, // "acme"
    ];

    const idMap = ensureUniqueSiteIds(sites);

    expect(idMap.size).toBe(2);
    expect(idMap.get("https://acme.wd5.myworkdayjobs.com")).toBe(
      "myworkdayjobs-acme",
    );
    expect(idMap.get("https://careers.acme.com")).toBe("acme");
  });

  it("preserves URL to ID mapping", () => {
    const sites = [
      { name: "Test", url: "https://test1.com", atsType: "workday" },
      { name: "Test", url: "https://test2.com", atsType: "workday" },
    ];

    const idMap = ensureUniqueSiteIds(sites);

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
