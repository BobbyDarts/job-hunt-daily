// /src/test-utils/mocks.ts

import { vi, type Mock } from "vitest";

import type { ATSInfo } from "@/lib/ats-detection";
import { toInstant, toPlainDate } from "@/lib/time";
import type { Application, JobCategory, JobSite, JobHuntData } from "@/types";

// ============================================================================
// Job Sites
// ============================================================================

export const mockSites = {
  greenhouse: {
    id: "greenhouse-greenhouse-company",
    name: "Greenhouse Company",
    url: "https://my.greenhouse.io",
    categoryId: "tech-companies",
    atsType: "greenhouse" as const,
    createdAt: toInstant("2024-01-15T12:00:00Z").toString(),
    updatedAt: toInstant("2024-01-15T12:00:00Z").toString(),
  },
  workday: {
    id: "workday-workday-company",
    name: "Workday Company",
    url: "https://company.wd1.myworkdayjobs.com/jobs",
    categoryId: "tech-companies",
    atsType: "workday" as const,
    createdAt: toInstant("2024-01-15T12:00:00Z").toString(),
    updatedAt: toInstant("2024-01-15T12:00:00Z").toString(),
  },
  lever: {
    id: "lever-lever-company",
    name: "Lever Company",
    url: "https://jobs.lever.co/company",
    categoryId: "startups",
    atsType: "lever" as const,
    createdAt: toInstant("2024-01-15T12:00:00Z").toString(),
    updatedAt: toInstant("2024-01-15T12:00:00Z").toString(),
  },
  bamboohr: {
    id: "bamboohr-bamboohr-company",
    name: "BambooHR Company",
    url: "https://company.bamboohr.com/jobs",
    categoryId: "startups",
    atsType: "bamboohr" as const,
    createdAt: toInstant("2024-01-15T12:00:00Z").toString(),
    updatedAt: toInstant("2024-01-15T12:00:00Z").toString(),
  },
  regular: {
    id: "regular-site",
    name: "Regular Site",
    url: "https://example.com/careers",
    categoryId: "tech-companies",
    createdAt: toInstant("2024-01-15T12:00:00Z").toString(),
    updatedAt: toInstant("2024-01-15T12:00:00Z").toString(),
  },
  zebra: {
    id: "zebra-corp",
    name: "Zebra Corp",
    url: "https://zebra.com/careers",
    categoryId: "tech-companies",
    createdAt: toInstant("2024-01-15T12:00:00Z").toString(),
    updatedAt: toInstant("2024-01-15T12:00:00Z").toString(),
  },
  alpha: {
    id: "alpha-inc",
    name: "Alpha Inc",
    url: "https://alpha.com/jobs",
    categoryId: "tech-companies",
    createdAt: toInstant("2024-01-15T12:00:00Z").toString(),
    updatedAt: toInstant("2024-01-15T12:00:00Z").toString(),
  },
  delta: {
    id: "delta-company",
    name: "Delta Company",
    url: "https://delta.com/careers",
    categoryId: "small-category",
    createdAt: toInstant("2024-01-15T12:00:00Z").toString(),
    updatedAt: toInstant("2024-01-15T12:00:00Z").toString(),
  },
  siteA: {
    id: "sitea",
    name: "Site A",
    url: "https://a.com",
    categoryId: "test-category",
    createdAt: toInstant("2024-01-15T12:00:00Z").toString(),
    updatedAt: toInstant("2024-01-15T12:00:00Z").toString(),
  },
  siteB: {
    id: "siteb",
    name: "Site B",
    url: "https://b.com",
    categoryId: "test-category",
    createdAt: toInstant("2024-01-15T12:00:00Z").toString(),
    updatedAt: toInstant("2024-01-15T12:00:00Z").toString(),
  },
} satisfies Record<string, JobSite>;

export const mockSite = mockSites.greenhouse;

// ============================================================================
// Job Categories
// ============================================================================

export const mockCategories = {
  techCompanies: {
    id: "tech-companies",
    name: "Tech Companies",
    description: "Technology company career pages",
    createdAt: toInstant("2024-01-15T12:00:00Z").toString(),
    updatedAt: toInstant("2024-01-15T12:00:00Z").toString(),
  },
  startups: {
    id: "startups",
    name: "Startups",
    description: "Startup company listings",
    createdAt: toInstant("2024-01-15T12:00:00Z").toString(),
    updatedAt: toInstant("2024-01-15T12:00:00Z").toString(),
  },
  smallCategory: {
    id: "small-category",
    name: "Small Category",
    description: "Small companies",
    createdAt: toInstant("2024-01-15T12:00:00Z").toString(),
    updatedAt: toInstant("2024-01-15T12:00:00Z").toString(),
  },
  testCategory: {
    id: "test-category",
    name: "Test Category",
    createdAt: toInstant("2024-01-15T12:00:00Z").toString(),
    updatedAt: toInstant("2024-01-15T12:00:00Z").toString(),
  },
} satisfies Record<string, JobCategory>;

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
  sites: [
    mockSites.workday,
    mockSites.greenhouse,
    mockSites.regular,
    mockSites.zebra,
    mockSites.alpha,
    mockSites.lever,
    mockSites.bamboohr,
    mockSites.delta,
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

export function createMockSite(overrides: Partial<JobSite> = {}): JobSite {
  return {
    ...mockSites.siteA,
    ...overrides,
  };
}

export function createMockApplication(
  overrides: Partial<Application> = {},
): Application {
  return {
    ...mockApplications[0],
    ...overrides,
  };
}

type MockResetConfig =
  | { mock: Mock; type: "resolved"; value?: unknown }
  | { mock: Mock; type: "return"; value?: unknown }
  | { mock: Mock; type: "implementation"; fn: (...args: unknown[]) => unknown };

export const resolved = (mock: Mock, value?: unknown): MockResetConfig => ({
  mock,
  type: "resolved",
  value,
});

export const returned = (mock: Mock, value?: unknown): MockResetConfig => ({
  mock,
  type: "return",
  value,
});

export const implementation = (
  mock: Mock,
  fn: (...args: unknown[]) => unknown,
): MockResetConfig => ({
  mock,
  type: "implementation",
  fn,
});

export function resetMocks(configs: MockResetConfig[] = []) {
  vi.resetAllMocks();

  for (const config of configs) {
    switch (config.type) {
      case "resolved":
        config.mock.mockResolvedValue(config.value);
        break;

      case "return":
        config.mock.mockReturnValue(config.value);
        break;

      case "implementation":
        config.mock.mockImplementation(config.fn);
        break;
    }
  }
}
