// /src/lib/application-utils.test.ts

import { describe, it, expect } from "vitest";

import { mockSites } from "@/test-utils/mocks";

import { buildApplicationPayload } from "./application-utils";

const baseContext = {
  jobSiteId: mockSites.greenhouse.id,
  jobSiteUrl: mockSites.greenhouse.url,
  atsType: mockSites.greenhouse.atsType,
  appliedDate: "2024-01-15",
  status: "applied" as const,
};

const baseFormData = {
  company: "Acme Corp",
  position: "Senior Developer",
  jobPostingUrl: "",
  notes: "",
  tags: [],
};

describe("buildApplicationPayload", () => {
  it("maps required fields from both formData and context", () => {
    const result = buildApplicationPayload(baseFormData, baseContext);

    expect(result.company).toBe("Acme Corp");
    expect(result.position).toBe("Senior Developer");
    expect(result.jobSiteId).toBe(mockSites.greenhouse.id);
    expect(result.jobSiteUrl).toBe(mockSites.greenhouse.url);
    expect(result.atsType).toBe("greenhouse");
    expect(result.appliedDate).toBe("2024-01-15");
    expect(result.status).toBe("applied");
  });

  it("trims whitespace from company and position", () => {
    const result = buildApplicationPayload(
      {
        ...baseFormData,
        company: "  Acme Corp  ",
        position: "  Senior Developer  ",
      },
      baseContext,
    );

    expect(result.company).toBe("Acme Corp");
    expect(result.position).toBe("Senior Developer");
  });

  it("converts empty jobPostingUrl to undefined", () => {
    const result = buildApplicationPayload(baseFormData, baseContext);
    expect(result.jobPostingUrl).toBeUndefined();
  });

  it("preserves jobPostingUrl when provided", () => {
    const result = buildApplicationPayload(
      { ...baseFormData, jobPostingUrl: "https://example.com/job/123" },
      baseContext,
    );
    expect(result.jobPostingUrl).toBe("https://example.com/job/123");
  });

  it("converts empty notes to undefined", () => {
    const result = buildApplicationPayload(baseFormData, baseContext);
    expect(result.notes).toBeUndefined();
  });

  it("preserves notes when provided", () => {
    const result = buildApplicationPayload(
      { ...baseFormData, notes: "Great company" },
      baseContext,
    );
    expect(result.notes).toBe("Great company");
  });

  it("converts empty tags array to undefined", () => {
    const result = buildApplicationPayload(baseFormData, baseContext);
    expect(result.tags).toBeUndefined();
  });

  it("preserves tags when provided", () => {
    const result = buildApplicationPayload(
      { ...baseFormData, tags: ["referral", "onsite"] },
      baseContext,
    );
    expect(result.tags).toEqual(["referral", "onsite"]);
  });

  it("returns a new tags array, not the original reference", () => {
    const tags = ["referral"] as const;
    const result = buildApplicationPayload(
      { ...baseFormData, tags: [...tags] },
      baseContext,
    );
    expect(result.tags).not.toBe(tags);
  });
});
