// /src/types/index.ts

// ATS types
export type { ATSType } from "./ats";

// Job site types
export type { JobSite, JobCategory, JobHuntData } from "./job-sites";

// Application types
export type {
  ApplicationStatus,
  ApplicationStatusInfo,
  ApplicationTag,
  ApplicationTagCategory,
  ApplicationTagInfo,
  Application,
  ApplicationHistory,
} from "./applications";

export {
  getStatusInfo,
  getStatuses,
  getTagInfo,
  getTags,
  getTagsGroupedByCategory,
} from "./applications";

// Storage types
export type { VisitedSites } from "./storage";
