// /src/test-utils/mocks.ts

import type { ATSInfo } from "@/lib/ats-detection";
import { toInstant, toPlainDate } from "@/lib/time";
import type { Application, JobCategory, JobSite, JobHuntData } from "@/types";

// ============================================================================
// Job Sites
// ============================================================================

export const mockSites = {
  greenhouse: {
    id: "greenhouse-company",
    name: "Greenhouse Company",
    url: "https://my.greenhouse.io",
    atsType: "greenhouse" as const,
  },
  workday: {
    id: "workday-company",
    name: "Workday Company",
    url: "https://company.wd1.myworkdayjobs.com/jobs",
    atsType: "workday" as const,
  },
  lever: {
    id: "lever-company",
    name: "Lever Company",
    url: "https://jobs.lever.co/company",
    atsType: "lever" as const,
  },
  bamboohr: {
    id: "bamboohr-company",
    name: "BambooHR Company",
    url: "https://company.bamboohr.com/jobs",
    atsType: "bamboohr" as const,
  },
  regular: {
    id: "regular-company",
    name: "Regular Site",
    url: "https://example.com/careers",
  },
  zebra: {
    id: "zebra-corp",
    name: "Zebra Corp",
    url: "https://zebra.com/careers",
  },
  alpha: {
    id: "alpha-inc",
    name: "Alpha Inc",
    url: "https://alpha.com/jobs",
  },
  delta: {
    id: "delta-company",
    name: "Delta Company",
    url: "https://delta.com/careers",
  },
  siteA: {
    id: "sitea",
    name: "Site A",
    url: "https://a.com",
  },
  siteB: {
    id: "siteb",
    name: "Site B",
    url: "https://b.com",
  },
} satisfies Record<string, JobSite>;

// Legacy exports for backward compatibility
export const mockSite = mockSites.greenhouse;

// ============================================================================
// Job Categories
// ============================================================================

export const mockCategories = {
  techCompanies: {
    name: "Tech Companies",
    description: "Technology company career pages",
    sites: [
      mockSites.workday,
      mockSites.greenhouse,
      mockSites.regular,
      mockSites.zebra,
      mockSites.alpha,
    ],
  },
  startups: {
    name: "Startups",
    description: "Startup company listings",
    sites: [mockSites.lever, mockSites.bamboohr],
  },
  smallCategory: {
    name: "Small Category",
    description: "Small companies",
    sites: [mockSites.delta],
  },
  testCategory: {
    name: "Test Category",
    sites: [mockSites.siteA, mockSites.siteB],
  },
} satisfies Record<string, JobCategory>;

// Legacy export for backward compatibility
export const mockCategory = mockCategories.testCategory;

// ============================================================================
// Job Hunt Data
// ============================================================================

export const mockJobHuntData: JobHuntData = {
  categories: [
    mockCategories.techCompanies,
    mockCategories.startups,
    mockCategories.smallCategory,
  ],
};

// ============================================================================
// ATS Info
// ============================================================================

export const mockATSInfo: ATSInfo = {
  type: "greenhouse",
  initials: "GH",
  classes: "bg-green-500 text-white",
  patterns: ["greenhouse.io"],
};

// ============================================================================
// Applications
// ============================================================================

export const mockApplications: Application[] = [
  {
    id: "1",
    company: "Acme Corp",
    position: "Senior Developer",
    status: "applied",
    jobSiteId: mockSites.greenhouse.id,
    jobSiteUrl: mockSites.greenhouse.url,
    atsType: "greenhouse",
    appliedDate: toPlainDate("2024-01-15").toString(),
    tags: ["virtual", "technical"],
    notes: "Applied through John's referral",
    createdAt: toInstant("2024-01-15T12:00:00Z").toString(),
    updatedAt: toInstant("2024-01-15T12:00:00Z").toString(),
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create a custom JobSite for testing
 */
export function createMockSite(overrides: Partial<JobSite> = {}): JobSite {
  return {
    ...mockSites.siteA,
    ...overrides,
  };
}

/**
 * Create a custom Application for testing
 */
export function createMockApplication(
  overrides: Partial<Application> = {},
): Application {
  return {
    ...mockApplications[0],
    ...overrides,
  };
}
